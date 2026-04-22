import AIClipGenerator from "@/components/AIClipGenerator";

type WatchPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function getStringSearchParam(value: string | string[] | undefined): string {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return "";
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  const pathFromQuery = getStringSearchParam(resolvedSearchParams.videoPath).trim();
  const videoPath = pathFromQuery || `/clips/${id}.mp4`;

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[var(--bg)] py-10 text-[var(--text-1)]">
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-4 sm:p-6">
          <h1 className="mb-4 text-xl font-semibold sm:text-2xl">Watch Video</h1>

          <video
            src={videoPath}
            controls
            preload="metadata"
            className="w-full rounded-xl bg-black"
            playsInline
          />
        </div>

        <div className="mt-6">
          <AIClipGenerator videoPath={videoPath} videoId={id} />
        </div>
      </section>
    </main>
  );
}
