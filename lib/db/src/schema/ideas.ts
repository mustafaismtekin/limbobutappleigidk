import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { companiesTable } from "./companies";

export const ideasTable = pgTable("ideas", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id")
    .notNull()
    .references(() => companiesTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  pdfUrl: text("pdf_url"),
  voteCount: integer("vote_count").notNull().default(0),
  preorderCount: integer("preorder_count").notNull().default(0),
  voteThreshold: integer("vote_threshold").notNull().default(50),
  preorderThreshold: integer("preorder_threshold").notNull().default(20),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertIdeaSchema = createInsertSchema(ideasTable).omit({
  id: true,
  voteCount: true,
  preorderCount: true,
  createdAt: true,
});
export type InsertIdea = z.infer<typeof insertIdeaSchema>;
export type Idea = typeof ideasTable.$inferSelect;

