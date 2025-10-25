import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (for Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  passwordHash: text("password_hash"), // ADDED: For password authentication
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Lab Record table
export const labRecords = pgTable("lab_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 255 }).notNull(),
  templateType: varchar("template_type", { length: 50 }).notNull(), // 'physics', 'chemistry', 'computer'
  customization: jsonb("customization"), // stores font, theme, layout, colors, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const labRecordsRelations = relations(labRecords, ({ one, many }) => ({
  user: one(users, {
    fields: [labRecords.userId],
    references: [users.id],
  }),
  sections: many(sections),
}));

export type LabRecord = typeof labRecords.$inferSelect;
export type InsertLabRecord = typeof labRecords.$inferInsert;

export const insertLabRecordSchema = createInsertSchema(labRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLabRecordData = z.infer<typeof insertLabRecordSchema>;

// Section table
export const sections = pgTable("sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  labRecordId: varchar("lab_record_id").notNull().references(() => labRecords.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull().default(''),
  order: integer("order").notNull(),
  isHidden: boolean("is_hidden").notNull().default(false),
  sectionType: varchar("section_type", { length: 50 }).notNull(), // 'text', 'code', 'student_details'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  labRecord: one(labRecords, {
    fields: [sections.labRecordId],
    references: [labRecords.id],
  }),
  images: many(sectionImages),
}));

export type Section = typeof sections.$inferSelect;
export type InsertSection = typeof sections.$inferInsert;

export const insertSectionSchema = createInsertSchema(sections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSectionData = z.infer<typeof insertSectionSchema>;

// Section Images table
export const sectionImages = pgTable("section_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sectionId: varchar("section_id").notNull().references(() => sections.id, { onDelete: 'cascade' }),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  alignment: varchar("alignment", { length: 20 }).notNull().default('center'), // 'left', 'center', 'right'
  width: integer("width").notNull().default(100), // percentage 25, 50, 75, 100
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sectionImagesRelations = relations(sectionImages, ({ one }) => ({
  section: one(sections, {
    fields: [sectionImages.sectionId],
    references: [sections.id],
  }),
}));

export type SectionImage = typeof sectionImages.$inferSelect;
export type InsertSectionImage = typeof sectionImages.$inferInsert;

export const insertSectionImageSchema = createInsertSchema(sectionImages).omit({
  id: true,
  createdAt: true,
});

export type InsertSectionImageData = z.infer<typeof insertSectionImageSchema>;

// User preferences table
export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  language: varchar("language", { length: 10 }).notNull().default('en'), // 'en', 'de', 'es'
  defaultFont: varchar("default_font", { length: 50 }).default('Inter'),
  defaultTheme: varchar("default_theme", { length: 50 }).default('academic'),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = typeof userPreferences.$inferInsert;

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  updatedAt: true,
});

export type InsertUserPreferencesData = z.infer<typeof insertUserPreferencesSchema>;
