// app/(sandbox)/layout.tsx
"use client";

import { useSandbox } from "@/lib/sandbox-store";
import { DeveloperPanel } from "@/components/developer-panel";
import { DashboardHeader } from "@/components/dashboard-header";

export default function SandboxLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <DashboardHeader />
      <div className="flex flex-1 overflow-hidden">
        {/* Content expands to fill remaining space */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
        
        {/* Panel handles its own width (slim or wide) */}
        <DeveloperPanel />
      </div>
    </div>
  );
}