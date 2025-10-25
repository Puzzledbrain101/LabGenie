import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./auth";
import { storage } from "./storage"; // ADD THIS IMPORT
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  insertLabRecordSchema,
  insertSectionSchema,
  insertSectionImageSchema,
  insertUserPreferencesSchema
} from "@shared/schema";

// Configure multer for image uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      // Ensure uploads directory exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  console.log('🔧 [ROUTES] Starting route registration...');

  try {
    // Auth middleware
    console.log('🔧 [ROUTES] Setting up authentication...');
    setupAuth(app);

    // Storage middleware - ADD THIS SECTION
    console.log('🔧 [ROUTES] Setting up storage middleware...');
    app.use((req: any, res, next) => {
      req.storage = storage;
      next();
    });

    // Health check
    app.get("/api/health", (req, res) => {
      res.json({ status: "OK", timestamp: new Date().toISOString() });
    });

    console.log('✅ [ROUTES] Authentication and storage setup complete');

    // User routes
    console.log('🔧 [ROUTES] Setting up /api/auth/user route...');
    app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
      console.log('✅ [ROUTES] /api/auth/user route hit');
      try {
        const user = req.user;
        res.json(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Failed to fetch user data" });
      }
    });

    // Lab Record routes
    console.log('🔧 [ROUTES] Setting up lab record routes...');
    app.get("/api/lab-records", isAuthenticated, async (req: any, res) => {
      try {
        const records = await req.storage.getLabRecords(req.user.claims.sub);
        res.json(records);
      } catch (error) {
        console.error("Error fetching lab records:", error);
        res.status(500).json({ message: "Failed to fetch lab records" });
      }
    });

    app.get("/api/lab-records/:id", isAuthenticated, async (req: any, res) => {
      try {
        const record = await req.storage.getLabRecord(req.params.id, req.user.claims.sub);
        if (!record) {
          return res.status(404).json({ message: "Lab record not found" });
        }
        res.json(record);
      } catch (error) {
        console.error("Error fetching lab record:", error);
        res.status(500).json({ message: "Failed to fetch lab record" });
      }
    });

    app.post("/api/lab-records", isAuthenticated, async (req: any, res) => {
      try {
        const validatedData = insertLabRecordSchema.parse({
          ...req.body,
          userId: req.user.claims.sub,
        });
        const record = await req.storage.createLabRecord(validatedData);
        res.status(201).json(record);
      } catch (error) {
        console.error("Error creating lab record:", error);
        res.status(400).json({ message: "Invalid request data" });
      }
    });

    app.patch("/api/lab-records/:id", isAuthenticated, async (req: any, res) => {
      try {
        const record = await req.storage.updateLabRecord(
          req.params.id,
          req.user.claims.sub,
          req.body
        );
        if (!record) {
          return res.status(404).json({ message: "Lab record not found" });
        }
        res.json(record);
      } catch (error) {
        console.error("Error updating lab record:", error);
        res.status(400).json({ message: "Invalid request data" });
      }
    });

    app.delete("/api/lab-records/:id", isAuthenticated, async (req: any, res) => {
      try {
        const deleted = await req.storage.deleteLabRecord(req.params.id, req.user.claims.sub);
        if (!deleted) {
          return res.status(404).json({ message: "Lab record not found" });
        }
        res.status(204).send();
      } catch (error) {
        console.error("Error deleting lab record:", error);
        res.status(500).json({ message: "Failed to delete lab record" });
      }
    });

    app.post("/api/lab-records/:id/duplicate", isAuthenticated, async (req: any, res) => {
      try {
        const duplicated = await req.storage.duplicateLabRecord(req.params.id, req.user.claims.sub);
        if (!duplicated) {
          return res.status(404).json({ message: "Lab record not found" });
        }
        res.status(201).json(duplicated);
      } catch (error) {
        console.error("Error duplicating lab record:", error);
        res.status(500).json({ message: "Failed to duplicate lab record" });
      }
    });

    // Section routes
    app.get("/api/lab-records/:labRecordId/sections", isAuthenticated, async (req: any, res) => {
      try {
        const sections = await req.storage.getSections(req.params.labRecordId);
        res.json(sections);
      } catch (error) {
        console.error("Error fetching sections:", error);
        res.status(500).json({ message: "Failed to fetch sections" });
      }
    });

    app.post("/api/lab-records/:labRecordId/sections", isAuthenticated, async (req: any, res) => {
      try {
        const validatedData = insertSectionSchema.parse({
          ...req.body,
          labRecordId: req.params.labRecordId,
        });
        const section = await req.storage.createSection(validatedData);
        res.status(201).json(section);
      } catch (error) {
        console.error("Error creating section:", error);
        res.status(400).json({ message: "Invalid request data" });
      }
    });

    app.patch("/api/sections/:id", isAuthenticated, async (req: any, res) => {
      try {
        const section = await req.storage.updateSection(req.params.id, req.body);
        if (!section) {
          return res.status(404).json({ message: "Section not found" });
        }
        res.json(section);
      } catch (error) {
        console.error("Error updating section:", error);
        res.status(400).json({ message: "Invalid request data" });
      }
    });

    app.delete("/api/sections/:id", isAuthenticated, async (req: any, res) => {
      try {
        const deleted = await req.storage.deleteSection(req.params.id);
        if (!deleted) {
          return res.status(404).json({ message: "Section not found" });
        }
        res.status(204).send();
      } catch (error) {
        console.error("Error deleting section:", error);
        res.status(500).json({ message: "Failed to delete section" });
      }
    });

    app.post("/api/lab-records/:labRecordId/sections/reorder", isAuthenticated, async (req: any, res) => {
      try {
        const { sectionOrders } = req.body;
        await req.storage.updateSectionsOrder(req.params.labRecordId, sectionOrders);
        res.status(204).send();
      } catch (error) {
        console.error("Error reordering sections:", error);
        res.status(500).json({ message: "Failed to reorder sections" });
      }
    });

    // Section Image routes
    app.get('/api/sections/:sectionId/images', isAuthenticated, async (req: any, res) => {
      try {
        const images = await req.storage.getSectionImages(req.params.sectionId);
        res.json(images);
      } catch (error) {
        console.error("Error fetching section images:", error);
        res.status(500).json({ message: "Failed to fetch section images" });
      }
    });

    app.post('/api/sections/:sectionId/images', isAuthenticated, upload.single('image'), async (req: any, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No image file provided" });
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        console.log('🔧 [IMAGE UPLOAD] File saved to:', req.file.path);
        console.log('🔧 [IMAGE UPLOAD] Image URL will be:', imageUrl);

        const validatedData = insertSectionImageSchema.parse({
          sectionId: req.params.sectionId,
          imageUrl,
          caption: req.body.caption || null,
          alignment: req.body.alignment || 'center',
          width: parseInt(req.body.width) || 100,
          order: parseInt(req.body.order) || 0,
        });

        const image = await req.storage.createSectionImage(validatedData);
        res.status(201).json(image);
      } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ message: "Failed to upload image" });
      }
    });

    app.delete('/api/section-images/:id', isAuthenticated, async (req: any, res) => {
      try {
        const deleted = await req.storage.deleteSectionImage(req.params.id);
        if (!deleted) {
          return res.status(404).json({ message: "Image not found" });
        }
        res.status(204).send();
      } catch (error) {
        console.error("Error deleting image:", error);
        res.status(500).json({ message: "Failed to delete image" });
      }
    });

    // User Preferences routes
    app.get('/api/user/preferences', isAuthenticated, async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const prefs = await req.storage.getUserPreferences(userId);
        res.json(prefs || { language: 'en', defaultFont: 'Inter', defaultTheme: 'academic' });
      } catch (error) {
        console.error("Error fetching preferences:", error);
        res.status(500).json({ message: "Failed to fetch preferences" });
      }
    });

    app.patch('/api/user/preferences', isAuthenticated, async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const validatedData = insertUserPreferencesSchema.parse({
          ...req.body,
          userId,
        });
        const prefs = await req.storage.upsertUserPreferences(validatedData);
        res.json(prefs);
      } catch (error) {
        console.error("Error updating preferences:", error);
        res.status(400).json({ message: "Invalid request data" });
      }
    });

    // ========== STATIC FILE SERVING ==========
    console.log('🔧 [ROUTES] Setting up static file serving...');
    
    const uploadsPath = path.join(process.cwd(), 'uploads');
    console.log('🔧 [STATIC FILES] Current working directory:', process.cwd());
    console.log('🔧 [STATIC FILES] Uploads absolute path:', uploadsPath);
    console.log('🔧 [STATIC FILES] Uploads directory exists:', fs.existsSync(uploadsPath));

    if (fs.existsSync(uploadsPath)) {
      const files = fs.readdirSync(uploadsPath);
      console.log('🔧 [STATIC FILES] Files in uploads directory:', files.length, 'files');
    } else {
      console.log('❌ [STATIC FILES] Uploads directory does not exist! Creating...');
      fs.mkdirSync(uploadsPath, { recursive: true });
    }

    // Add middleware to log static file requests
    app.use('/uploads', (req, res, next) => {
      console.log('🔧 [STATIC REQUEST] Request for:', req.url);
      next();
    });

    // Serve static files
    app.use('/uploads', express.static(uploadsPath, {
      maxAge: '1d',
      etag: true,
    }));

    console.log('🔧 [STATIC FILES] Static file serving configured');

    console.log('✅ [ROUTES] All routes registered successfully');

    const httpServer = createServer(app);
    return httpServer;
  } catch (error) {
    console.error('❌ [ROUTES] Error in registerRoutes:', error);
    throw error;
  }
}