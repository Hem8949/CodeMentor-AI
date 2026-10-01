import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const weaknessesTable = pgTable(
  "weaknesses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    concept: varchar("concept", { length: 80 }).notNull(),
    count: integer("count").notNull().default(1),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("weaknesses_user_concept_unique").on(table.userId, table.concept)],
);

export const insertWeaknessSchema = createInsertSchema(weaknessesTable).omit({
  id: true,
  updatedAt: true,
});

export type InsertWeakness = z.infer<typeof insertWeaknessSchema>;
export type Weakness = typeof weaknessesTable.$inferSelect;