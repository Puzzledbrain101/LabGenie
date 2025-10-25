var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import { config as config2 } from "dotenv";
import express4 from "express";

// server/routes.ts
import express2 from "express";
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  insertLabRecordSchema: () => insertLabRecordSchema,
  insertSectionImageSchema: () => insertSectionImageSchema,
  insertSectionSchema: () => insertSectionSchema,
  insertUserPreferencesSchema: () => insertUserPreferencesSchema,
  labRecords: () => labRecords,
  labRecordsRelations: () => labRecordsRelations,
  sectionImages: () => sectionImages,
  sectionImagesRelations: () => sectionImagesRelations,
  sections: () => sections,
  sectionsRelations: () => sectionsRelations,
  sessions: () => sessions,
  userPreferences: () => userPreferences,
  userPreferencesRelations: () => userPreferencesRelations,
  users: () => users
});
import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  passwordHash: text("password_hash"),
  // ADDED: For password authentication
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var labRecords = pgTable("lab_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  templateType: varchar("template_type", { length: 50 }).notNull(),
  // 'physics', 'chemistry', 'computer'
  customization: jsonb("customization"),
  // stores font, theme, layout, colors, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var labRecordsRelations = relations(labRecords, ({ one, many }) => ({
  user: one(users, {
    fields: [labRecords.userId],
    references: [users.id]
  }),
  sections: many(sections)
}));
var insertLabRecordSchema = createInsertSchema(labRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var sections = pgTable("sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  labRecordId: varchar("lab_record_id").notNull().references(() => labRecords.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull().default(""),
  order: integer("order").notNull(),
  isHidden: boolean("is_hidden").notNull().default(false),
  sectionType: varchar("section_type", { length: 50 }).notNull(),
  // 'text', 'code', 'student_details'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var sectionsRelations = relations(sections, ({ one, many }) => ({
  labRecord: one(labRecords, {
    fields: [sections.labRecordId],
    references: [labRecords.id]
  }),
  images: many(sectionImages)
}));
var insertSectionSchema = createInsertSchema(sections).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var sectionImages = pgTable("section_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sectionId: varchar("section_id").notNull().references(() => sections.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  alignment: varchar("alignment", { length: 20 }).notNull().default("center"),
  // 'left', 'center', 'right'
  width: integer("width").notNull().default(100),
  // percentage 25, 50, 75, 100
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var sectionImagesRelations = relations(sectionImages, ({ one }) => ({
  section: one(sections, {
    fields: [sectionImages.sectionId],
    references: [sections.id]
  })
}));
var insertSectionImageSchema = createInsertSchema(sectionImages).omit({
  id: true,
  createdAt: true
});
var userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  language: varchar("language", { length: 10 }).notNull().default("en"),
  // 'en', 'de', 'es'
  defaultFont: varchar("default_font", { length: 50 }).default("Inter"),
  defaultTheme: varchar("default_theme", { length: 50 }).default("academic"),
  updatedAt: timestamp("updated_at").defaultNow()
});
var userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id]
  })
}));
var insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  updatedAt: true
});

// server/db.ts
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
config();
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var client = postgres(process.env.DATABASE_URL);
var db = drizzle(client, { schema: schema_exports });

