import crypto from "crypto";
import { cookies } from "next/headers";
import type { TikTokUserProfile } from "@/lib/tiktok";

const TIKTOK_SESSION_COOKIE = "trueclip_tiktok_session";
const TIKTOK_STATE_COOKIE = "trueclip_tiktok_oauth_state";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const STATE_MAX_AGE_SECONDS = 60 * 10;

type CookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
};

export type TikTokSession = {
  accessToken: string;
  refreshToken: string;
  openId: string;
  scope: string;
  expiresAt: number;
  refreshExpiresAt: number;
  user: TikTokUserProfile;
};

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as JsonRecord;
}

function isTikTokUserProfile(value: unknown): value is TikTokUserProfile {
  const item = asRecord(value);

  return Boolean(
    item &&
      typeof item.openId === "string" &&
      typeof item.username === "string" &&
      typeof item.displayName === "string" &&
      typeof item.avatarUrl === "string"
  );
}

function isTikTokSession(value: unknown): value is TikTokSession {
  const item = asRecord(value);

  return Boolean(
    item &&
      typeof item.accessToken === "string" &&
      typeof item.refreshToken === "string" &&
      typeof item.openId === "string" &&
      typeof item.scope === "string" &&
      typeof item.expiresAt === "number" &&
      typeof item.refreshExpiresAt === "number" &&
      isTikTokUserProfile(item.user)
  );
}

function getEncryptionKey(): Buffer {
  const secret = process.env.TIKTOK_SESSION_SECRET?.trim();

  if (!secret || secret.length < 16) {
    throw new Error("TIKTOK_SESSION_SECRET must be set and at least 16 characters long.");
  }

  return crypto.createHash("sha256").update(secret).digest();
}

function encryptJson(payload: unknown): string {
  const json = JSON.stringify(payload);
  const iv = crypto.randomBytes(12);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([cipher.update(json, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("base64url")}.${authTag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

function decryptJson<T>(value: string): T | null {
  const [ivRaw, authTagRaw, encryptedRaw] = value.split(".");

  if (!ivRaw || !authTagRaw || !encryptedRaw) {
    return null;
  }

  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(ivRaw, "base64url");
    const authTag = Buffer.from(authTagRaw, "base64url");
    const encrypted = Buffer.from(encryptedRaw, "base64url");

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
    return JSON.parse(decrypted) as T;
  } catch {
    return null;
  }
}

function getCookieOptions(maxAge: number): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

export async function setTikTokSession(session: TikTokSession): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TIKTOK_SESSION_COOKIE, encryptJson(session), getCookieOptions(SESSION_MAX_AGE_SECONDS));
}

export async function getTikTokSession(): Promise<TikTokSession | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(TIKTOK_SESSION_COOKIE)?.value;

  if (!value) {
    return null;
  }

  const parsed = decryptJson<unknown>(value);

  if (!isTikTokSession(parsed)) {
    return null;
  }

  return parsed;
}

export async function clearTikTokSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TIKTOK_SESSION_COOKIE);
}

export async function setTikTokOAuthState(state: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TIKTOK_STATE_COOKIE, state, getCookieOptions(STATE_MAX_AGE_SECONDS));
}

export async function getTikTokOAuthState(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(TIKTOK_STATE_COOKIE)?.value ?? null;
}

export async function clearTikTokOAuthState(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TIKTOK_STATE_COOKIE);
}
