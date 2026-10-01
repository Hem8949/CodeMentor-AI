import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, attemptsTable, problemsTable } from "@workspace/db";
import {
  CreateAttemptBody,
  CreateAttemptResponse,
  GetAttemptsResponse,
  UpdateAttemptBody,
  UpdateAttemptParams,
  UpdateAttemptResponse,
} from "@workspace/api-zod";
import { getUserId } from "../lib/auth";
import { serializeAttempt } from "../lib/serializers";

const router: IRouter = Router();

router.get("/attempts", async (req, res): Promise<void> => {
  const rows = await db
    .select({ attempt: attemptsTable, problemTitle: problemsTable.title })
    .from(attemptsTable)
    .leftJoin(problemsTable, eq(attemptsTable.problemId, problemsTable.id))
    .where(eq(attemptsTable.userId, getUserId(req)))
    .orderBy(desc(attemptsTable.updatedAt));
  res.json(GetAttemptsResponse.parse(rows.map(({ attempt, problemTitle }) => serializeAttempt(attempt, problemTitle))));
});

router.post("/attempts", async (req, res): Promise<void> => {
  const parsed = CreateAttemptBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "We couldn't save this attempt. Check the details and try again." });
    return;
  }

  const [attempt] = await db
    .insert(attemptsTable)
    .values({
      userId: getUserId(req),
      problemId: parsed.data.problem_id ?? null,
      language: parsed.data.language,
      code: parsed.data.code,
      output: parsed.data.output ?? null,
      status: parsed.data.status,
      hintsUsed: parsed.data.hints_used ?? 0,
    })
    .returning();

  const [problem] = attempt?.problemId
    ? await db.select({ title: problemsTable.title }).from(problemsTable).where(eq(problemsTable.id, attempt.problemId)).limit(1)
    : [];
  if (!attempt) {
    res.status(500).json({ error: "We couldn't save this attempt. Please try again." });
    return;
  }
  res.status(201).json(CreateAttemptResponse.parse(serializeAttempt(attempt, problem?.title ?? null)));
});

router.put("/attempts/:attemptId", async (req, res): Promise<void> => {
  const params = UpdateAttemptParams.safeParse(req.params);
  const parsed = UpdateAttemptBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "We couldn't update this attempt. Check the details and try again." });
    return;
  }

  const body = parsed.data;
  const [attempt] = await db
    .update(attemptsTable)
    .set({
      ...(body.code !== undefined ? { code: body.code } : {}),
      ...(body.output !== undefined ? { output: body.output } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.hints_used !== undefined ? { hintsUsed: body.hints_used } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(attemptsTable.id, params.data.attemptId), eq(attemptsTable.userId, getUserId(req))))
    .returning();

  if (!attempt) {
    res.status(404).json({ error: "We couldn't find that attempt." });
    return;
  }

  const [problem] = attempt.problemId
    ? await db.select({ title: problemsTable.title }).from(problemsTable).where(eq(problemsTable.id, attempt.problemId)).limit(1)
    : [];
  res.json(UpdateAttemptResponse.parse(serializeAttempt(attempt, problem?.title ?? null)));
});

export default router;