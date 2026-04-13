import crypto from "crypto";

const TIKTOK_AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
const TIKTOK_API_BASE_URL = "https://open.tiktokapis.com/v2";
const DEFAULT_SCOPE = "user.info.basic,video.publish";

export type TikTokUserProfile = {
  openId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
};

export type TikTokTokenSet = {
  accessToken: string;
  refreshToken: string;
  openId: string;
  scope: string;
  expiresAt: number;
  refreshExpiresAt: number;
};

type JsonRecord = Record<string, unknown>;

export class TikTokApiError extends Error {
  status: number;
  code?: string;
  logId?: string;

  constructor(message: string, status: number, code?: string, logId?: string) {
    super(message);
    this.name = "TikTokApiError";
    this.status = status;
    this.code = code;
    this.logId = logId;
  }
}

function asRecord(value: unknown): JsonRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as JsonRecord;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new TikTokApiError(`${name} is missing. Add it to .env.local.`, 500);
  }

  return value;
}

export function getTikTokConfig() {
  return {
    clientKey: getRequiredEnv("TIKTOK_CLIENT_KEY"),
    clientSecret: getRequiredEnv("TIKTOK_CLIENT_SECRET"),
    redirectUri: getRequiredEnv("TIKTOK_REDIRECT_URI"),
    scope: process.env.TIKTOK_SCOPE?.trim() || DEFAULT_SCOPE,
  };
}

async function parseJsonSafe(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

type ParsedTikTokError = {
  code?: string;
  message?: string;
  logId?: string;
};

function parseTikTokError(payload: unknown): ParsedTikTokError {
  const root = asRecord(payload);
  const error = asRecord(root?.error);

  return {
    code: typeof error?.code === "string" ? error.code : undefined,
    message:
      typeof error?.message === "string"
        ? error.message
        : typeof root?.error_description === "string"
          ? root.error_description
          : typeof root?.message === "string"
            ? root.message
            : undefined,
    logId: typeof error?.log_id === "string" ? error.log_id : undefined,
  };
}

function createApiError(payload: unknown, status: number, fallbackMessage: string): TikTokApiError {
  const parsed = parseTikTokError(payload);

  return new TikTokApiError(
    parsed.message || fallbackMessage,
    status,
    parsed.code,
    parsed.logId
  );
}

function normalizeTokenPayload(payload: unknown): TikTokTokenSet {
  const root = asRecord(payload);

  const accessToken = typeof root?.access_token === "string" ? root.access_token : "";
  const refreshToken = typeof root?.refresh_token === "string" ? root.refresh_token : "";
  const openId = typeof root?.open_id === "string" ? root.open_id : "";
  const scope = typeof root?.scope === "string" ? root.scope : "";

  if (!accessToken || !refreshToken || !openId) {
    throw new TikTokApiError("TikTok token response is incomplete.", 500);
  }

  const expiresIn = asNumber(root?.expires_in, 0);
  const refreshExpiresIn = asNumber(root?.refresh_expires_in, 0);

  return {
    accessToken,
    refreshToken,
    openId,
    scope,
    expiresAt: Date.now() + expiresIn * 1000,
    refreshExpiresAt: Date.now() + refreshExpiresIn * 1000,
  };
}

export function createTikTokOAuthState(): string {
  return crypto.randomBytes(24).toString("hex");
}

export function buildTikTokAuthorizeUrl(state: string): string {
  const { clientKey, redirectUri, scope } = getTikTokConfig();
  const url = new URL(TIKTOK_AUTH_URL);

  url.searchParams.set("client_key", clientKey);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", scope);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);

  return url.toString();
}

export async function exchangeCodeForAccessToken(code: string): Promise<TikTokTokenSet> {
  const { clientKey, clientSecret, redirectUri } = getTikTokConfig();
  const body = new URLSearchParams();

  body.set("client_key", clientKey);
  body.set("client_secret", clientSecret);
  body.set("code", code);
  body.set("grant_type", "authorization_code");
  body.set("redirect_uri", redirectUri);

  const response = await fetch(`${TIKTOK_API_BASE_URL}/oauth/token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    cache: "no-store",
  });

  const payload = await parseJsonSafe(response);

  if (!response.ok) {
    throw createApiError(payload, response.status, "Unable to exchange authorization code.");
  }

  return normalizeTokenPayload(payload);
}

export async function refreshTikTokAccessToken(refreshToken: string): Promise<TikTokTokenSet> {
  const { clientKey, clientSecret } = getTikTokConfig();
  const body = new URLSearchParams();

  body.set("client_key", clientKey);
  body.set("client_secret", clientSecret);
  body.set("grant_type", "refresh_token");
  body.set("refresh_token", refreshToken);

  const response = await fetch(`${TIKTOK_API_BASE_URL}/oauth/token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    cache: "no-store",
  });

  const payload = await parseJsonSafe(response);

  if (!response.ok) {
    throw createApiError(payload, response.status, "Unable to refresh TikTok session.");
  }

  return normalizeTokenPayload(payload);
}