// server/storage.ts
import { eq, and, desc } from "drizzle-orm";
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      // FIXED: This should work now with the schema
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  // Lab Record operations
  async getLabRecords(userId) {
    return await db.select().from(labRecords).where(eq(labRecords.userId, userId)).orderBy(desc(labRecords.updatedAt));
  }
  async getLabRecord(id, userId) {
    const [record] = await db.select().from(labRecords).where(and(eq(labRecords.id, id), eq(labRecords.userId, userId)));
    return record;
  }
  async createLabRecord(record) {
    const [newRecord] = await db.insert(labRecords).values(record).returning();
    return newRecord;
  }
  async updateLabRecord(id, userId, updates) {
    const [updated] = await db.update(labRecords).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(labRecords.id, id), eq(labRecords.userId, userId))).returning();
    return updated;
  }
  async deleteLabRecord(id, userId) {
    const result = await db.delete(labRecords).where(and(eq(labRecords.id, id), eq(labRecords.userId, userId))).returning();
    return result.length > 0;
  }
  async duplicateLabRecord(id, userId) {
    const original = await this.getLabRecord(id, userId);
    if (!original) return void 0;
    const [newRecord] = await db.insert(labRecords).values({
      userId: original.userId,
      title: `${original.title} (Copy)`,
      templateType: original.templateType,
      customization: original.customization
    }).returning();
    const originalSections = await this.getSections(id);
    for (const section of originalSections) {
      await db.insert(sections).values({
        labRecordId: newRecord.id,
        title: section.title,
        content: section.content,
        order: section.order,
        // FIXED: This should work with the schema
        isHidden: section.isHidden,
        sectionType: section.sectionType
      });
    }
    return newRecord;
  }
  // Section operations
  async getSections(labRecordId) {
    return await db.select().from(sections).where(eq(sections.labRecordId, labRecordId)).orderBy(sections.order);
  }
  async getSection(id) {
    const [section] = await db.select().from(sections).where(eq(sections.id, id));
    return section;
  }
  async createSection(section) {
    const [newSection] = await db.insert(sections).values(section).returning();
    return newSection;
  }
  async updateSection(id, updates) {
    const [updated] = await db.update(sections).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(sections.id, id)).returning();
    return updated;
  }
  async deleteSection(id) {
    const result = await db.delete(sections).where(eq(sections.id, id)).returning();
    return result.length > 0;
  }
  async updateSectionsOrder(labRecordId, sectionOrders) {
    for (const { id, order } of sectionOrders) {
      await db.update(sections).set({ order, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(sections.id, id), eq(sections.labRecordId, labRecordId)));
    }
  }
  // Section Image operations
  async getSectionImages(sectionId) {
    return await db.select().from(sectionImages).where(eq(sectionImages.sectionId, sectionId)).orderBy(sectionImages.order);
  }
  async createSectionImage(image) {
    const [newImage] = await db.insert(sectionImages).values(image).returning();
    return newImage;
  }
  async deleteSectionImage(id) {
    const result = await db.delete(sectionImages).where(eq(sectionImages.id, id)).returning();
    return result.length > 0;
  }
  // User Preferences operations
  async getUserPreferences(userId) {
    const [prefs] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
    return prefs;
  }
  async upsertUserPreferences(prefsData) {
    const [prefs] = await db.insert(userPreferences).values(prefsData).onConflictDoUpdate({
      target: userPreferences.userId,
      // FIXED: This should work now
      set: {
        ...prefsData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return prefs;
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPg from "connect-pg-simple";
var JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
var SALT_ROUNDS = 12;
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl
    }
  });
}
async function registerUser(userData) {
  const { email, password, firstName, lastName } = userData;
  const existingUser = await storage.getUserByEmail(email);
  if (existingUser) {
    throw new Error("User already exists with this email");
  }
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await storage.upsertUser({
    id: generateUserId(),
    email,
    firstName,
    lastName,
    profileImageUrl: null,
    passwordHash: hashedPassword
  });
  return user;
}
async function loginUser(credentials) {
  const { email, password } = credentials;
  const user = await storage.getUserByEmail(email);
  if (!user) {
    throw new Error("Invalid email or password");
  }
  if (!user.passwordHash) {
    throw new Error("Please use the password reset feature to set a password");
  }
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw new Error("Invalid email or password");
  }
  return user;
}
function generateToken(userId) {
  return jwt.sign(
    {
      userId,
      iat: Math.floor(Date.now() / 1e3),
      exp: Math.floor(Date.now() / 1e3) + 7 * 24 * 60 * 60
      // 7 days
    },
    JWT_SECRET
  );
}
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
}
function generateUserId() {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(express.json());
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const user = await registerUser(req.body);
      const token = generateToken(user.id);
      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl
        },
        token
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const user = await loginUser(req.body);
      const token = generateToken(user.id);
      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl
        },
        token
      });
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.use(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const decoded = verifyToken(token);
        const user = await storage.getUser(decoded.userId);
        if (user) {
          req.user = {
            id: user.id,
            claims: {
              sub: user.id,
              email: user.email,
              first_name: user.firstName,
              last_name: user.lastName
            }
          };
        }
      } catch (error) {
      }
    }
    next();
  });
}
var isAuthenticated = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

