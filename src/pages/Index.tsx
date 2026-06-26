import { PublicHlsPlayer } from "@/components/mtd/PublicHlsPlayer";

const telemetryCards = [
  { label: "Speed", value: "283", unit: "km/h" },
  { label: "Rundenzeit", value: "1:33.72", unit: "" },
  { label: "Reifen", value: "93", unit: "°C" },
  { label: "Position", value: "P2", unit: "" },
  { label: "G-Force", value: "2.9", unit: "g" },
  { label: "Wind", value: "6", unit: "km/h" },
];

const tickerItems = [
  "F4 LIVE",
  "Formula Regional Europe",
  "TCR Deutschland",
  "Boxenfunk · Deutsch kommentiert",
  "Nächstes Rennen · Monaco",
];

const chatMessages = [
  { time: "16:58", name: "RennfahrerMax", text: "Boxenstopp war perfekt! 🔧", color: "text-yellow-400" },
  { time: "16:58", name: "F4_Fan_Berlin", text: "Was für ein Überholmanöver in Kurve 3!", color: "text-green-400" },
  { time: "16:59", name: "TCR_Hamburg", text: "Beste Übertragung auf Deutsch 🇩🇪", color: "text-red-400" },
  { time: "16:59", name: "PaddockGirl", text: "Reifenwechsel jetzt!", color: "text-yellow-400" },
  { time: "17:00", name: "ApexHunter", text: "Sektor 2 ist heute mörderisch", color: "text-green-400" },
  { time: "17:00", name: "Startampel", text: "Noch 5 Runden — Spannung pur!", color: "text-yellow-400" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/95 backdrop-blur">
        <div className="container py-5 flex items-center justify-between gap-4">
          <div>
            <div className="font-display text-2xl font-bold tracking-wider">
              MTD<span className="text-primary">CONTROL</span>
            </div>
            <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
              Motorsport Television Deutschland
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary inline-block" />
            Public Livestream
          </div>
        </div>
      </header>

      <section className="border-b border-border bg-gradient-to-br from-red-950/40 via-card to-background">
        <div className="container py-8 md:py-12">
          <div className="text-xs font-mono uppercase tracking-widest text-primary mb-4">
            Sendung heute
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-wider leading-tight">
            F4 · FORMULA REGIONAL · TCR
            <br />
            <span className="text-primary">LIVE</span>{" "}
            <span className="text-foreground">AUF</span>{" "}
            <span className="text-accent">DEUTSCH</span>
          </h1>

          <p className="mt-5 max-w-3xl text-muted-foreground">
            Live-Übertragung für den deutschsprachigen Motorsport. Der Stream
            wird direkt aus OBS per RTMP/HLS bereitgestellt.
          </p>
        </div>

        <div className="border-t border-border bg-background/60 overflow-hidden">
          <div className="container py-3">
            <div className="flex gap-8 whitespace-nowrap text-xs font-mono uppercase tracking-widest text-muted-foreground">
              {tickerItems.map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="container py-8 space-y-8">
        <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {telemetryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-lg border border-border bg-card p-4 min-h-[88px]"
            >
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                {card.label}
              </div>
              <div className="mt-3 font-display text-2xl font-bold tracking-wider">
                <span className={card.label === "Rundenzeit" || card.label === "Reifen" ? "text-accent" : "text-primary"}>
                  {card.value}
                </span>
                {card.unit && (
                  <span className="ml-1 text-sm text-muted-foreground">
                    {card.unit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px] items-start">
          <div className="space-y-6">
            <PublicHlsPlayer />

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="font-display text-xl font-bold tracking-wider mb-3">
                Renninformationen
              </div>
              <div className="grid gap-3 md:grid-cols-3 text-sm">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
                    Event
                  </div>
                  <div>Großer Preis von Monaco</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
                    Serie
                  </div>
                  <div>F4 · Formula Regional · TCR</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
                    Sprache
                  </div>
                  <div>Deutsch kommentiert</div>
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border p-4 flex items-center justify-between">
              <div className="font-display text-xl font-bold tracking-wider">
                LIVE CHAT
              </div>
              <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
                DE · Moderated
              </div>
            </div>

            <div className="h-[420px] overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, index) => (
                <div key={index} className="text-sm font-mono">
                  <span className="text-muted-foreground mr-2">{msg.time}</span>
                  <span className={`${msg.color} font-bold`}>{msg.name}</span>
                  <span className="text-muted-foreground"> &gt; </span>
                  <span>{msg.text}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-4">
              <div className="rounded border border-border bg-background px-3 py-2 text-muted-foreground text-sm">
                Chat ist für Zuschauer aktuell nur als Anzeige aktiv.
              </div>
            </div>
          </aside>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <div className="font-display text-xl font-bold tracking-wider mb-3">
            Hinweis
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Diese öffentliche Seite enthält keine OBS-Steuerung. Szenenwechsel,
            Aufnahme und Stream-Start sind nur im geschützten Admin-Bereich
            verfügbar.
          </p>
        </section>
      </main>

      <footer className="border-t border-border py-6">
        <div className="container text-xs text-muted-foreground font-mono uppercase tracking-widest">
          © MTD Broadcast · Motorsport Television Deutschland · Public Stream
        </div>
      </footer>
    </div>
  );
};

export default Index;
