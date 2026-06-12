import { Radio, Wifi, WifiOff, Loader2, AlertTriangle } from "lucide-react";
import type { OBSStatus } from "@/hooks/useOBS";

export function StatusBadge({ status }: { status: OBSStatus }) {
  const map: Record<OBSStatus, { label: string; cls: string; Icon: typeof Radio }> = {
    disconnected: { label: "GETRENNT", cls: "bg-muted text-muted-foreground border-border", Icon: WifiOff },
    connecting:   { label: "VERBINDE…", cls: "bg-accent/15 text-accent border-accent/40", Icon: Loader2 },
    connected:    { label: "VERBUNDEN", cls: "bg-signal-on/15 text-signal-on border-signal-on/40", Icon: Wifi },
    error:        { label: "FEHLER", cls: "bg-live/15 text-live border-live/50", Icon: AlertTriangle },
  };
  const { label, cls, Icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border text-[11px] font-mono-tech font-bold tracking-wider ${cls}`}>
      <Icon className={`h-3.5 w-3.5 ${status === "connecting" ? "animate-spin" : ""}`} />
      {label}
    </span>
  );
}

export function SignalDot({ on, label }: { on: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-carbon-elevated/60 border border-border">
      <span className={`h-2 w-2 rounded-full ${on ? "bg-signal-on shadow-[0_0_8px_hsl(var(--signal-on))]" : "bg-signal-off"}`} />
      <span className="text-[10px] font-mono-tech font-bold tracking-widest text-muted-foreground uppercase">{label}</span>
      <span className={`text-[10px] font-mono-tech font-bold ${on ? "text-signal-on" : "text-muted-foreground"}`}>{on ? "ON" : "OFF"}</span>
    </div>
  );
}