// server/routes.ts
import multer from "multer";
import path from "path";
var upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  }
});
async function registerRoutes(app2) {
  await setupAuth(app2);
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/lab-records", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const records = await storage.getLabRecords(userId);
      res.json(records);
    } catch (error) {
      console.error("Error fetching lab records:", error);
      res.status(500).json({ message: "Failed to fetch lab records" });
    }
  });
  app2.get("/api/lab-records/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const record = await storage.getLabRecord(req.params.id, userId);
      if (!record) {
        return res.status(404).json({ message: "Lab record not found" });
      }
      res.json(record);
    } catch (error) {
      console.error("Error fetching lab record:", error);
      res.status(500).json({ message: "Failed to fetch lab record" });
    }
  });
  app2.post("/api/lab-records", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertLabRecordSchema.parse({
        ...req.body,
        userId
      });
      const record = await storage.createLabRecord(validatedData);
      res.status(201).json(record);
    } catch (error) {
      console.error("Error creating lab record:", error);
      res.status(400).json({ message: "Invalid request data" });
    }
  });
  app2.patch("/api/lab-records/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const updated = await storage.updateLabRecord(req.params.id, userId, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Lab record not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating lab record:", error);
      res.status(500).json({ message: "Failed to update lab record" });
    }
  });
  app2.delete("/api/lab-records/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const deleted = await storage.deleteLabRecord(req.params.id, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Lab record not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting lab record:", error);
      res.status(500).json({ message: "Failed to delete lab record" });
    }
  });
  app2.post("/api/lab-records/:id/duplicate", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const duplicated = await storage.duplicateLabRecord(req.params.id, userId);
      if (!duplicated) {
        return res.status(404).json({ message: "Lab record not found" });
      }
      res.status(201).json(duplicated);
    } catch (error) {
      console.error("Error duplicating lab record:", error);
      res.status(500).json({ message: "Failed to duplicate lab record" });
    }
  });
  app2.get("/api/lab-records/:labRecordId/sections", isAuthenticated, async (req, res) => {
    try {
      const sections2 = await storage.getSections(req.params.labRecordId);
      res.json(sections2);
    } catch (error) {
      console.error("Error fetching sections:", error);
      res.status(500).json({ message: "Failed to fetch sections" });
    }
  });
  app2.post("/api/lab-records/:labRecordId/sections", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertSectionSchema.parse({
        ...req.body,
        labRecordId: req.params.labRecordId
      });
      const section = await storage.createSection(validatedData);
      res.status(201).json(section);
    } catch (error) {
      console.error("Error creating section:", error);
      res.status(400).json({ message: "Invalid request data" });
    }
  });
  app2.patch("/api/sections/:id", isAuthenticated, async (req, res) => {
    try {
      const updated = await storage.updateSection(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Section not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating section:", error);
      res.status(500).json({ message: "Failed to update section" });
    }
  });
  app2.delete("/api/sections/:id", isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deleteSection(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Section not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting section:", error);
      res.status(500).json({ message: "Failed to delete section" });
    }
  });
  app2.post("/api/lab-records/:labRecordId/sections/reorder", isAuthenticated, async (req, res) => {
    try {
      const { sectionOrders } = req.body;
      await storage.updateSectionsOrder(req.params.labRecordId, sectionOrders);
      res.status(204).send();
    } catch (error) {
      console.error("Error reordering sections:", error);
      res.status(500).json({ message: "Failed to reorder sections" });
    }
  });
  app2.get("/api/sections/:sectionId/images", isAuthenticated, async (req, res) => {
    try {
      const images = await storage.getSectionImages(req.params.sectionId);
      res.json(images);
    } catch (error) {
      console.error("Error fetching section images:", error);
      res.status(500).json({ message: "Failed to fetch section images" });
    }
  });
  app2.post("/api/sections/:sectionId/images", isAuthenticated, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }
      const imageUrl = `/uploads/${req.file.filename}`;
      const validatedData = insertSectionImageSchema.parse({
        sectionId: req.params.sectionId,
        imageUrl,
        caption: req.body.caption || null,
        alignment: req.body.alignment || "center",
        width: parseInt(req.body.width) || 100,
        order: parseInt(req.body.order) || 0
      });
      const image = await storage.createSectionImage(validatedData);
      res.status(201).json(image);
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });
  app2.delete("/api/section-images/:id", isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deleteSectionImage(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Image not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ message: "Failed to delete image" });
    }
  });
  app2.get("/api/user/preferences", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const prefs = await storage.getUserPreferences(userId);
      res.json(prefs || { language: "en", defaultFont: "Inter", defaultTheme: "academic" });
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });
  app2.put("/api/user/preferences", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertUserPreferencesSchema.parse({
        ...req.body,
        userId
      });
      const prefs = await storage.upsertUserPreferences(validatedData);
      res.json(prefs);
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(400).json({ message: "Invalid request data" });
    }
  });
  app2.use("/uploads", express2.static("uploads"));
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express3 from "express";
import fs from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express3.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
config2();
var app = express4();
app.use(express4.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express4.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "3001", 10);
  server.listen(port, () => {
    log(`serving on http://localhost:${port}`);
  });
})();
