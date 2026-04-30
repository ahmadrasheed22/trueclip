import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function isValidVideoId(videoId) {
  return typeof videoId === "string" && /^[A-Za-z0-9_-]{11}$/.test(videoId);
}

function removeTempFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // Ignore cleanup failures.
  }
}

function readCookieArgs() {
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

function readJsRuntimeArgs() {
  const configuredRuntimes = process.env.YTDLP_JS_RUNTIMES?.trim();
  const runtimes = configuredRuntimes || "node";

  return ["--js-runtimes", runtimes];
}

function readExtractorArgs() {
  const extractorArgs = process.env.YTDLP_EXTRACTOR_ARGS?.trim();
  if (!extractorArgs) {
    return [];
  }

  return ["--extractor-args", extractorArgs];
}

function buildYtdlpArgs(videoUrl, tempFile) {
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

function mapYtdlpFailure(stderrOutput) {
  const normalized =
    typeof stderrOutput === "string" ? stderrOutput.replace(/\s+/g, " ").trim() : "";
  const lower = normalized.toLowerCase();

  if (lower.includes("no supported javascript runtime could be found")) {
    return "yt-dlp could not run YouTube JavaScript extraction. Set YTDLP_JS_RUNTIMES=node on the server and try again.";
  }

  if (
    lower.includes("sign in to confirm you're not a bot") ||
    lower.includes("--cookies-from-browser") ||
    lower.includes("use --cookies")
  ) {
    return "YouTube blocked this request. Set YTDLP_COOKIES_FROM_BROWSER or YTDLP_COOKIES_FILE on the server, then try again.";
  }

  if (lower.includes("unable to load cookie file")) {
    return "YTDLP_COOKIES_FILE is set but the cookies file could not be read by the server.";
  }

  if (lower.includes("private video") || lower.includes("members-only")) {
    return "This video is private or members-only and cannot be downloaded.";
  }

  if (lower.includes("video unavailable") || lower.includes("not available")) {
    return "This video is unavailable or region-restricted.";
  }

  return "Download failed.";
}

function downloadWithYtDlp(videoUrl, tempFile) {
  return new Promise((resolve, reject) => {
    const localYtdlpPath = path.join(process.cwd(), "yt-dlp.exe");
    const ytdlpPath = fs.existsSync(localYtdlpPath) ? localYtdlpPath : "yt-dlp";
    const ytdlpArgs = buildYtdlpArgs(videoUrl, tempFile);

    const ytdlp = spawn(
      ytdlpPath,
      ytdlpArgs,
      {
        windowsHide: true,
        shell: false,
      }
    );

    let settled = false;
    let stderrOutput = "";

    ytdlp.stderr.on("data", (chunk) => {
      stderrOutput += chunk.toString();
    });

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

      // Try the alternate binary path if primary launch fails.
      const fallbackPath = ytdlp.spawnfile === "yt-dlp" ? localYtdlpPath : "yt-dlp";
      if (fallbackPath !== ytdlp.spawnfile && (fallbackPath === "yt-dlp" || fs.existsSync(fallbackPath))) {
        const retry = spawn(
          fallbackPath,
          ytdlpArgs,
          {
            windowsHide: true,
            shell: false,
          }
        );

        let retrySettled = false;
        let retryStderrOutput = "";

        retry.stderr.on("data", (chunk) => {
          retryStderrOutput += chunk.toString();
        });

        const retryTimeoutId = setTimeout(() => {
          if (retrySettled) return;
          retrySettled = true;
          retry.kill();
          reject(new Error("Download timed out."));
        }, 55000);

        retry.on("error", () => {
          if (retrySettled) return;
          retrySettled = true;
          clearTimeout(retryTimeoutId);
          reject(new Error("Download failed."));
        });

        retry.on("close", (code) => {
          if (retrySettled) return;
          retrySettled = true;
          clearTimeout(retryTimeoutId);

          if (code === 0 && fs.existsSync(tempFile)) {
            resolve();
            return;
          }

          reject(new Error(mapYtdlpFailure(retryStderrOutput)));
        });

        return;
      }

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

      reject(new Error(mapYtdlpFailure(stderrOutput)));
    });
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");
  const title = searchParams.get("title") || "";

  if (!isValidVideoId(videoId)) {
    return NextResponse.json({ error: "Invalid video ID." }, { status: 400 });
  }

  const tempDir = path.join(os.tmpdir(), "trueclip-downloads");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  const tempFile = path.join(tempDir, `${videoId}.mp4`);

  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    await downloadWithYtDlp(videoUrl, tempFile);

    const fileBuffer = fs.readFileSync(tempFile);
    const cleanTitle =
      (title || videoId)
        .replace(/[^\w\s-]/g, "")
        .trim()
        .substring(0, 80) || "Trueclip-Video";

    removeTempFile(tempFile);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(cleanTitle)}.mp4"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    removeTempFile(tempFile);

    if (error instanceof Error && error.message === "Download timed out.") {
      return NextResponse.json({ error: "Download timed out." }, { status: 504 });
    }

    if (error instanceof Error && error.message && error.message !== "Download failed.") {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    return NextResponse.json({ error: "Download failed." }, { status: 500 });
  }
}
