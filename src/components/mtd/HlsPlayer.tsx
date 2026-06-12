import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RefreshCw, Play, PlugZap, Radio, Square } from "lucide-react";

const STORAGE_KEY = "mtd.hls.url";
const STORAGE_OPTS = "mtd.hls.opts";
const DEFAULT_URL = "http://127.0.0.1:8890/live/stream/index.m3u8";

type Opts = { autoplay: boolean; muted: boolean; controls: boolean };

function translateHlsError(data: any): string {
  if (!data) return "Unbekannter HLS-Fehler.";
  const { type, details, response } = data;
  if (details === "manifestLoadError" || details === "manifestLoadTimeOut") {
    return "HLS-Manifest nicht erreichbar. Läuft der Streaming-Server?";
  }
  if (details === "manifestParsingError") return "HLS-Manifest konnte nicht gelesen werden (Format ungültig).";
  if (details === "levelLoadError") return "Stream-Level nicht erreichbar. Stream offline?";
  if (response?.code === 0) return "Netzwerk-/CORS-Fehler. Bitte CORS am Server prüfen.";
  if (type === "networkError") return "Netzwerkfehler beim Laden des Streams.";
  if (type === "mediaError") return "Medienfehler. Format nicht unterstützt oder defekter Stream.";
  return `HLS-Fehler: ${details || type || "unbekannt"}`;
}

export function HlsPlayer() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [url, setUrl] = useState<string>(() => localStorage.getItem(STORAGE_KEY) || DEFAULT_URL);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const [opts, setOpts] = useState<Opts>(() => {
    try {
      const v = localStorage.getItem(STORAGE_OPTS);
      if (v) return JSON.parse(v);
    } catch {/* */}
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
      try { hlsRef.current.destroy(); } catch {/* */}
      hlsRef.current = null;
    }
    const v = videoRef.current;
    if (v) {
      try { v.pause(); v.removeAttribute("src"); v.load(); } catch {/* */}
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

    const canNative = video.canPlayType("application/vnd.apple.mpegurl");

    if (canNative) {
      video.src = target;
      if (opts.autoplay) video.play().catch(() => {/* user gesture */});
      return;
    }

    if (!Hls.isSupported()) {
      setError("HLS wird in diesem Browser nicht unterstützt.");
      setActive(false);
      return;
    }

    // No auto-retry / no auto-reconnect: disable internal retry loops.
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
      if (opts.autoplay) video.play().catch(() => {/* */});
    });
    hls.on(Hls.Events.ERROR, (_e, data) => {
      if (data.fatal) {
        setError(translateHlsError(data));
        setPlaying(false);
        setActive(false);
        // Hard stop — no recovery, no retry.
        try { hls.destroy(); } catch {/* */}
        if (hlsRef.current === hls) hlsRef.current = null;
      }
    });
  }, [destroy, opts.autoplay]);

  // Cleanup on unmount only — no auto-load on mount.
  useEffect(() => {
    return () => destroy();
  }, [destroy]);

  const testConnection = useCallback(async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(url, { method: "GET", cache: "no-store" });
      if (res.ok) setTestResult(`OK · HTTP ${res.status}`);
      else setTestResult(`Fehler · HTTP ${res.status}`);
    } catch (e: any) {
      setTestResult(`Nicht erreichbar (CORS/Netzwerk): ${e?.message ?? "unbekannt"}`);
    } finally {
      setTesting(false);
    }
  }, [url]);

  return (
    <div className="carbon-panel rounded-md overflow-hidden">
      {/* Video area */}
      <div className="relative bg-black aspect-video">
        <video
          ref={videoRef}
          className="w-full h-full object-contain bg-black"
          controls={opts.controls}
          muted={opts.muted}
          playsInline
          onPlaying={() => { setPlaying(true); setError(null); }}
          onPause={() => setPlaying(false)}
          onWaiting={() => setPlaying(false)}
        />

        {/* Overlay when not playing */}
        {!playing && (
          <div className="absolute inset-0 grid place-items-center pointer-events-none bg-gradient-hero">
            <div className="text-center px-4">
              <Radio className="h-12 w-12 mx-auto text-primary/60 mb-3" />
              <div className="font-display text-2xl md:text-3xl font-bold tracking-wider text-foreground">
                {error ? "STREAM OFFLINE" : active ? "STREAM WIRD GELADEN…" : "KEIN STREAM AKTIV"}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {error ? error : active ? "Warte auf HLS-Manifest…" : 'Klicke auf „Stream laden“, um den HLS-Stream zu starten.'}
              </div>
            </div>
          </div>
        )}

        {/* LIVE badge */}
        {playing && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-gradient-live live-pulse">
            <span className="h-2 w-2 rounded-full bg-white blink" />
            <span className="text-xs font-display font-bold tracking-widest text-white">LIVE</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 space-y-3 border-t border-border">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[10px] font-mono-tech uppercase tracking-widest text-muted-foreground">
            HLS Player
          </div>
          {loadedUrl && (
            <div className="text-[10px] font-mono-tech text-muted-foreground truncate max-w-[60%]" title={loadedUrl}>
              {loadedUrl}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="hls-url" className="text-xs font-mono-tech uppercase tracking-widest text-muted-foreground">
            HLS Stream URL
          </Label>
          <div className="flex flex-col sm:flex-row gap-2">
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
                <PlugZap className="h-4 w-4" /> {testing ? "Teste…" : "Verbindung testen"}
              </Button>
            </div>
          </div>
          {testResult && (
            <div className="text-xs font-mono-tech text-muted-foreground">Test: {testResult}</div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          {(["autoplay", "muted", "controls"] as const).map((k) => (
            <label key={k} className="inline-flex items-center gap-2 text-xs font-mono-tech uppercase tracking-widest text-muted-foreground cursor-pointer">
              <Checkbox
                checked={opts[k]}
                onCheckedChange={(v) => setOpts((o) => ({ ...o, [k]: !!v }))}
              />
              {k === "controls" ? "Controls anzeigen" : k.charAt(0).toUpperCase() + k.slice(1)}
            </label>
          ))}
        </div>

        {error && (
          <div className="rounded-sm border border-primary/40 bg-primary/10 px-3 py-2 text-xs text-primary">
            {error} · Kein automatischer Reconnect. Bitte manuell „Stream laden“ drücken.
          </div>
        )}

        <div className="text-[11px] text-muted-foreground leading-relaxed border-t border-border pt-3">
          OBS sendet per RTMP an den Streaming-Server. Die Webseite spielt die daraus erzeugte HLS-URL ab.
          <br />
          <span className="font-mono-tech">Beispiel MediaMTX lokal:</span>
          <br />
          <span className="font-mono-tech">OBS Server:</span> rtmp://127.0.0.1:1936/live
          <br />
          <span className="font-mono-tech">OBS Stream Key:</span> stream
          <br />
          <span className="font-mono-tech">HLS URL:</span> http://127.0.0.1:8890/live/stream/index.m3u8
        </div>
      </div>
    </div>
  );
}
