import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  LoginUserBody,
  LoginUserResponse,
  RegisterUserBody,
  RegisterUserResponse,
} from "@workspace/api-zod";
import { createAccessToken } from "../lib/auth";
import { serializeProfile } from "../lib/serializers";

const router: IRouter = Router();

router.post("/register", async (req, res): Promise<void> => {
  const parsed = RegisterUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Check your details and try again." });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();
  const [existingUser] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existingUser) {
    res.status(409).json({ error: "An account with that email already exists." });
    return;
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const [user] = await db
      .insert(usersTable)
      .values({
        email,
        passwordHash,
        displayName: parsed.data.display_name.trim(),
        skillLevel: parsed.data.skill_level,
        preferredLanguage: parsed.data.preferred_language,
      })
      .returning();
    if (!user) {
      res.status(500).json({ error: "We couldn't create your account. Please try again." });
      return;
    }

    res.status(201).json(
      RegisterUserResponse.parse({
        token: createAccessToken(user.id),
        user: serializeProfile(user),
      }),
    );
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      res.status(409).json({ error: "An account with that email already exists." });
      return;
    }
    req.log.error({ err: error }, "Account registration failed");
    res.status(500).json({ error: "We couldn't create your account. Please try again." });
  }
});

router.post("/login", async (req, res): Promise<void> => {
  const parsed = LoginUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Enter a valid email and password." });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    res.status(401).json({ error: "That email and password don't match." });
    return;
  }

  try {
    res.json(
      LoginUserResponse.parse({
        token: createAccessToken(user.id),
        user: serializeProfile(user),
      }),
    );
  } catch (error) {
    req.log.error({ err: error }, "Unable to create sign-in token");
    res.status(500).json({ error: "Sign-in is temporarily unavailable. Please try again." });
  }
});

export default router;