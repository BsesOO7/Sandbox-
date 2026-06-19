// app/(sandbox)/layout.tsx
import { SandboxProvider } from "@/lib/sandbox-store";
import { DeveloperPanel } from "@/components/developer-panel";
import { DashboardHeader } from "@/components/dashboard-header";

export default function SandboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SandboxProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <DashboardHeader />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8">
            {children}
          </main>
          {/* Logs and API Exchanges only appear in the sandbox */}
          <DeveloperPanel />
        </div>
      </div>
    </SandboxProvider>
  );
}
