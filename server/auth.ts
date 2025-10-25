import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { Express, RequestHandler } from 'express';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { storage } from './storage';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const SALT_ROUNDS = 12;

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export async function registerUser(userData: RegisterRequest) {
  const { email, password, firstName, lastName } = userData;

  console.log('🔐 [AUTH] Starting registration for:', email);
  
  try {
    console.log('🔐 [AUTH] Checking if user exists...');
    const existingUser = await storage.getUserByEmail(email);
    console.log('🔐 [AUTH] User check completed');
    
    if (existingUser) {
      console.log('❌ [AUTH] User already exists');
      throw new Error('User already exists with this email');
    }

    console.log('🔐 [AUTH] Hashing password...');
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    console.log('✅ [AUTH] Password hashed');

    console.log('🔐 [AUTH] Creating user in database...');
    const user = await storage.upsertUser({
      id: generateUserId(),
      email,
      firstName,
      lastName,
      profileImageUrl: null,
      passwordHash: hashedPassword,
    });
    
    console.log('✅ [AUTH] User created successfully:', user.id);
    return user;
  } catch (error) {
    console.log('❌ [AUTH] Registration error:', error);
    throw error;
  }
}

export async function loginUser(credentials: LoginRequest) {
  const { email, password } = credentials;

  // Find user by email
  const user = await storage.getUserByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check if user has password hash (new auth system)
  if (!user.passwordHash) {
    throw new Error('Please use the password reset feature to set a password');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  return user;
}

export function generateToken(userId: string): string {
  return jwt.sign(
    {
      userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    },
    JWT_SECRET
  );
}

export function verifyToken(token: string): { userId: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function setupAuth(app: Express) {
  console.log('🔧 [AUTH] setupAuth called - starting authentication setup');
  
  app.set('trust proxy', 1);
  app.use(getSession());

  // Parse JSON bodies
  app.use(express.json());

  console.log('🔧 [AUTH] Setting up auth routes...');

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    console.log('✅ [AUTH] /api/auth/register route hit!', req.body);
    try {
      const user = await registerUser(req.body);
      const token = generateToken(user.id);

      console.log('✅ [AUTH] Registration successful for:', user.email);
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
        },
        token
      });
    } catch (error: any) {
      console.log('❌ [AUTH] Register endpoint error:', error.message);
      res.status(400).json({ message: error.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    console.log('✅ [AUTH] /api/auth/login route hit!', req.body);
    try {
      const user = await loginUser(req.body);
      const token = generateToken(user.id);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
        },
        token
      });
    } catch (error: any) {
      console.log('❌ [AUTH] Login endpoint error:', error.message);
      res.status(401).json({ message: error.message });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    console.log('✅ [AUTH] /api/auth/logout route hit!');
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  console.log('🔧 [AUTH] Setting up token verification middleware...');

  // Token verification middleware
  app.use(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = verifyToken(token);
        const user = await storage.getUser(decoded.userId);

        if (user) {
          (req as any).user = {
            id: user.id,
            claims: {
              sub: user.id,
              email: user.email,
              first_name: user.firstName,
              last_name: user.lastName,
            }
          };
        }
      } catch (error) {
        // Token is invalid, continue without user
      }
    }
    next();
  });

  console.log('✅ [AUTH] Authentication setup complete');
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!(req as any).user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};