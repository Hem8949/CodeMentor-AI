import type { Attempt, Problem, User } from "@workspace/db";

export function serializeProfile(user: User) {
  return {
    id: user.id,
    email: user.email,
    display_name: user.displayName,
    skill_level: user.skillLevel,
    preferred_language: user.preferredLanguage,
    created_at: user.createdAt.toISOString(),
  };
}

export function serializeProblem(problem: Problem) {
  return {
    id: problem.id,
    title: problem.title,
    description: problem.description,
    language: problem.language,
    difficulty: problem.difficulty,
    starter_code: problem.starterCode,
  };
}

export function serializeAttempt(attempt: Attempt, problemTitle: string | null = null) {
  return {
    id: attempt.id,
    user_id: attempt.userId,
    problem_id: attempt.problemId,
    problem_title: problemTitle,
    language: attempt.language,
    code: attempt.code,
    output: attempt.output,
    status: attempt.status,
    hints_used: attempt.hintsUsed,
    created_at: attempt.createdAt.toISOString(),
    updated_at: attempt.updatedAt.toISOString(),
  };
}