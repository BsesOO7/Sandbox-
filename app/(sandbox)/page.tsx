// app/(sandbox)/page.tsx
"use client";

import { OnboardingWizard } from "@/components/onboarding-wizard";
import { CooperativeDashboard } from "@/components/cooperative-dashboard";
import { TransactionLab } from "@/components/transaction-lab";

export default function SandboxPage() {
  return (
    <div className="grid gap-6">
      {/* Step 1: Identity & Activation */}
      <OnboardingWizard />

      {/* Step 2: Management & Transactions */}
      <div className="grid gap-6 xl:grid-cols-2">
        <CooperativeDashboard />
        <TransactionLab />
      </div>
    </div>
  );
}
