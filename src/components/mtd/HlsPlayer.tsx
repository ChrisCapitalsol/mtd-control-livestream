import { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RefreshCw, Play, PlugZap, Radio, Square } from "lucide-react";
import { getConfiguredHlsUrl } from "@/config/stream";

const STORAGE_KEY = "mtd.hls.url";
const STORAGE_OPTS = "mtd.hls.opts";
const DEFAULT_URL = getConfiguredHlsUrl();

type Opts = { autoplay: boolean; muted: boolean; controls: boolean };
type HlsErrorLike = {
  type?: string;
  details?: string;
  response?: { code?: number };
  fatal?: boolean;
};

function translateHlsError(data: HlsErrorLike | null | undefined): string {
  if (!data) return "Unbekannter HLS-Fehler.";
  const { type, details, response } = data;
  if (details === "manifestLoadError" || details === "manifestLoadTimeOut") {
    return "HLS-Manifest nicht erreichbar. Laeuft der Streaming-Server?";
  }
  if (details === "manifestParsingError") return "HLS-Manifest konnte nicht gelesen werden.";
  if (details === "levelLoadError") return "Stream-Level nicht erreichbar. Stream offline?";
  if (response?.code === 0) return "Netzwerk-/CORS-Fehler. Bitte CORS am Server pruefen.";
  if (type === "networkError") return "Netzwerkfehler beim Laden des Streams.";
  if (type === "mediaError") return "Medienfehler. Format nicht unterstuetzt oder defekter Stream.";
  return `HLS-Fehler: ${details || type || "unbekannt"}`;
}

