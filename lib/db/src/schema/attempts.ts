import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { problemsTable } from "./problems";
import { usersTable } from "./users";

export const attemptsTable = pgTable("attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  problemId: varchar("problem_id", { length: 80 }).references(() => problemsTable.id, { onDelete: "set null" }),
  language: varchar("language", { length: 20 }).notNull(),
  code: text("code").notNull().default(""),
  output: text("output"),
  status: varchar("status", { length: 20 }).notNull().default("in_progress"),
  hintsUsed: integer("hints_used").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAttemptSchema = createInsertSchema(attemptsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAttempt = z.infer<typeof insertAttemptSchema>;
export type Attempt = typeof attemptsTable.$inferSelect;