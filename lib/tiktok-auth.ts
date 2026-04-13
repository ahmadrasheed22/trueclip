import { refreshTikTokAccessToken } from "@/lib/tiktok";
import { getTikTokSession, setTikTokSession, type TikTokSession } from "@/lib/tiktok-session";

const REFRESH_BUFFER_MS = 2 * 60 * 1000;

export async function getActiveTikTokSession(): Promise<TikTokSession | null> {
  const existingSession = await getTikTokSession();

  if (!existingSession) {
    return null;
  }

  if (existingSession.expiresAt > Date.now() + REFRESH_BUFFER_MS) {
    return existingSession;
  }

  const refreshed = await refreshTikTokAccessToken(existingSession.refreshToken);

  const updatedSession: TikTokSession = {
    ...existingSession,
    accessToken: refreshed.accessToken,
    refreshToken: refreshed.refreshToken || existingSession.refreshToken,
    openId: refreshed.openId || existingSession.openId,
    scope: refreshed.scope || existingSession.scope,
    expiresAt: refreshed.expiresAt,
    refreshExpiresAt: refreshed.refreshExpiresAt || existingSession.refreshExpiresAt,
  };

  await setTikTokSession(updatedSession);
  return updatedSession;
}
