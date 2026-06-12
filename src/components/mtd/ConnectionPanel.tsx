import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plug, PlugZap, Info } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { OBSState } from "@/hooks/useOBS";

interface Props {
  state: OBSState;
  onConnect: (url: string, password?: string) => void;
  onDisconnect: () => void;
}

const LS_URL = "mtd.obs.url";
const LS_PASS = "mtd.obs.pass";
const LS_REMEMBER = "mtd.obs.remember";

export function ConnectionPanel({ state, onConnect, onDisconnect }: Props) {
  const [url, setUrl] = useState("ws://127.0.0.1:4455");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem(LS_URL);
    const r = localStorage.getItem(LS_REMEMBER) === "1";
    const p = localStorage.getItem(LS_PASS);
    if (u) setUrl(u);
    if (r) setRemember(true);
    if (r && p) setPassword(p);
  }, []);

  const handleConnect = () => {
    localStorage.setItem(LS_URL, url);
    if (remember) {
      localStorage.setItem(LS_REMEMBER, "1");
      localStorage.setItem(LS_PASS, password);
    } else {
      localStorage.setItem(LS_REMEMBER, "0");
      localStorage.removeItem(LS_PASS);
    }
    onConnect(url.trim(), password);
  };

  const busy = state.status === "connecting";
  const connected = state.status === "connected";

  return (
    <div className="carbon-panel rounded-md p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold tracking-wider uppercase">OBS Verbindung</h2>
          <p className="text-xs text-muted-foreground">obs-websocket v5 · lokale Steuerung</p>
        </div>
        <StatusBadge status={state.status} />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="obs-url" className="text-[11px] font-mono-tech uppercase tracking-wider text-muted-foreground">WebSocket URL</Label>
          <Input id="obs-url" value={url} onChange={(e) => setUrl(e.target.value)} disabled={connected || busy}
            className="font-mono-tech bg-background/60" placeholder="ws://127.0.0.1:4455" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="obs-pass" className="text-[11px] font-mono-tech uppercase tracking-wider text-muted-foreground">Passwort (optional)</Label>
          <Input id="obs-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={connected || busy}
            className="font-mono-tech bg-background/60" placeholder="••••••••" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} disabled={connected || busy} />
          Passwort lokal speichern
        </label>
        <div className="ml-auto flex gap-2">
          {!connected ? (
            <Button onClick={handleConnect} disabled={busy} className="bg-primary hover:bg-primary/90 font-display tracking-wider uppercase">
              <PlugZap className="h-4 w-4 mr-1.5" /> Verbinden
            </Button>
          ) : (
            <Button onClick={onDisconnect} variant="outline" className="font-display tracking-wider uppercase border-live/40 text-live hover:bg-live/10 hover:text-live">
              <Plug className="h-4 w-4 mr-1.5" /> Trennen
            </Button>
          )}
        </div>
      </div>

      {state.error && (
        <div className="flex items-start gap-2 rounded-sm border border-live/40 bg-live/10 px-3 py-2 text-sm text-live">
          <span className="font-mono-tech font-bold text-xs mt-0.5">ERR</span>
          <span>{state.error}</span>
        </div>
      )}

      <div className="flex items-start gap-2 rounded-sm border border-border bg-carbon-elevated/40 px-3 py-2 text-xs text-muted-foreground">
        <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
        <p>
          OBS Studio muss geöffnet sein. WebSocket aktivieren unter
          <span className="text-foreground"> Werkzeuge → WebSocket Server-Einstellungen </span>
          (Port <span className="font-mono-tech text-accent">4455</span>). Diese App muss über
          <span className="font-mono-tech text-accent"> http://127.0.0.1 </span> oder
          <span className="font-mono-tech text-accent"> localhost </span> geöffnet sein – HTTPS blockiert die lokale OBS-Verbindung.
          {state.obsVersion && <span className="block mt-1 text-foreground">obs-websocket v{state.obsVersion}</span>}
        </p>
      </div>
    </div>
  );
}
