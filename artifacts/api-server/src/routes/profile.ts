import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { GetProfileResponse, UpdateProfileBody, UpdateProfileResponse } from "@workspace/api-zod";
import { getUserId } from "../lib/auth";
import { serializeProfile } from "../lib/serializers";

const router: IRouter = Router();

router.get("/profile", async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, getUserId(req))).limit(1);
  if (!user) {
    res.status(401).json({ error: "Your account is no longer available. Please sign in again." });
    return;
  }
  res.json(GetProfileResponse.parse(serializeProfile(user)));
});

router.put("/profile", async (req, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Check your profile details and try again." });
    return;
  }

  const updates = parsed.data;
  const values = {
    ...(updates.display_name !== undefined ? { displayName: updates.display_name.trim() } : {}),
    ...(updates.skill_level !== undefined ? { skillLevel: updates.skill_level } : {}),
    ...(updates.preferred_language !== undefined ? { preferredLanguage: updates.preferred_language } : {}),
  };

  const [user] = Object.keys(values).length
    ? await db.update(usersTable).set(values).where(eq(usersTable.id, getUserId(req))).returning()
    : await db.select().from(usersTable).where(eq(usersTable.id, getUserId(req))).limit(1);

  if (!user) {
    res.status(404).json({ error: "We couldn't find your profile." });
    return;
  }
  res.json(UpdateProfileResponse.parse(serializeProfile(user)));
});

export default router;