export function HlsPlayer() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [url, setUrl] = useState<string>(() => localStorage.getItem(STORAGE_KEY) || DEFAULT_URL);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const [opts, setOpts] = useState<Opts>(() => {
    try {
      const value = localStorage.getItem(STORAGE_OPTS);
      if (value) return JSON.parse(value) as Opts;
    } catch {
      // Keep defaults when local storage contains invalid JSON.
    }
    return { autoplay: true, muted: true, controls: true };
  });
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_OPTS, JSON.stringify(opts));
  }, [opts]);

  const destroy = useCallback(() => {
    if (hlsRef.current) {
      try { hlsRef.current.destroy(); } catch {/* noop */}
      hlsRef.current = null;
    }
    const video = videoRef.current;
    if (video) {
      try {
        video.pause();
        video.removeAttribute("src");
        video.load();
      } catch {
        // Ignore browser cleanup quirks.
      }
    }
  }, []);

  const stop = useCallback(() => {
    destroy();
    setPlaying(false);
    setActive(false);
    setError(null);
    setLoadedUrl(null);
  }, [destroy]);

  const load = useCallback((target: string) => {
    setError(null);
    setPlaying(false);
    destroy();
    const video = videoRef.current;
    if (!video || !target) return;

    localStorage.setItem(STORAGE_KEY, target);
    setLoadedUrl(target);
    setActive(true);

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = target;
      if (opts.autoplay) video.play().catch(() => {/* user gesture required */});
      return;
    }

    if (!Hls.isSupported()) {
      setError("HLS wird in diesem Browser nicht unterstuetzt.");
      setActive(false);
      return;
    }

    const hls = new Hls({
      enableWorker: true,
      manifestLoadingMaxRetry: 0,
      levelLoadingMaxRetry: 0,
      fragLoadingMaxRetry: 0,
    });
    hlsRef.current = hls;
    hls.loadSource(target);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      if (opts.autoplay) video.play().catch(() => {/* user gesture required */});
    });
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        setError(translateHlsError(data));
        setPlaying(false);
        setActive(false);
        try { hls.destroy(); } catch {/* noop */}
        if (hlsRef.current === hls) hlsRef.current = null;
      }
    });
  }, [destroy, opts.autoplay]);

  useEffect(() => {
    return () => destroy();
  }, [destroy]);

  const testConnection = useCallback(async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(url, { method: "GET", cache: "no-store" });
      if (res.ok) setTestResult(`OK / HTTP ${res.status}`);
      else setTestResult(`Fehler / HTTP ${res.status}`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "unbekannt";
      setTestResult(`Nicht erreichbar (CORS/Netzwerk): ${message}`);
    } finally {
      setTesting(false);
    }
  }, [url]);

  return (
    <div className="carbon-panel overflow-hidden">
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          className="h-full w-full bg-black object-contain"
          controls={opts.controls}
          muted={opts.muted}
          playsInline
          onPlaying={() => { setPlaying(true); setError(null); }}
          onPause={() => setPlaying(false)}
          onWaiting={() => setPlaying(false)}
        />

        {!playing && (
          <div className="absolute inset-0 grid place-items-center bg-gradient-hero pointer-events-none">
            <div className="px-4 text-center">
              <Radio className="mx-auto mb-3 h-12 w-12 text-primary/60" />
              <div className="font-display text-2xl font-black uppercase italic tracking-[0.08em] text-foreground md:text-3xl">
                {error ? "STREAM OFFLINE" : active ? "STREAM WIRD GELADEN..." : "KEIN STREAM AKTIV"}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {error ? error : active ? "Warte auf HLS-Manifest..." : "Klicke auf Stream laden, um den HLS-Stream zu starten."}
              </div>
            </div>
          </div>
        )}

        {playing && (
          <div className="live-chip">
            <span className="blink h-2 w-2 rounded-full bg-white" />
            <span>LIVE</span>
          </div>
        )}
      </div>

      <div className="space-y-3 border-t border-border p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[10px] font-mono-tech uppercase tracking-widest text-muted-foreground">
            HLS Player
          </div>
          {loadedUrl && (
            <div className="max-w-[60%] truncate text-[10px] font-mono-tech text-muted-foreground" title={loadedUrl}>
              {loadedUrl}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="hls-url" className="text-xs font-mono-tech uppercase tracking-widest text-muted-foreground">
            HLS Stream URL
          </Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="hls-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={DEFAULT_URL}
              className="font-mono-tech text-xs"
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => load(url)} className="gap-2">
                <Play className="h-4 w-4" /> Stream laden
              </Button>
              <Button variant="outline" onClick={() => loadedUrl && load(loadedUrl)} disabled={!loadedUrl} className="gap-2">
                <RefreshCw className="h-4 w-4" /> Neu laden
              </Button>
              <Button variant="destructive" onClick={stop} disabled={!active && !playing} className="gap-2">
                <Square className="h-4 w-4" /> Stop
              </Button>
              <Button variant="secondary" onClick={testConnection} disabled={testing} className="gap-2">
                <PlugZap className="h-4 w-4" /> {testing ? "Teste..." : "Verbindung testen"}
              </Button>
            </div>
          </div>
          {testResult && (
            <div className="text-xs font-mono-tech text-muted-foreground">Test: {testResult}</div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          {(["autoplay", "muted", "controls"] as const).map((key) => (
            <label key={key} className="inline-flex cursor-pointer items-center gap-2 text-xs font-mono-tech uppercase tracking-widest text-muted-foreground">
              <Checkbox
                checked={opts[key]}
                onCheckedChange={(value) => setOpts((current) => ({ ...current, [key]: !!value }))}
              />
              {key === "controls" ? "Controls anzeigen" : key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
          ))}
        </div>

        {error && (
          <div className="border border-primary/40 bg-primary/10 px-3 py-2 text-xs text-primary">
            {error} / Kein automatischer Reconnect. Bitte manuell Stream laden druecken.
          </div>
        )}

        <div className="border-t border-border pt-3 text-[11px] leading-relaxed text-muted-foreground">
          OBS sendet per RTMP an den Streaming-Server. Die Webseite spielt die daraus erzeugte HLS-URL ab.
          <br />
          <span className="font-mono-tech">Produktion:</span> /hls/live/stream/index.m3u8
          <br />
          <span className="font-mono-tech">Development fallback:</span> http://31.70.86.73:8890/live/stream/index.m3u8
        </div>
      </div>
    </div>
  );
}
