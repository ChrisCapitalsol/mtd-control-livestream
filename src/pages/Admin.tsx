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
  "F4 Germany / Live",
  "Formula Regional Europe",
  "TCR Deutschland",
  "Boxenfunk deutsch kommentiert",
  "Naechstes Rennen Hockenheim 14:30",
  "Qualifying P1 Mueller / 1:29.847",
  "Wetter 22C / trocken",
];

const Admin = () => {
  const { state, connect, disconnect, setScene, call, refreshStatus } = useOBS();

  return (
    <div className="broadcast-shell min-h-screen">
      <TopStatusBar state={state} />

      <header className="broadcast-topbar">
        <div className="container flex min-h-16 items-center gap-4">
          <div className="grid h-11 w-11 place-items-center border border-primary/60 bg-primary/15 text-primary">
            <Flag className="h-6 w-6" />
          </div>
          <div>
            <div className="font-display text-2xl font-black uppercase italic tracking-[0.08em]">
              MTD <span className="text-primary">Control Room</span>
            </div>
            <div className="text-[10px] font-mono-tech uppercase tracking-[0.2em] text-muted-foreground">
              Motorsport Television Deutschland / obs-websocket v5
            </div>
          </div>
          <div className="ml-auto hidden text-[10px] font-mono-tech uppercase tracking-[0.18em] text-muted-foreground md:block">
            ws://127.0.0.1:4455
          </div>
        </div>
      </header>

      <section className="event-hero compact">
        <div className="container relative z-10 py-7">
          <div className="broadcast-kicker">Admin / Broadcast Operations</div>
          <h1 className="broadcast-title">Live-Regie und OBS-Steuerung</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            OBS lokal verbinden, Szenen umschalten, Stream und Aufnahme kontrollieren. Die oeffentliche Route bleibt frei von OBS-Steuerungen.
          </p>
        </div>
        <div className="ticker-strip">
          <div className="ticker-mask">
            <div className="ticker-track">
              {[...TICKER, ...TICKER].map((item, index) => (
                <span key={`${item}-${index}`}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="container flex-1 space-y-6 py-6 md:py-8">
        <Telemetry />

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
          <div className="space-y-5">
            <HlsPlayer />
            <StreamStateCard state={state} />
            <ConnectionPanel state={state} onConnect={connect} onDisconnect={disconnect} />
          </div>
          <div className="space-y-5">
            <ControlPanel state={state} onScene={setScene} onCall={call} onRefresh={refreshStatus} />
            <LiveChat />
          </div>
        </section>
      </main>

      <footer className="broadcast-footer">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-5 text-[11px] font-mono-tech uppercase tracking-[0.18em] text-muted-foreground">
          <span>MTD Broadcast Control / Motorsport Television Deutschland</span>
          <span>Local-first OBS control / protected server route expected</span>
        </div>
      </footer>
    </div>
  );
};

export default Admin;
