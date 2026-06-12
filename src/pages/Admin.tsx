import { useOBS } from "@/hooks/useOBS";
import { TopStatusBar } from "@/components/mtd/TopStatusBar";
import { ConnectionPanel } from "@/components/mtd/ConnectionPanel";
import { ControlPanel } from "@/components/mtd/ControlPanel";
import { StreamStateCard } from "@/components/mtd/StreamStateCard";
import { HlsPlayer } from "@/components/mtd/HlsPlayer";
import { LiveChat } from "@/components/mtd/LiveChat";
import { Telemetry } from "@/components/mtd/Telemetry";
import { Flag } from "lucide-react";

const TICKER = [
  "F4 GERMANY · LIVE",
  "FORMULA REGIONAL EUROPE",
  "TCR DEUTSCHLAND",
  "BOXENFUNK · DEUTSCH KOMMENTIERT",
  "NÄCHSTES RENNEN: HOCKENHEIM 14:30",
  "QUALIFYING: P1 MÜLLER · 1:29.847",
  "WETTER: 22°C · TROCKEN",
];

const Index = () => {
  const { state, connect, disconnect, setScene, call, refreshStatus } = useOBS();

  return (
    <div className="min-h-screen flex flex-col">
      <TopStatusBar state={state} />

      {/* Header */}
      <header className="border-b border-border bg-background/60 backdrop-blur-sm">
        <div className="container flex items-center gap-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 rounded-sm bg-gradient-live grid place-items-center shadow-glow-red">
              <Flag className="h-6 w-6 text-primary-foreground" />
              <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-accent border-2 border-background" />
            </div>
            <div>
              <div className="font-display text-xl font-bold tracking-wider leading-none">
                <span className="text-foreground">MTD</span>
                <span className="text-primary">·</span>
                <span className="text-accent">CONTROL</span>
              </div>
              <div className="text-[10px] font-mono-tech tracking-widest text-muted-foreground uppercase mt-0.5">
                Motorsport Television Deutschland
              </div>
            </div>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-2 text-[10px] font-mono-tech tracking-widest text-muted-foreground uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Broadcast Center · v1.0
          </div>
        </div>
      </header>

      {/* Hero ticker */}
      <section className="relative border-b border-border bg-gradient-hero overflow-hidden">
        <div className="container py-8 md:py-12 relative">
          <div className="text-[11px] font-mono-tech tracking-widest text-accent uppercase mb-2">Sendung Heute</div>
          <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold tracking-wider leading-tight">
            F4 <span className="text-muted-foreground">·</span> FORMULA REGIONAL{" "}
            <span className="text-muted-foreground">·</span> TCR
            <br />
            <span className="text-primary">LIVE</span> AUF <span className="text-accent">DEUTSCH</span>
          </h1>
          <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl">
            Live-Übertragung & Broadcast-Steuerung für den deutschsprachigen Motorsport.
            OBS Studio lokal verbinden, Szenen umschalten, Stream & Aufnahme kontrollieren.
          </p>
        </div>
        <div className="border-t border-border bg-ticker-bg/80 overflow-hidden">
          <div className="flex whitespace-nowrap ticker-track py-2">
            {[...TICKER, ...TICKER].map((t, i) => (
              <span key={i} className="px-6 text-xs font-mono-tech tracking-widest text-muted-foreground uppercase">
                <span className="text-primary mr-2">●</span>{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Main grid */}
      <main className="container py-6 md:py-8 space-y-6 flex-1">
        <Telemetry />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <HlsPlayer />
            <StreamStateCard state={state} />
            <ConnectionPanel state={state} onConnect={connect} onDisconnect={disconnect} />
          </div>
          <div className="space-y-6">
            <ControlPanel state={state} onScene={setScene} onCall={call} onRefresh={refreshStatus} />
          </div>
        </div>

        <LiveChat />
      </main>

      <footer className="border-t border-border bg-ticker-bg/80">
        <div className="container py-4 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono-tech tracking-widest uppercase text-muted-foreground">
          <span>© MTD Broadcast · Motorsport Television Deutschland</span>
          <span>Local-First · obs-websocket v5 · ws://127.0.0.1:4455</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
