import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";
export const pages = pgTable("pages", {
  id: uuid().primaryKey().defaultRandom(),
  path: text().notNull().unique(),
  template: text().notNull(),
  title: text().notNull(),
  kind: text().notNull(),
  brief: jsonb().notNull(),
  draftRevisionId: uuid("draft_revision_id"),
  publishedRevisionId: uuid("published_revision_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  firstPublishedAt: timestamp("first_published_at", { withTimezone: true }),
});
export const revisions = pgTable("revisions", {
  id: uuid().primaryKey().defaultRandom(),
  pageId: uuid("page_id").notNull(),
  content: jsonb().notNull(),
  validation: jsonb().notNull(),
  origin: text().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
export const leads = pgTable("leads", {
  id: uuid().primaryKey(),
  requestId: uuid("request_id").notNull(),
  data: jsonb().notNull(),
  status: text().notNull(),
  notes: text().notNull(),
});
