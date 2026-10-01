import { createInsertSchema } from "drizzle-zod";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const problemsTable = pgTable("problems", {
  id: varchar("id", { length: 80 }).primaryKey(),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description").notNull(),
  language: varchar("language", { length: 20 }).notNull(),
  difficulty: varchar("difficulty", { length: 12 }).notNull(),
  starterCode: text("starter_code").notNull(),
});

export const insertProblemSchema = createInsertSchema(problemsTable);
export type InsertProblem = z.infer<typeof insertProblemSchema>;
export type Problem = typeof problemsTable.$inferSelect;