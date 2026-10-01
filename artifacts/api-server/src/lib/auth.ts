import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, RequestHandler } from "express";

type TokenClaims = {
  sub: string;
  exp: number;
};

type AuthenticatedRequest = Request & { userId?: string };

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 24) {
    throw new Error("JWT_SECRET must be configured with at least 24 characters.");
  }
  return secret;
}

function signatureFor(value: string): string {
  return createHmac("sha256", getJwtSecret()).update(value).digest("base64url");
}

export function createAccessToken(userId: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ sub: userId, iat: now, exp: now + 60 * 60 * 24 * 7 })).toString("base64url");
  const input = `${header}.${payload}`;
  return `${input}.${signatureFor(input)}`;
}

function readAccessToken(token: string): TokenClaims {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Malformed token");
  const [header, payload, signature] = parts;
  const input = `${header}.${payload}`;
  const expected = Buffer.from(signatureFor(input));
  const provided = Buffer.from(signature);
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    throw new Error("Invalid token signature");
  }

  const parsedHeader = JSON.parse(Buffer.from(header, "base64url").toString("utf8")) as { alg?: string };
  const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<TokenClaims>;
  if (parsedHeader.alg !== "HS256" || typeof claims.sub !== "string" || typeof claims.exp !== "number") {
    throw new Error("Invalid token claims");
  }
  if (claims.exp <= Math.floor(Date.now() / 1000)) throw new Error("Expired token");
  return { sub: claims.sub, exp: claims.exp };
}

export const requireAuth: RequestHandler = (req, res, next): void => {
  const authorization = req.header("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    res.status(401).json({ error: "Sign in to continue." });
    return;
  }

  try {
    const claims = readAccessToken(match[1]);
    (req as AuthenticatedRequest).userId = claims.sub;
    next();
  } catch {
    res.status(401).json({ error: "Your session has expired. Please sign in again." });
  }
};

export function getUserId(req: Request): string {
  const userId = (req as AuthenticatedRequest).userId;
  if (!userId) throw new Error("Authenticated user is missing from request.");
  return userId;
}