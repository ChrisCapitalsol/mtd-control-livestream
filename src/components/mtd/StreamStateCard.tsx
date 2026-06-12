import type { OBSState } from "@/hooks/useOBS";
import { Radio } from "lucide-react";

export function StreamStateCard({ state }: { state: OBSState }) {
  let line1 = "KEIN STREAM AKTIV";
  let line2 = "Warte auf OBS-Verbindung…";
  let tone: "off" | "idle" | "live" = "off";

  if (state.status === "connected" && state.streaming) {
    line1 = "LIVE";
    line2 = "Stream aktiv";
    tone = "live";
  } else if (state.status === "connected") {
    line1 = "OBS VERBUNDEN";
    line2 = "Stream nicht aktiv";
    tone = "idle";
  } else if (state.status === "connecting") {
    line1 = "VERBINDE MIT OBS…";
    line2 = "Bitte warten";
  } else if (state.status === "error") {
    line1 = "VERBINDUNGSFEHLER";
    line2 = state.error ?? "Unbekannter Fehler";
  }

  return (
    <div className="relative carbon-panel rounded-md p-6 overflow-hidden">
      <div className="absolute inset-0 scan-lines pointer-events-none opacity-50" />
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />

      <div className="relative flex items-center justify-between mb-4">
        <div className="text-[10px] font-mono-tech uppercase tracking-widest text-muted-foreground">Stream Status</div>
        {tone === "live" && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-gradient-live live-pulse">
            <span className="h-2 w-2 rounded-full bg-white blink" />
            <span className="text-xs font-display font-bold tracking-widest text-white">LIVE</span>
          </div>
        )}
      </div>

      <div className="relative">
        <div className={`font-display text-4xl md:text-5xl font-bold tracking-wider mb-2
          ${tone === "live" ? "text-live" : tone === "idle" ? "text-accent" : "text-foreground"}`}>
          {line1}
        </div>
        <div className="text-sm text-muted-foreground">{line2}</div>
      </div>

      <div className="relative mt-6 grid grid-cols-3 gap-3 pt-4 border-t border-border">
        <Metric label="Streaming" value={state.streaming ? "AKTIV" : "AUS"} on={state.streaming} />
        <Metric label="Recording" value={state.recording ? "AKTIV" : "AUS"} on={state.recording} />
        <Metric label="Szenen" value={String(state.scenes.length)} on={state.scenes.length > 0} />
      </div>

      <Radio className="absolute -right-6 -bottom-6 h-32 w-32 text-primary/5" />
    </div>
  );
}

function Metric({ label, value, on }: { label: string; value: string; on: boolean }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] font-mono-tech uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`font-display text-lg font-bold ${on ? "text-signal-on" : "text-muted-foreground"}`}>{value}</div>
    </div>
  );
}
