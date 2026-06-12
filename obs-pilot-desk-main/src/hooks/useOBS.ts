import { useCallback, useEffect, useRef, useState } from "react";
import OBSWebSocket from "obs-websocket-js";

export type OBSStatus = "disconnected" | "connecting" | "connected" | "error";

export interface OBSScene {
  sceneName: string;
  sceneIndex: number;
}

export interface OBSState {
  status: OBSStatus;
  error: string | null;
  scenes: OBSScene[];
  currentScene: string | null;
  streaming: boolean;
  recording: boolean;
  obsVersion: string | null;
}

const initial: OBSState = {
  status: "disconnected",
  error: null,
  scenes: [],
  currentScene: null,
  streaming: false,
  recording: false,
  obsVersion: null,
};

function translateError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  const lower = msg.toLowerCase();
  if (lower.includes("authentication") || lower.includes("4009")) {
    return "Authentifizierung fehlgeschlagen. Bitte Passwort prüfen.";
  }
  if (lower.includes("refused") || lower.includes("econnrefused")) {
    return "Verbindung verweigert. Ist OBS geöffnet und WebSocket auf Port 4455 aktiviert?";
  }
  if (lower.includes("mixed content") || lower.includes("insecure")) {
    return "Mixed-Content-Fehler. Bitte die App über http://127.0.0.1 öffnen (nicht HTTPS).";
  }
  if (lower.includes("timeout")) {
    return "Zeitüberschreitung. OBS antwortet nicht – läuft OBS auf dieser Maschine?";
  }
  if (lower.includes("failed to construct") || lower.includes("invalid url")) {
    return "Ungültige WebSocket-URL. Beispiel: ws://127.0.0.1:4455";
  }
  return `OBS-Fehler: ${msg}`;
}

export function useOBS() {
  const obsRef = useRef<OBSWebSocket | null>(null);
  const [state, setState] = useState<OBSState>(initial);
  const pollRef = useRef<number | null>(null);

  const refreshStatus = useCallback(async () => {
    const obs = obsRef.current;
    if (!obs) return;
    try {
      const [scenes, stream, record] = await Promise.all([
        obs.call("GetSceneList"),
        obs.call("GetStreamStatus"),
        obs.call("GetRecordStatus"),
      ]);
      setState((s) => ({
        ...s,
        scenes: (scenes.scenes as unknown as OBSScene[]).slice().reverse(),
        currentScene: scenes.currentProgramSceneName ?? null,
        streaming: !!stream.outputActive,
        recording: !!record.outputActive,
      }));
    } catch (e) {
      // silent during poll
      console.warn("OBS status refresh failed", e);
    }
  }, []);

  const connect = useCallback(async (url: string, password?: string) => {
    if (obsRef.current) {
      try { await obsRef.current.disconnect(); } catch {/* */}
    }
    const obs = new OBSWebSocket();
    obsRef.current = obs;
    setState((s) => ({ ...s, status: "connecting", error: null }));

    obs.on("ConnectionClosed", () => {
      setState((s) => ({ ...s, status: s.status === "error" ? "error" : "disconnected" }));
    });
    obs.on("CurrentProgramSceneChanged", (d) => {
      setState((s) => ({ ...s, currentScene: d.sceneName }));
    });
    obs.on("SceneListChanged", (d) => {
      setState((s) => ({ ...s, scenes: (d.scenes as unknown as OBSScene[]).slice().reverse() }));
    });
    obs.on("StreamStateChanged", (d) => {
      setState((s) => ({ ...s, streaming: !!d.outputActive }));
    });
    obs.on("RecordStateChanged", (d) => {
      setState((s) => ({ ...s, recording: !!d.outputActive }));
    });

    try {
      const { obsWebSocketVersion } = await obs.connect(url, password || undefined);
      setState((s) => ({ ...s, status: "connected", error: null, obsVersion: obsWebSocketVersion }));
      await refreshStatus();
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = window.setInterval(refreshStatus, 4000);
    } catch (e) {
      setState((s) => ({ ...s, status: "error", error: translateError(e) }));
    }
  }, [refreshStatus]);

  const disconnect = useCallback(async () => {
    if (pollRef.current) { window.clearInterval(pollRef.current); pollRef.current = null; }
    try { await obsRef.current?.disconnect(); } catch {/* */}
    obsRef.current = null;
    setState({ ...initial });
  }, []);

  const setScene = useCallback(async (sceneName: string) => {
    try {
      await obsRef.current?.call("SetCurrentProgramScene", { sceneName });
      setState((s) => ({ ...s, currentScene: sceneName }));
    } catch (e) {
      setState((s) => ({ ...s, error: translateError(e) }));
    }
  }, []);

  const call = useCallback(async (req: "StartStream" | "StopStream" | "StartRecord" | "StopRecord") => {
    try {
      await obsRef.current?.call(req);
      await refreshStatus();
    } catch (e) {
      setState((s) => ({ ...s, error: translateError(e) }));
    }
  }, [refreshStatus]);

  useEffect(() => () => { if (pollRef.current) window.clearInterval(pollRef.current); obsRef.current?.disconnect().catch(() => {}); }, []);

  return { state, connect, disconnect, setScene, call, refreshStatus };
}
