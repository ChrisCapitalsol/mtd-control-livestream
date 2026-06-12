import { Button } from "@/components/ui/button";
import { Play, Square, Circle, RefreshCw, Layers } from "lucide-react";
import type { OBSState } from "@/hooks/useOBS";

interface Props {
  state: OBSState;
  onScene: (name: string) => void;
  onCall: (req: "StartStream" | "StopStream" | "StartRecord" | "StopRecord") => void;
  onRefresh: () => void;
}

export function ControlPanel({ state, onScene, onCall, onRefresh }: Props) {
  const disabled = state.status !== "connected";

  return (
    <div className="carbon-panel rounded-md p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold tracking-wider uppercase flex items-center gap-2">
          <Layers className="h-4 w-4 text-accent" /> Szenen & Steuerung
        </h2>
        <Button size="sm" variant="ghost" onClick={onRefresh} disabled={disabled} className="h-8 text-xs font-mono-tech uppercase tracking-wider">
          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Aktualisieren
        </Button>
      </div>

      <div className="space-y-2">
        <div className="text-[10px] font-mono-tech uppercase tracking-widest text-muted-foreground">Aktuelle Szene</div>
        <div className="font-display text-base font-bold text-accent truncate">
          {state.currentScene ?? "—"}
        </div>
      </div>

      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {state.scenes.length === 0 && (
          <div className="text-xs text-muted-foreground italic py-4 text-center border border-dashed border-border rounded-sm">
            {disabled ? "Mit OBS verbinden, um Szenen zu laden" : "Keine Szenen gefunden"}
          </div>
        )}
        {state.scenes.map((s) => {
          const active = s.sceneName === state.currentScene;
          return (
            <button
              key={s.sceneName}
              onClick={() => onScene(s.sceneName)}
              disabled={disabled}
              className={`w-full text-left px-3 py-2 rounded-sm border text-sm font-medium transition-all
                ${active
                  ? "bg-primary/15 border-primary/60 text-foreground shadow-glow-red"
                  : "bg-carbon-elevated/40 border-border hover:border-accent/50 hover:bg-carbon-elevated"}
                disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{s.sceneName}</span>
                {active && <span className="text-[10px] font-mono-tech font-bold text-primary tracking-wider">ON AIR</span>}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
        {!state.streaming ? (
          <Button onClick={() => onCall("StartStream")} disabled={disabled}
            className="bg-primary hover:bg-primary/90 font-display uppercase tracking-wider">
            <Play className="h-4 w-4 mr-1" /> Stream Start
          </Button>
        ) : (
          <Button onClick={() => onCall("StopStream")} disabled={disabled} variant="outline"
            className="font-display uppercase tracking-wider border-live/50 text-live hover:bg-live/10 hover:text-live">
            <Square className="h-4 w-4 mr-1" /> Stream Stop
          </Button>
        )}
        {!state.recording ? (
          <Button onClick={() => onCall("StartRecord")} disabled={disabled} variant="outline"
            className="font-display uppercase tracking-wider border-accent/40 text-accent hover:bg-accent/10 hover:text-accent">
            <Circle className="h-4 w-4 mr-1" /> REC Start
          </Button>
        ) : (
          <Button onClick={() => onCall("StopRecord")} disabled={disabled} variant="outline"
            className="font-display uppercase tracking-wider border-accent/60 text-accent hover:bg-accent/10 hover:text-accent">
            <Square className="h-4 w-4 mr-1" /> REC Stop
          </Button>
        )}
      </div>
    </div>
  );
}
