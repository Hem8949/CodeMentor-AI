import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, attemptsTable, problemsTable, weaknessesTable } from "@workspace/db";
import { GetDashboardResponse } from "@workspace/api-zod";
import { getUserId } from "../lib/auth";
import { serializeAttempt } from "../lib/serializers";

const router: IRouter = Router();

router.get("/dashboard", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const rows = await db
    .select({ attempt: attemptsTable, problemTitle: problemsTable.title })
    .from(attemptsTable)
    .leftJoin(problemsTable, eq(attemptsTable.problemId, problemsTable.id))
    .where(eq(attemptsTable.userId, userId))
    .orderBy(desc(attemptsTable.updatedAt));
  const attempts = rows.map(({ attempt, problemTitle }) => serializeAttempt(attempt, problemTitle));
  const [weaknesses] = await Promise.all([
    db.select({ concept: weaknessesTable.concept, count: weaknessesTable.count })
      .from(weaknessesTable)
      .where(eq(weaknessesTable.userId, userId))
      .orderBy(desc(weaknessesTable.count))
      .limit(6),
  ]);
  const attempted = attempts.length;
  const solved = attempts.filter((attempt) => attempt.status === "solved").length;
  const avgHints = attempted
    ? attempts.reduce((sum, attempt) => sum + attempt.hints_used, 0) / attempted
    : 0;
  const dashboard = {
    attempted,
    solved,
    solve_rate: attempted ? (solved / attempted) * 100 : 0,
    avg_hints: avgHints,
    completion_pct: attempted ? (solved / attempted) * 100 : 0,
    top_weaknesses: weaknesses,
    recent_attempts: attempts.slice(0, 6),
  };
  res.json(GetDashboardResponse.parse(dashboard));
});

export default router;