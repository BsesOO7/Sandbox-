"use client";

import { Network, Activity, ServerOff, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSandbox } from "@/lib/sandbox-store";
import { BASE_URL } from "@/lib/api/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function DashboardHeader() {
  const { coops, isConnected } = useSandbox();

  const activeCount = coops.filter(
    (c) => c.status?.toUpperCase() === "ACTIVE",
  ).length;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left Section: Branding & URL */}
        <div className="flex items-center gap-4">
          <div
            className={`flex size-10 items-center justify-center rounded-xl shadow-lg transition-colors ${
              isConnected
                ? "bg-primary shadow-primary/20"
                : "bg-destructive shadow-destructive/20"
            }`}
          >
            <Network className="size-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-tight sm:text-base">
              Cooperative Sandbox
            </h1>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isConnected ? "bg-green-400" : "bg-red-400"
                  }`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                ></span>
              </span>
              <p className="font-mono text-[10px] text-muted-foreground tracking-widest">
                {isConnected ? BASE_URL.replace("http://", "") : "OFFLINE"}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Status Badges */}
        <div className="flex items-center gap-3">
          <TooltipProvider>
            {isConnected ? (
              <div className="hidden items-center gap-3 md:flex">
                <Badge
                  variant="secondary"
                  className="h-8 gap-2 px-3 border-primary/10"
                >
                  <Activity className="size-3.5 text-primary" />
                  <span className="font-bold">
                    {activeCount} / {coops.length} Active
                  </span>
                </Badge>
              </div>
            ) : (
              <Badge
                variant="destructive"
                className="h-8 gap-2 px-3 animate-pulse"
              >
                <ServerOff className="size-3.5" />
                <span className="font-bold uppercase text-[10px]">
                  Disconnected
                </span>
              </Badge>
            )}
          </TooltipProvider>

          {/* Mobile Status */}
          {!isConnected && (
            <div className="md:hidden size-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </div>
      </div>
    </header>
  );
}
