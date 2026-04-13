'use client';

import { useEffect, useRef } from "react";

type LiveMonitorProps = {
  channelId: string;
  onNewShort?: (video: unknown) => void;
  onStatusChange?: (status: "idle" | "connecting" | "live" | "reconnecting" | "error") => void;
};

export default function LiveMonitor({ channelId, onNewShort, onStatusChange }: LiveMonitorProps) {
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!channelId) return;

    onStatusChange?.("connecting");

    const eventSource = new EventSource(`/api/monitor?channelId=${channelId}`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as {
          type?: string;
          video?: unknown;
        };

        if (data.type === "connected") {
          onStatusChange?.("live");
        }

        if (data.type === "new_short" && data.video) {
          onNewShort?.(data.video);
        }

        if (data.type === "error") {
          onStatusChange?.("error");
        }
      } catch {
        // Ignore malformed event payloads and keep listening.
      }
    };

    eventSource.onerror = () => {
      onStatusChange?.("reconnecting");
      // EventSource automatically retries when the connection drops.
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
      onStatusChange?.("idle");
    };
  }, [channelId, onNewShort, onStatusChange]);

  return null;
}
