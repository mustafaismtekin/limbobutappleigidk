import { pgTable, text, serial, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { ideasTable } from "./ideas";

export const preordersTable = pgTable(
  "preorders",
  {
    id: serial("id").primaryKey(),
    ideaId: integer("idea_id")
      .notNull()
      .references(() => ideasTable.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // One preorder per email per idea -- prevents trivially inflating preorder counts.
    uniqueIndex("preorders_idea_email_unique").on(table.ideaId, table.email),
  ],
);

export const insertPreorderSchema = createInsertSchema(preordersTable).omit({
  id: true,
  createdAt: true,
});
export type InsertPreorder = z.infer<typeof insertPreorderSchema>;
export type Preorder = typeof preordersTable.$inferSelect;

