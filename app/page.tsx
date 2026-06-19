"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { SandboxProvider } from "@/lib/sandbox-store";
import { DashboardHeader } from "@/components/dashboard-header";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { CooperativeDashboard } from "@/components/cooperative-dashboard";
import { TransactionLab } from "@/components/transaction-lab";
import { DeveloperPanel } from "@/components/developer-panel";

export default function Page() {
  return (
    <SandboxProvider>
      <TooltipProvider delay={150}>
        <div className="min-h-screen bg-background text-foreground">
          <DashboardHeader />
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              {/* Modules */}
              <div className="grid gap-6">
                <OnboardingWizard />
                <div className="grid gap-6 xl:grid-cols-2">
                  <CooperativeDashboard />
                  <TransactionLab />
                </div>
              </div>

              {/* Developer terminal */}
              <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
                <DeveloperPanel />
              </aside>
            </div>
          </main>
        </div>
      </TooltipProvider>
    </SandboxProvider>
  );
}
