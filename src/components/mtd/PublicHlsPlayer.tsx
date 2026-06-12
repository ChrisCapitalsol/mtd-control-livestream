import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

const PUBLIC_HLS_URL = "http://31.70.86.73:8890/live/stream/index.m3u8";

type StreamStatus = "idle" | "loading" | "live" | "offline" | "error";

export function PublicHlsPlayer() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [status, setStatus] = useState<StreamStatus>("idle");
  const [message, setMessage] = useState("Stream noch nicht geladen.");
  const [reloadKey, setReloadKey] = useState(0);

  function destroyPlayer() {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const video = videoRef.current;
    if (video) {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
  }

  function reloadStream() {
    destroyPlayer();
    setStatus("loading");
    setMessage("Stream wird neu geprüft...");
    setReloadKey((value) => value + 1);
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;

    setStatus("loading");
    setMessage("Stream wird geladen...");

    destroyPlayer();

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = PUBLIC_HLS_URL;

      video.onloadedmetadata = () => {
        if (cancelled) return;
        setStatus("live");
        setMessage("Live");
        video.play().catch(() => {
          setMessage("Stream bereit. Bitte Play drücken.");
        });
      };

      video.onerror = () => {
        if (cancelled) return;
        setStatus("offline");
        setMessage("Kein Stream aktiv. Bitte später erneut prüfen.");
      };
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 10,
        liveSyncDurationCount: 3,
      });

      hlsRef.current = hls;

      hls.loadSource(PUBLIC_HLS_URL);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (cancelled) return;
        setStatus("live");
        setMessage("Live");
        video.play().catch(() => {
          setMessage("Stream bereit. Bitte Play drücken.");
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (cancelled) return;
        if (!data.fatal) return;

        setStatus("offline");
        setMessage("Kein Stream aktiv. Bitte später erneut prüfen.");

        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      });
    } else {
      setStatus("error");
      setMessage("Dieser Browser unterstützt HLS nicht.");
    }

    return () => {
      cancelled = true;
      destroyPlayer();
    };
  }, [reloadKey]);

  const isLive = status === "live";

  return (
    <div className="relative rounded-xl border border-border bg-card overflow-hidden">
      <div className="absolute left-4 top-4 z-10">
        <div
          className={
            isLive
              ? "bg-primary text-primary-foreground px-3 py-1 text-xs font-mono uppercase tracking-widest rounded"
              : "bg-background/80 border border-border text-muted-foreground px-3 py-1 text-xs font-mono uppercase tracking-widest rounded"
          }
        >
          {isLive ? "LIVE" : "OFFLINE"}
        </div>
      </div>

      <div className="relative bg-black min-h-[360px] flex items-center justify-center">
        <video
          ref={videoRef}
          controls
          muted
          playsInline
          className={isLive ? "w-full max-h-[620px] bg-black" : "hidden"}
        />

        {!isLive && (
          <div className="text-center p-8">
            <div className="text-primary text-4xl mb-4">◉</div>
            <div className="font-display text-3xl font-bold tracking-wider">
              KEIN STREAM AKTIV
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              {message}
            </div>

            <button
              type="button"
              onClick={reloadStream}
              className="mt-6 rounded border border-primary px-5 py-2 text-sm font-mono uppercase tracking-widest text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Stream neu prüfen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
