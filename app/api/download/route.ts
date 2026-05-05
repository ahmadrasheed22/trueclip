import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function isValidVideoId(videoId: string) {
  return typeof videoId === "string" && /^[A-Za-z0-9_-]{11}$/.test(videoId);
}

function removeTempFile(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // Ignore cleanup failures.
  }
}

function readCookieArgs(): string[] {
  const cookiesFile = process.env.YTDLP_COOKIES_FILE?.trim();
  if (cookiesFile) {
    return ["--cookies", cookiesFile];
  }

  const cookiesFromBrowser = process.env.YTDLP_COOKIES_FROM_BROWSER?.trim();
  if (cookiesFromBrowser) {
    return ["--cookies-from-browser", cookiesFromBrowser];
  }

  return [];
}

function readJsRuntimeArgs(): string[] {
  const configuredRuntimes = process.env.YTDLP_JS_RUNTIMES?.trim();
  const runtimes = configuredRuntimes || "node";
  return ["--js-runtimes", runtimes];
}

function readExtractorArgs(): string[] {
  const extractorArgs = process.env.YTDLP_EXTRACTOR_ARGS?.trim();
  if (!extractorArgs) {
    return [];
  }
  return ["--extractor-args", extractorArgs];
}

function buildYtdlpArgs(videoUrl: string, tempFile: string): string[] {
  return [
    "-f",
    "best[ext=mp4]/best",
    "-o",
    tempFile,
    "--force-overwrites",
    "--no-warnings",
    "--no-playlist",
    "--no-part",
    "--geo-bypass",
    "--retries",
    "3",
    "--socket-timeout",
    "15",
    ...readJsRuntimeArgs(),
    ...readExtractorArgs(),
    ...readCookieArgs(),
    videoUrl,
  ];
}

function downloadWithYtDlp(videoUrl: string, tempFile: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const localYtdlpPath = path.join(process.cwd(), "yt-dlp.exe");
    const ytdlpPath = fs.existsSync(localYtdlpPath) ? localYtdlpPath : "yt-dlp";
    const ytdlpArgs = buildYtdlpArgs(videoUrl, tempFile);

    const ytdlp = spawn(ytdlpPath, ytdlpArgs, {
      windowsHide: true,
      shell: false,
    });

    let settled = false;

    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      ytdlp.kill();
      reject(new Error("Download timed out."));
    }, 55000);

    ytdlp.on("error", () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      reject(new Error("Download failed."));
    });

    ytdlp.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);

      if (code === 0 && fs.existsSync(tempFile)) {
        resolve();
        return;
      }
      reject(new Error(`Download failed with code ${code}.`));
    });
  });
}

function sanitizeFilename(value: string | null) {
  if (!value) return "short";
  return value.replace(/[\\/:*?"<>|]+/g, "").trim() || "short";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");
  const title = searchParams.get("title");

  if (!videoId || !isValidVideoId(videoId)) {
    return NextResponse.json({ error: "Valid videoId is required" }, { status: 400 });
  }

  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const timestamp = Date.now();
  const tempFile = path.join(os.tmpdir(), `yt_dlp_${videoId}_${timestamp}.mp4`);

  try {
    await downloadWithYtDlp(url, tempFile);

    const fileBuffer = fs.readFileSync(tempFile);
    removeTempFile(tempFile);

    const filename = `${sanitizeFilename(title)}.mp4`;
    
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (error) {
    removeTempFile(tempFile);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}