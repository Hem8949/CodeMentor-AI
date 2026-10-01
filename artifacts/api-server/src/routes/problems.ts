import { Router, type IRouter } from "express";
import { and, asc, eq } from "drizzle-orm";
import { db, problemsTable } from "@workspace/db";
import {
  GetProblemParams,
  GetProblemResponse,
  GetProblemsQueryParams,
  GetProblemsResponse,
} from "@workspace/api-zod";
import { serializeProblem } from "../lib/serializers";
import { ensureSeedProblems } from "../lib/seed-problems";

const router: IRouter = Router();

router.get("/problems", async (req, res): Promise<void> => {
  await ensureSeedProblems();
  const parsed = GetProblemsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "That problem filter isn't valid." });
    return;
  }

  const filters = [];
  if (parsed.data.difficulty) filters.push(eq(problemsTable.difficulty, parsed.data.difficulty));
  if (parsed.data.language) filters.push(eq(problemsTable.language, parsed.data.language));
  const rows = await db
    .select()
    .from(problemsTable)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(asc(problemsTable.difficulty), asc(problemsTable.title));
  res.json(GetProblemsResponse.parse(rows.map(serializeProblem)));
});

router.get("/problems/:problemId", async (req, res): Promise<void> => {
  await ensureSeedProblems();
  const params = GetProblemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "That problem could not be found." });
    return;
  }
  const [problem] = await db.select().from(problemsTable).where(eq(problemsTable.id, params.data.problemId)).limit(1);
  if (!problem) {
    res.status(404).json({ error: "That problem could not be found." });
    return;
  }
  res.json(GetProblemResponse.parse(serializeProblem(problem)));
});

export default router;