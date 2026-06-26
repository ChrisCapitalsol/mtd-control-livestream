import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { getConfiguredHlsUrl } from "@/config/stream";

type StreamStatus = "idle" | "loading" | "live" | "offline" | "error";

export function PublicHlsPlayer() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const publicHlsUrl = getConfiguredHlsUrl();
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
    setMessage("Stream wird neu geprueft...");
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
      video.src = publicHlsUrl;

      video.onloadedmetadata = () => {
        if (cancelled) return;
        setStatus("live");
        setMessage("Live");
        video.play().catch(() => {
          setMessage("Stream bereit. Bitte Play druecken.");
        });
      };

      video.onerror = () => {
        if (cancelled) return;
        setStatus("offline");
        setMessage("Kein Stream aktiv. Bitte spaeter erneut pruefen.");
      };
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 10,
        liveSyncDurationCount: 3,
      });

      hlsRef.current = hls;
      hls.loadSource(publicHlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (cancelled) return;
        setStatus("live");
        setMessage("Live");
        video.play().catch(() => {
          setMessage("Stream bereit. Bitte Play druecken.");
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (cancelled) return;
        if (!data.fatal) return;

        setStatus("offline");
        setMessage("Kein Stream aktiv. Bitte spaeter erneut pruefen.");

        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      });
    } else {
      setStatus("error");
      setMessage("Dieser Browser unterstuetzt HLS nicht.");
    }

    return () => {
      cancelled = true;
      destroyPlayer();
    };
  }, [publicHlsUrl, reloadKey]);

  const isLive = status === "live";

  return (
    <div className="broadcast-player">
      <div className="absolute left-4 top-4 z-10">
        <div className={isLive ? "player-badge live" : "player-badge"}>
          {isLive ? "LIVE" : "OFFLINE"}
        </div>
      </div>

      <div className="relative flex aspect-video min-h-[260px] items-center justify-center bg-black">
        <video
          ref={videoRef}
          controls
          muted
          playsInline
          className={isLive ? "h-full w-full bg-black object-contain" : "hidden"}
        />

        {!isLive && (
          <div className="p-8 text-center">
            <div className="mb-4 text-4xl font-black text-primary">ON</div>
            <div className="font-display text-3xl font-black uppercase italic tracking-[0.08em]">
              KEIN STREAM AKTIV
            </div>
            <div className="mt-3 text-sm text-muted-foreground">{message}</div>

            <button type="button" onClick={reloadStream} className="broadcast-button mt-6">
              Stream neu pruefen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
