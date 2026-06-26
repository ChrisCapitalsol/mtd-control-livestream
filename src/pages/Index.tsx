import { PublicHlsPlayer } from "@/components/mtd/PublicHlsPlayer";

const telemetryCards = [
  { label: "Speed", value: "283", unit: "km/h" },
  { label: "Rundenzeit", value: "1:33.72", unit: "" },
  { label: "Reifen", value: "93", unit: "C" },
  { label: "Position", value: "P2", unit: "" },
  { label: "G-Force", value: "2.9", unit: "g" },
  { label: "Wind", value: "6", unit: "km/h" },
];

const tickerItems = [
  "F4 Live",
  "Formula Regional Europe",
  "TCR Deutschland",
  "Boxenfunk deutsch kommentiert",
  "Naechstes Rennen Monaco",
];

const chatMessages = [
  { time: "16:58", name: "RennfahrerMax", text: "Boxenstopp war perfekt.", tone: "text-accent" },
  { time: "16:58", name: "F4_Fan_Berlin", text: "Starkes Manoever in Kurve 3.", tone: "text-signal-on" },
  { time: "16:59", name: "TCR_Hamburg", text: "Beste Uebertragung auf Deutsch.", tone: "text-live" },
  { time: "16:59", name: "PaddockGirl", text: "Reifenwechsel jetzt.", tone: "text-accent" },
  { time: "17:00", name: "ApexHunter", text: "Sektor 2 ist heute sehr eng.", tone: "text-signal-on" },
  { time: "17:00", name: "Startampel", text: "Noch 5 Runden, Spannung pur.", tone: "text-accent" },
];

const infoRows = [
  ["Event", "Großer Preis von Monaco"],
  ["Serien", "F4 / Formula Regional / TCR"],
  ["Session", "Live-Sendung"],
  ["Sprache", "Deutsch kommentiert"],
];

const Index = () => {
  return (
    <div className="broadcast-shell min-h-screen text-foreground">
      <header className="broadcast-topbar">
        <div className="container flex min-h-14 items-center gap-4">
          <div className="brand-lockup">
            <span className="brand-mark">MTD</span>
            <span className="brand-name">Motorsport Television Deutschland</span>
          </div>
          <nav className="ml-auto hidden items-center gap-5 text-[11px] font-mono-tech uppercase tracking-[0.18em] text-muted-foreground md:flex">
            <span className="status-pill status-live">Live Status</span>
            <span>Stream</span>
            <span>Renninfo</span>
            <span>Kontakt</span>
          </nav>
        </div>
      </header>

      <section className="event-hero">
        <div className="container relative z-10 grid gap-6 py-8 md:py-10 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <div className="broadcast-kicker">Sendung heute / Public Livestream</div>
            <h1 className="broadcast-title">
              F4 / Formula Regional / TCR
              <span>live auf deutsch</span>
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              Live-Uebertragung fuer den deutschsprachigen Motorsport. Der Stream wird direkt aus OBS per RTMP/HLS bereitgestellt.
            </p>
          </div>
          <div className="event-meta-grid">
            <div>
              <span>Session</span>
              <strong>Live-Sendung</strong>
            </div>
            <div>
              <span>Ort</span>
              <strong>Monaco</strong>
            </div>
            <div>
              <span>Signal</span>
              <strong>HLS</strong>
            </div>
          </div>
        </div>
        <div className="ticker-strip" aria-label="Broadcast ticker">
          <div className="ticker-mask">
            <div className="ticker-track">
              {[...tickerItems, ...tickerItems].map((item, index) => (
                <span key={`${item}-${index}`}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="container space-y-6 py-6 md:py-8">
        <section className="telemetry-ribbon" aria-label="Broadcast telemetry">
          {telemetryCards.map((card) => (
            <div key={card.label} className="telemetry-cell">
              <span>{card.label}</span>
              <strong className={card.label === "Rundenzeit" ? "text-special" : ""}>
                {card.value}
                {card.unit && <small>{card.unit}</small>}
              </strong>
            </div>
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px] 2xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-5">
            <PublicHlsPlayer />
            <section className="broadcast-panel">
              <div className="panel-heading">
                <span>Renninformationen</span>
                <small>Broadcast Table</small>
              </div>
              <div className="results-table">
                {infoRows.map(([label, value]) => (
                  <div key={label} className="results-row">
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="broadcast-panel live-chat-panel">
            <div className="panel-heading">
              <span>Live Chat</span>
              <small>DE / Moderated</small>
            </div>
            <div className="chat-feed">
              {chatMessages.map((msg, index) => (
                <div key={`${msg.time}-${index}`} className="chat-line">
                  <time>{msg.time}</time>
                  <strong className={msg.tone}>{msg.name}</strong>
                  <span>{msg.text}</span>
                </div>
              ))}
            </div>
            <div className="chat-input-ghost">Chat ist fuer Zuschauer aktuell nur als Anzeige aktiv.</div>
          </aside>
        </section>

        <section className="broadcast-panel">
          <div className="panel-heading">
            <span>Public Safety</span>
            <small>OBS Controls</small>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Diese oeffentliche Seite enthaelt keine OBS-Steuerung. Szenenwechsel, Aufnahme und Stream-Start sind nur im geschuetzten Admin-Bereich vorgesehen.
          </p>
        </section>
      </main>

      <footer className="broadcast-footer">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-5 text-[11px] font-mono-tech uppercase tracking-[0.18em] text-muted-foreground">
          <span>MTD Broadcast / Motorsport Television Deutschland</span>
          <span>Impressum / Datenschutz / Kontakt</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
