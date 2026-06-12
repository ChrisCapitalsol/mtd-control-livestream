import { useEffect, useRef, useState } from "react";
import { Send, MessageCircle, ArrowDown } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Msg { id: number; user: string; text: string; color: string; time: string; }

const FAKE: Omit<Msg, "id" | "time">[] = [
  { user: "RennfahrerMax", text: "Boxenstopp war perfekt! 🔧", color: "text-accent" },
  { user: "F4_Fan_Berlin", text: "Was für ein Überholmanöver in Kurve 3!", color: "text-signal-on" },
  { user: "TCR_Hamburg", text: "Beste Übertragung auf Deutsch 🇩🇪", color: "text-primary" },
  { user: "PaddockGirl", text: "Reifenwechsel jetzt!", color: "text-accent" },
  { user: "ApexHunter", text: "Sektor 2 ist heute mörderisch", color: "text-signal-on" },
  { user: "BoxenfunkBerlin", text: "Pace ist konstant unter 1:32", color: "text-primary" },
  { user: "Startampel", text: "5 Runden noch — Spannung pur!", color: "text-accent" },
];

const NEAR_BOTTOM_PX = 80;

function now() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export function LiveChat() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [hasNew, setHasNew] = useState(false);
  const idRef = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);

  const isNearBottom = () => {
    const el = scrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR_BOTTOM_PX;
  };

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    stickToBottomRef.current = true;
    setHasNew(false);
  };

  useEffect(() => {
    setMsgs(FAKE.slice(0, 4).map((m) => ({ ...m, id: idRef.current++, time: now() })));
    const t = setInterval(() => {
      const pick = FAKE[Math.floor(Math.random() * FAKE.length)];
      setMsgs((p) => [...p.slice(-40), { ...pick, id: idRef.current++, time: now() }]);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  // After new messages render: only auto-scroll the container if user is at bottom.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (stickToBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    } else {
      setHasNew(true);
    }
  }, [msgs]);

  const handleScroll = () => {
    stickToBottomRef.current = isNearBottom();
    if (stickToBottomRef.current) setHasNew(false);
  };

  const send = () => {
    if (!input.trim()) return;
    stickToBottomRef.current = true;
    setMsgs((p) => [...p, { id: idRef.current++, user: "Du", text: input.trim(), color: "text-foreground", time: now() }]);
    setInput("");
  };

  return (
    <div className="carbon-panel rounded-md flex flex-col h-full min-h-[320px] max-h-[480px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-display font-bold tracking-wider uppercase flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" /> Live Chat
        </h3>
        <span className="text-[10px] font-mono-tech text-muted-foreground tracking-widest">DE · MODERATED</span>
      </div>
      <div className="relative flex-1 min-h-0">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="absolute inset-0 overflow-y-auto overscroll-contain px-4 py-3 space-y-2 text-sm"
        >
          {msgs.map((m) => (
            <div key={m.id} className="leading-snug">
              <span className="font-mono-tech text-[10px] text-muted-foreground mr-2">{m.time}</span>
              <span className={`font-semibold ${m.color}`}>{m.user}</span>
              <span className="text-muted-foreground mx-1">›</span>
              <span className="text-foreground">{m.text}</span>
            </div>
          ))}
        </div>
        {hasNew && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-mono-tech tracking-widest uppercase shadow-glow-red flex items-center gap-1.5 hover:bg-primary/90 transition-colors"
          >
            <ArrowDown className="h-3 w-3" /> Neue Nachrichten
          </button>
        )}
      </div>
      <div className="p-3 border-t border-border flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Nachricht schreiben…" className="bg-background/60" />
        <button onClick={send} className="px-3 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