export async function fetchTikTokUserProfile(accessToken: string): Promise<TikTokUserProfile> {
  const fields = "open_id,display_name,avatar_url,username";

  const response = await fetch(`${TIKTOK_API_BASE_URL}/user/info/?fields=${fields}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const payload = await parseJsonSafe(response);

  if (!response.ok) {
    throw createApiError(payload, response.status, "Unable to load TikTok user profile.");
  }

  const root = asRecord(payload);
  const payloadError = parseTikTokError(payload);
  if (payloadError.code && payloadError.code !== "ok") {
    throw createApiError(payload, 400, "TikTok user profile request failed.");
  }

  const data = asRecord(root?.data);
  const user = asRecord(data?.user) ?? data;

  const openId =
    typeof user?.open_id === "string"
      ? user.open_id
      : typeof data?.open_id === "string"
        ? data.open_id
        : "";

  const displayName =
    typeof user?.display_name === "string"
      ? user.display_name
      : typeof user?.username === "string"
        ? user.username
        : "TikTok Creator";

  const username =
    typeof user?.username === "string" && user.username.trim()
      ? user.username
      : displayName.replace(/\s+/g, "").toLowerCase();

  const avatarUrl = typeof user?.avatar_url === "string" ? user.avatar_url : "";

  if (!openId) {
    throw new TikTokApiError("TikTok profile response did not include open_id.", 500);
  }

  return {
    openId,
    username,
    displayName,
    avatarUrl,
  };
}

const TRENDING_HASHTAG_SETS = [
  ["#fyp", "#viralvideo", "#trendalert", "#creatorlife"],
  ["#foryou", "#tiktoktrend", "#shortvideo", "#contentcreator"],
  ["#explore", "#videomarketing", "#growth", "#dailytrend"],
];

export function buildTikTokCaption(baseCaption: string): string {
  const cleanedBase = baseCaption.trim().replace(/\s+/g, " ");
  const safeBase = cleanedBase || "Fresh short video drop";
  const hashtagSet = TRENDING_HASHTAG_SETS[new Date().getUTCDate() % TRENDING_HASHTAG_SETS.length];

  const caption = `${safeBase} ${hashtagSet.join(" ")}`.trim();
  return caption.slice(0, 2200);
}

type PublishResponse = {
  publishId: string;
  logId?: string;
};

type CreatorInfo = {
  privacyLevel: string;
  commentDisabled: boolean;
  duetDisabled: boolean;
  stitchDisabled: boolean;
};

async function queryTikTokCreatorInfo(accessToken: string): Promise<CreatorInfo> {
  const response = await fetch(`${TIKTOK_API_BASE_URL}/post/publish/creator_info/query/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    cache: "no-store",
  });

  const payload = await parseJsonSafe(response);

  if (!response.ok) {
    throw createApiError(payload, response.status, "Unable to load TikTok creator settings.");
  }

  const root = asRecord(payload);
  const payloadError = parseTikTokError(payload);

  if (payloadError.code && payloadError.code !== "ok") {
    throw createApiError(payload, 400, "TikTok creator settings query failed.");
  }

  const data = asRecord(root?.data);
  const privacyOptions = Array.isArray(data?.privacy_level_options)
    ? data?.privacy_level_options.filter((item): item is string => typeof item === "string")
    : [];

  const privacyLevel = privacyOptions.includes("SELF_ONLY")
    ? "SELF_ONLY"
    : privacyOptions[0] || "SELF_ONLY";

  return {
    privacyLevel,
    commentDisabled: Boolean(data?.comment_disabled),
    duetDisabled: Boolean(data?.duet_disabled),
    stitchDisabled: Boolean(data?.stitch_disabled),
  };
}

export async function publishTikTokVideoFromUrl(
  accessToken: string,
  videoUrl: string,
  caption: string
): Promise<PublishResponse> {
  const creatorInfo = await queryTikTokCreatorInfo(accessToken);

  const response = await fetch(`${TIKTOK_API_BASE_URL}/post/publish/video/init/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      post_info: {
        title: caption,
        privacy_level: creatorInfo.privacyLevel,
        disable_comment: creatorInfo.commentDisabled,
        disable_duet: creatorInfo.duetDisabled,
        disable_stitch: creatorInfo.stitchDisabled,
      },
      source_info: {
        source: "PULL_FROM_URL",
        video_url: videoUrl,
      },
    }),
    cache: "no-store",
  });

  const payload = await parseJsonSafe(response);

  if (!response.ok) {
    throw createApiError(payload, response.status, "Unable to initialize TikTok post.");
  }

  const root = asRecord(payload);
  const payloadError = parseTikTokError(payload);

  if (payloadError.code && payloadError.code !== "ok") {
    throw createApiError(payload, 400, "TikTok rejected the video publish request.");
  }

  const data = asRecord(root?.data);
  const publishId = typeof data?.publish_id === "string" ? data.publish_id : "";

  if (!publishId) {
    throw new TikTokApiError("TikTok did not return publish_id for this request.", 500);
  }

  return {
    publishId,
    logId: payloadError.logId,
  };
}
