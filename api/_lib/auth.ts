import { SignJWT, jwtVerify } from "jose";
import crypto from "crypto";
import * as cookie from "cookie";
import { requireEnv, type NodeRequest, type NodeResponse } from "./utils.js";

const COOKIE_NAME = "bcq_teacher";
const TOKEN_TTL_SECONDS = 60 * 60 * 6; // 6 hours

function secretKey(): Uint8Array {
  const secret = requireEnv("SESSION_SECRET");
  return new TextEncoder().encode(secret);
}

export function requireTeacherPasscode(): string {
  return requireEnv("TEACHER_PASSCODE");
}

export function readTeacherCookie(req: NodeRequest): string | null {
  const header = req.headers.cookie ?? "";
  const parsed = cookie.parse(header);
  return parsed[COOKIE_NAME] ?? null;
}

export async function isTeacherAuthed(req: NodeRequest): Promise<boolean> {
  const token = readTeacherCookie(req);
  if (!token) return false;
  try {
    await jwtVerify(token, secretKey());
    return true;
  } catch {
    return false;
  }
}

export async function setTeacherSession(res: NodeResponse): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const token = await new SignJWT({
    role: "teacher",
    jti: crypto.randomUUID(),
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  })
    .setProtectedHeader({ alg: "HS256" })
    .sign(secretKey());

  const serialized = cookie.serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: TOKEN_TTL_SECONDS,
    path: "/",
  });

  res.setHeader("Set-Cookie", serialized);
}

export function clearTeacherSession(res: NodeResponse): void {
  const serialized = cookie.serialize(COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  res.setHeader("Set-Cookie", serialized);
}
