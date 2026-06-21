"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Code2, Eraser, Terminal, ChevronRight, ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSandbox } from "@/lib/sandbox-store";
import { BASE_URL } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { ApiExchange, LogEntry } from "@/lib/types";

export function DeveloperPanel() {
  const { logs, exchanges, clearLogs } = useSandbox();
  const [tab, setTab] = useState<"log" | "inspector">("log");
  const [isCollapsed, setIsCollapsed] = useState(false); // Local toggle state

  // --- COLLAPSED VIEW (Slim Rail) ---
  if (isCollapsed) {
    return (
      <div 
        className="flex h-full w-12 flex-col items-center border-l bg-card py-4 transition-all duration-300"
        onClick={() => setIsCollapsed(false)}
      >
        <Button size="icon" variant="ghost" className="mb-8">
          <ChevronLeft className="size-4" />
        </Button>
        <div className="flex flex-1 items-center justify-center [writing-mode:vertical-lr] rotate-180">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground whitespace-nowrap">
            Developer Logs
          </span>
        </div>
        <Badge variant="secondary" className="mt-4 px-1 text-[10px]">
          {logs.length}
        </Badge>
      </div>
    );
  }

  // --- EXPANDED VIEW (Full Panel) ---
  return (
    <Card className="flex h-full w-[400px] flex-col overflow-hidden border-l border-primary/15 bg-card py-0 rounded-none transition-all duration-300">
      <CardHeader className="gap-0 border-b bg-muted/40 py-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Button 
              size="icon" 
              variant="ghost" 
              className="size-6 mr-1" 
              onClick={() => setIsCollapsed(true)}
            >
              <ChevronRight className="size-4" />
            </Button>
            Developer Mode
          </CardTitle>
          <Button
            size="xs"
            variant="ghost"
            className="h-7 text-[10px]"
            onClick={clearLogs}
          >
            <Eraser className="size-3 mr-1" /> Clear
          </Button>
        </div>
        
        <div className="mt-3 flex gap-1">
          <TabButton active={tab === "log"} onClick={() => setTab("log")} icon={<Terminal className="size-3.5" />}>
            Events
            <Badge variant="secondary" className="ml-1 px-1 text-[9px]">{logs.length}</Badge>
          </TabButton>
          <TabButton active={tab === "inspector"} onClick={() => setTab("inspector")} icon={<Code2 className="size-3.5" />}>
            API
            <Badge variant="secondary" className="ml-1 px-1 text-[9px]">{exchanges.length}</Badge>
          </TabButton>
        </div>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
        {tab === "log" ? <EventLog logs={logs} /> : <Inspector exchanges={exchanges} />}
      </CardContent>
    </Card>
  );
}

// ... TabButton, EventLog, Inspector, etc. remain the same ...

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

const LEVEL_COLOR: Record<LogEntry["level"], string> = {
  info: "text-foreground/80",
  success: "text-accent",
  warn: "text-chart-4",
  error: "text-destructive",
};

function EventLog({ logs }: { logs: LogEntry[] }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  return (
    <div className="h-full overflow-y-auto bg-primary/[0.04] p-3 font-mono text-xs leading-relaxed">
      {logs.length === 0 ? (
        <p className="text-muted-foreground">
          {
            "// Internal conversation between Entry Point, Middleware, Database,"
          }
          <br />
          {"// Rafiki and the Operator will stream here as you interact."}
        </p>
      ) : (
        <div className="grid gap-1">
          {logs.map((l) => (
            <div key={l.id} className="flex flex-wrap items-baseline gap-x-1.5">
              <span className="text-muted-foreground">[{l.time}]</span>
              <span className="font-semibold text-primary">{l.from}</span>
              <span className="text-muted-foreground">{"->"}</span>
              <span className="font-semibold text-chart-3">{l.to}</span>
              <span className="text-muted-foreground">:</span>
              <span className={LEVEL_COLOR[l.level]}>{l.message}</span>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      )}
    </div>
  );
}

function Inspector({ exchanges }: { exchanges: ApiExchange[] }) {
  return (
    <div className="h-full overflow-y-auto p-3">
      <p className="mb-2 font-mono text-[11px] text-muted-foreground">
        BASE_URL {BASE_URL}
      </p>
      {exchanges.length === 0 ? (
        <p className="font-mono text-xs text-muted-foreground">
          {"// Raw request / response payloads appear here on each API call."}
        </p>
      ) : (
        <div className="grid gap-2">
          {exchanges.map((ex) => (
            <ExchangeRow key={ex.id} ex={ex} />
          ))}
        </div>
      )}
    </div>
  );
}

function ExchangeRow({ ex }: { ex: ApiExchange }) {
  const [open, setOpen] = useState(false);
  const ok = ex.status < 400;
  return (
    <div className="rounded-lg border bg-muted/30">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-2.5 py-2 text-left"
      >
        <Badge
          variant="secondary"
          className="font-mono text-[10px] font-semibold"
        >
          {ex.method}
        </Badge>
        <code className="flex-1 truncate font-mono text-xs text-foreground">
          {ex.endpoint}
        </code>
        <span
          className={`font-mono text-xs font-semibold ${
            ok ? "text-accent" : "text-destructive"
          }`}
        >
          {ex.status}
        </span>
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="grid gap-2 border-t p-2.5">
          <JsonBlock title="Request" data={ex.request} />
          <JsonBlock title="Response" data={ex.response} />
        </div>
      )}
    </div>
  );
}

function JsonBlock({ title, data }: { title: string; data: unknown }) {
  return (
    <div className="grid gap-1">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <pre className="overflow-x-auto rounded-md bg-primary/[0.06] p-2 font-mono text-[11px] leading-relaxed text-foreground">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
