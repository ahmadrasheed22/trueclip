import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

type GenerateClipRequest = {
  videoPath?: unknown;
  prompt?: unknown;
};

type ClipWindow = {
  start: number;
  end: number;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as Record<string, unknown>;
}

function isPathInside(basePath: string, targetPath: string): boolean {
  const relative = path.relative(basePath, targetPath);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function resolveInputVideoPath(rawVideoPath: string): string | null {
  const trimmed = rawVideoPath.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    return null;
  }

  const appRoot = process.cwd();
  const normalized = trimmed.replace(/\\/g, "/");

  const candidate = path.isAbsolute(trimmed)
    ? path.normalize(trimmed)
    : normalized.startsWith("/")
      ? path.join(appRoot, "public", normalized.replace(/^\/+/, ""))
      : path.resolve(appRoot, trimmed);

  if (!isPathInside(appRoot, candidate)) {
    return null;
  }

  return candidate;
}

function parseWindowFromJson(raw: string): ClipWindow {
  const parsed = asRecord(JSON.parse(raw));
  const start = Number(parsed?.start);
  const end = Number(parsed?.end);

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    throw new Error("Model response did not contain numeric start/end values.");
  }

  const normalizedStart = Math.max(0, start);
  const normalizedEnd = Math.max(normalizedStart + 1, end);

  return {
    start: normalizedStart,
    end: normalizedEnd,
  };
}

async function pickClipWindow(
  openai: OpenAI,
  transcript: string,
  userPrompt: string
): Promise<ClipWindow> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Return strictly JSON with this shape only: { \"start\": number, \"end\": number }. Do not include markdown.",
      },
      {
        role: "user",
        content: `User prompt:\n${userPrompt}\n\nTranscript:\n${transcript}`,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content?.trim() ?? "";
  if (!content) {
    throw new Error("Model did not return clip timestamps.");
  }

  return parseWindowFromJson(content);
}

async function transcribeVideo(openai: OpenAI, absoluteVideoPath: string): Promise<string> {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(absoluteVideoPath),
    model: "whisper-1",
    response_format: "text",
  });

  const text = typeof transcription === "string" ? transcription : "";
  if (!text.trim()) {
    throw new Error("Transcription returned empty text.");
  }

  return text;
}

function renderVerticalClip(
  inputVideoPath: string,
  outputVideoPath: string,
  window: ClipWindow
): Promise<void> {
  const duration = Math.max(1, window.end - window.start);

  return new Promise((resolve, reject) => {
    ffmpeg(inputVideoPath)
      .setStartTime(window.start)
      .duration(duration)
      .videoFilters([
        "scale=1080:1920:force_original_aspect_ratio=decrease",
        "pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black",
      ])
      .videoCodec("libx264")
      .audioCodec("aac")
      .outputOptions(["-preset veryfast", "-movflags +faststart"])
      .format("mp4")
      .on("end", () => resolve())
      .on("error", (error) => reject(error))
      .save(outputVideoPath);
  });
}

export async function POST(request: NextRequest) {
  let body: GenerateClipRequest = {};

  try {
    body = (await request.json()) as GenerateClipRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const rawVideoPath = typeof body.videoPath === "string" ? body.videoPath : "";
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

  if (!rawVideoPath.trim()) {
    return NextResponse.json({ error: "videoPath is required." }, { status: 400 });
  }

  if (!prompt) {
    return NextResponse.json({ error: "prompt is required." }, { status: 400 });
  }

  const resolvedVideoPath = resolveInputVideoPath(rawVideoPath);
  if (!resolvedVideoPath) {
    return NextResponse.json(
      { error: "Invalid or unsupported videoPath." },
      { status: 400 }
    );
  }

  const fileStats = await fs.promises.stat(resolvedVideoPath).catch(() => null);
  if (!fileStats?.isFile()) {
    return NextResponse.json({ error: "Video file was not found." }, { status: 404 });
  }

  const openaiApiKey = process.env.OPENAI_API_KEY?.trim();
  if (!openaiApiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 500 }
    );
  }

  const openai = new OpenAI({ apiKey: openaiApiKey });

  try {
    const transcript = await transcribeVideo(openai, resolvedVideoPath);
    const clipWindow = await pickClipWindow(openai, transcript, prompt);

    const clipsDir = path.join(process.cwd(), "public", "clips");
    await fs.promises.mkdir(clipsDir, { recursive: true });

    const fileName = `clip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.mp4`;
    const outputPath = path.join(clipsDir, fileName);

    await renderVerticalClip(resolvedVideoPath, outputPath, clipWindow);

    return NextResponse.json({
      clipUrl: `/clips/${fileName}`,
      start: clipWindow.start,
      end: clipWindow.end,
    });
  } catch (errorCause) {
    const message =
      errorCause instanceof Error
        ? errorCause.message
        : "Unable to generate clip right now.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
