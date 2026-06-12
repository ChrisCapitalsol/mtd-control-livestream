import { SignalDot } from "./StatusBadge";
import type { OBSState } from "@/hooks/useOBS";
import { useEffect, useState } from "react";

export function TopStatusBar({ state }: { state: OBSState }) {
  const [viewers, setViewers] = useState(1247);
  const [bitrate, setBitrate] = useState(6420);
  useEffect(() => {
    const t = setInterval(() => {
      setViewers((v) => Math.max(800, v + Math.round((Math.random() - 0.45) * 25)));
      setBitrate(() => 5800 + Math.round(Math.random() * 900));
    }, 2500);
    return () => clearInterval(t);
  }, []);

  const connected = state.status === "connected";
  const live = connected && state.streaming;

  return (
    <div className="border-b border-border bg-ticker-bg/80 backdrop-blur-sm">
      <div className="container flex flex-wrap items-center gap-2 py-2">
        <SignalDot on={live} label="HLS" />
        <SignalDot on={live} label="CDN" />
        <SignalDot on={connected} label="WS" />
        <SignalDot on={connected} label="AUTH" />
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-sm bg-carbon-elevated/60 border border-border">
            <span className="text-[10px] font-mono-tech tracking-widest text-muted-foreground uppercase mr-2">Bitrate</span>
            <span className="text-xs font-mono-tech font-bold text-accent">{live ? bitrate : 0} kbps</span>
          </div>
          <div className="px-3 py-1.5 rounded-sm bg-carbon-elevated/60 border border-border">
            <span className="text-[10px] font-mono-tech tracking-widest text-muted-foreground uppercase mr-2">Zuschauer</span>
            <span className="text-xs font-mono-tech font-bold text-signal-on">{live ? viewers.toLocaleString("de-DE") : 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
