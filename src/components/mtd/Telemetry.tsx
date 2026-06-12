import { useEffect, useState } from "react";
import { Gauge, Timer, Thermometer, Flag, Activity, Wind } from "lucide-react";

interface TileProps { label: string; value: string; unit?: string; Icon: typeof Gauge; tone?: "default" | "primary" | "accent" | "signal"; }
function Tile({ label, value, unit, Icon, tone = "default" }: TileProps) {
  const toneCls = {
    default: "text-foreground",
    primary: "text-primary",
    accent: "text-accent",
    signal: "text-signal-on",
  }[tone];
  return (
    <div className="carbon-panel rounded-md p-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-mono-tech uppercase tracking-widest text-muted-foreground">{label}</span>
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`font-display text-2xl font-bold ${toneCls}`}>{value}</span>
        {unit && <span className="text-xs text-muted-foreground font-mono-tech">{unit}</span>}
      </div>
    </div>
  );
}

export function Telemetry() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick((n) => n + 1), 1500); return () => clearInterval(t); }, []);
  const r = (a: number, b: number) => (a + Math.random() * (b - a));
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" key={tick}>
      <Tile label="Speed" value={r(210, 285).toFixed(0)} unit="km/h" Icon={Gauge} tone="primary" />
      <Tile label="Rundenzeit" value={`1:${(30 + Math.random() * 4).toFixed(2)}`} Icon={Timer} tone="accent" />
      <Tile label="Reifen" value={r(82, 104).toFixed(0)} unit="°C" Icon={Thermometer} tone="signal" />
      <Tile label="Position" value={`P${Math.ceil(r(1, 14))}`} Icon={Flag} tone="primary" />
      <Tile label="G-Force" value={r(2.1, 4.2).toFixed(1)} unit="g" Icon={Activity} />
      <Tile label="Wind" value={r(4, 19).toFixed(0)} unit="km/h" Icon={Wind} />
    </div>
  );
}
