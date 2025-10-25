import {
  users,
  labRecords,
  sections,
  sectionImages,
  userPreferences,
  type User,
  type UpsertUser,
  type LabRecord,
  type InsertLabRecord,
  type Section,
  type InsertSection,
  type SectionImage,
  type InsertSectionImage,
  type UserPreferences,
  type InsertUserPreferences,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Lab Record operations
  getLabRecords(userId: string): Promise<LabRecord[]>;
  getLabRecord(id: string, userId: string): Promise<LabRecord | undefined>;
  createLabRecord(record: InsertLabRecord): Promise<LabRecord>;
  updateLabRecord(id: string, userId: string, updates: Partial<InsertLabRecord>): Promise<LabRecord | undefined>;
  deleteLabRecord(id: string, userId: string): Promise<boolean>;
  duplicateLabRecord(id: string, userId: string): Promise<LabRecord | undefined>;

  // Section operations
  getSections(labRecordId: string): Promise<Section[]>;
  getSection(id: string): Promise<Section | undefined>;
  createSection(section: InsertSection): Promise<Section>;
  updateSection(id: string, updates: Partial<InsertSection>): Promise<Section | undefined>;
  deleteSection(id: string): Promise<boolean>;
  updateSectionsOrder(labRecordId: string, sectionOrders: { id: string; order: number }[]): Promise<void>;

  // Section Image operations
  getSectionImages(sectionId: string): Promise<SectionImage[]>;
  createSectionImage(image: InsertSectionImage): Promise<SectionImage>;
  deleteSectionImage(id: string): Promise<boolean>;

  // User Preferences operations
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  upsertUserPreferences(prefs: InsertUserPreferences): Promise<UserPreferences>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Lab Record operations
  async getLabRecords(userId: string): Promise<LabRecord[]> {
    return await db
      .select()
      .from(labRecords)
      .where(eq(labRecords.userId, userId))
      .orderBy(desc(labRecords.updatedAt));
  }

  async getLabRecord(id: string, userId: string): Promise<LabRecord | undefined> {
    const [record] = await db
      .select()
      .from(labRecords)
      .where(and(eq(labRecords.id, id), eq(labRecords.userId, userId)));
    return record;
  }

  async createLabRecord(record: InsertLabRecord): Promise<LabRecord> {
    const [newRecord] = await db
      .insert(labRecords)
      .values(record)
      .returning();
    return newRecord;
  }

  async updateLabRecord(id: string, userId: string, updates: Partial<InsertLabRecord>): Promise<LabRecord | undefined> {
    const [updated] = await db
      .update(labRecords)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(labRecords.id, id), eq(labRecords.userId, userId)))
      .returning();
    return updated;
  }

  async deleteLabRecord(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(labRecords)
      .where(and(eq(labRecords.id, id), eq(labRecords.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async duplicateLabRecord(id: string, userId: string): Promise<LabRecord | undefined> {
    const original = await this.getLabRecord(id, userId);
    if (!original) return undefined;

    // Create new record
    const [newRecord] = await db
      .insert(labRecords)
      .values({
        userId: original.userId,
        title: `${original.title} (Copy)`,
        templateType: original.templateType,
        customization: original.customization,
      })
      .returning();

    // Duplicate sections
    const originalSections = await this.getSections(id);
    for (const section of originalSections) {
      await db.insert(sections).values({
        labRecordId: newRecord.id,
        title: section.title,
        content: section.content,
        order: section.order,
        isHidden: section.isHidden,
        sectionType: section.sectionType,
      });
    }

    return newRecord;
  }

  // Section operations
  async getSections(labRecordId: string): Promise<Section[]> {
    return await db
      .select()
      .from(sections)
      .where(eq(sections.labRecordId, labRecordId))
      .orderBy(sections.order);
  }

  async getSection(id: string): Promise<Section | undefined> {
    const [section] = await db
      .select()
      .from(sections)
      .where(eq(sections.id, id));
    return section;
  }

  async createSection(section: InsertSection): Promise<Section> {
    const [newSection] = await db
      .insert(sections)
      .values(section)
      .returning();
    return newSection;
  }

  async updateSection(id: string, updates: Partial<InsertSection>): Promise<Section | undefined> {
    const [updated] = await db
      .update(sections)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(sections.id, id))
      .returning();
    return updated;
  }

  async deleteSection(id: string): Promise<boolean> {
    const result = await db
      .delete(sections)
      .where(eq(sections.id, id))
      .returning();
    return result.length > 0;
  }

  async updateSectionsOrder(labRecordId: string, sectionOrders: { id: string; order: number }[]): Promise<void> {
    for (const { id, order } of sectionOrders) {
      await db
        .update(sections)
        .set({ order, updatedAt: new Date() })
        .where(and(eq(sections.id, id), eq(sections.labRecordId, labRecordId)));
    }
  }

  // Section Image operations
  async getSectionImages(sectionId: string): Promise<SectionImage[]> {
    return await db
      .select()
      .from(sectionImages)
      .where(eq(sectionImages.sectionId, sectionId))
      .orderBy(sectionImages.order);
  }

  async createSectionImage(image: InsertSectionImage): Promise<SectionImage> {
    const [newImage] = await db
      .insert(sectionImages)
      .values(image)
      .returning();
    return newImage;
  }

  async deleteSectionImage(id: string): Promise<boolean> {
    const result = await db
      .delete(sectionImages)
      .where(eq(sectionImages.id, id))
      .returning();
    return result.length > 0;
  }

  // User Preferences operations
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return prefs;
  }

  async upsertUserPreferences(prefsData: InsertUserPreferences): Promise<UserPreferences> {
    const [prefs] = await db
      .insert(userPreferences)
      .values(prefsData)
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: {
          ...prefsData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return prefs;
  }
}

export const storage = new DatabaseStorage();
