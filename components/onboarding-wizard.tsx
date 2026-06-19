"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Building2,
  Loader2,
  ArrowRight,
  BadgeCheck,
  Wallet,
  CheckCircle2,
  Copy,
  ShieldCheck,
  AlertCircle, // Added for error icons
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useSandbox } from "@/lib/sandbox-store";
import { ValidationRules } from "@/lib/validations"; // Import your rules
import type { Cooperative } from "@/lib/types";
import { cn } from "@/lib/utils"; // shadcn utility for conditional classes

const AUTHORITIES = [
  "ProvincialCooperativePromotionBoard",
  "Department of Cooperatives",
  "Nepal Rastra Bank",
];
const COOP_TYPES = [
  "SAVING",
  "CURRENT",
  "SAVING_AND_CREDIT",
  "MULTIPURPOSE",
  "AGRICULTURE",
  "HOUSING",
  "TRADE",
  "FISHERIES",
  "TRANSPORT",
  "EDUCATION",
  "OTHER",
];

export function OnboardingWizard() {
  const { enroll, createWallet, lookup } = useSandbox();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [busy, setBusy] = useState(false);
  const [coop, setCoop] = useState<Cooperative | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Validation State
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const [form, setForm] = useState({
    name: "",
    pan: "",
    regNo: "",
    authority: AUTHORITIES[0],
    regDate: "",
    type: COOP_TYPES[0],
    code: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    setMounted(true);
    setForm((f) => ({ ...f, regDate: new Date().toISOString().split("T")[0] }));
  }, []);

  // Validation Logic
  const validate = () => {
    const newErrors = {
      name: ValidationRules.required("Name", form.name),
      pan: ValidationRules.panNumber(form.pan),
      regNo: ValidationRules.accountNumber(form.regNo),
      code: ValidationRules.required("Cooperative Code", form.code),
      email: ValidationRules.email(form.email),
      regDate: ValidationRules.required("Registration Date", form.regDate),
      password: ValidationRules.password(form.password),
    };

    setErrors(newErrors);

    // Return true if all values are null (no errors)
    return Object.values(newErrors).every((error) => error === null);
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();

    // Run Validation
    if (!validate()) {
      toast.error("Please correct the errors in the form");
      return;
    }

    setBusy(true);
    try {
      await enroll(form);
      toast.info("Verifying backend record...");
      const verifiedCoop = await lookup(form.name, form.regNo);
      setCoop(verifiedCoop);
      setStep(2);
      toast.success("Cooperative Identity Enrolled & Verified");
    } catch (err: any) {
      toast.error("Enrollment Failed", { description: err.message });
    } finally {
      setBusy(false);
    }
  };

  const handleActivate = async () => {
    if (!coop?.id) return;
    setBusy(true);
    try {
      const activatedCoop = await createWallet(
        String(coop.id),
        coop.regNo,
        coop.email,
        coop.name,
      );

      setCoop(activatedCoop);
      setStep(3);
      toast.success("Wallet Activated");
    } catch (err: any) {
      toast.error("Activation failed", { description: err.message });
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setStep(1);
    setCoop(null);
    setBusy(false);
    setErrors({});
    setForm({
      name: "",
      pan: "",
      regNo: "",
      authority: AUTHORITIES[0],
      regDate: new Date().toISOString().split("T")[0],
      type: COOP_TYPES[0],
      code: "",
      email: "",
      password: "",
    });
  };

  function updateField(key: keyof typeof form, value: string | null): void {
    if (value !== null) {
      setForm((f) => ({ ...f, [key]: value }));
      // Clear error for this field when user starts typing
      if (errors[key]) {
        setErrors((prev) => ({ ...prev, [key]: null }));
      }
    }
  }

  if (!mounted) return <LoadingCard />;

  return (
    <Card className="shadow-lg border-primary/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="size-5 text-primary" />
          <CardTitle>Onboarding Wizard</CardTitle>
        </div>
        <CardDescription>
          Register identity and provision Rafiki wallet.
        </CardDescription>
        <StepBar currentStep={step} />
      </CardHeader>
      <CardContent className="pt-6">
        {step === 1 && (
          <form onSubmit={handleEnroll} className="grid gap-5">
            {/* Name Field */}
            <div className="grid gap-2">
              <Label htmlFor="coop-name">Cooperative Name</Label>
              <Input
                id="coop-name"
                className={cn(
                  errors.name && "border-destructive ring-destructive",
                )}
                placeholder="Janahit Saving & Credit Co-op"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
              {errors.name && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" /> {errors.name}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* PAN Field */}
              <div className="grid gap-2">
                <Label>PAN Number</Label>
                <Input
                  className={cn(
                    errors.pan && "border-destructive ring-destructive",
                  )}
                  placeholder="538172964"
                  value={form.pan}
                  onChange={(e) => updateField("pan", e.target.value)}
                />
                {errors.pan && (
                  <p className="text-xs text-destructive">{errors.pan}</p>
                )}
              </div>
              {/* Code Field */}
              <div className="grid gap-2">
                <Label>Cooperative Code</Label>
                <Input
                  className={cn(
                    errors.code && "border-destructive ring-destructive",
                  )}
                  placeholder="GHCC683"
                  value={form.code}
                  onChange={(e) => updateField("code", e.target.value)}
                />
                {errors.code && (
                  <p className="text-xs text-destructive">{errors.code}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Registration Number Field */}
              <div className="grid gap-2">
                <Label>Account Number</Label>
                <Input
                  className={cn(
                    "uppercase font-mono",
                    errors.regNo && "border-destructive ring-destructive",
                  )}
                  placeholder="ACC123456"
                  value={form.regNo}
                  onChange={(e) => updateField("regNo", e.target.value)}
                />
                {errors.regNo ? (
                  <p className="text-xs text-destructive">{errors.regNo}</p>
                ) : (
                  <p className="text-[10px] text-muted-foreground italic">
                    Alphanumeric CAPS only
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label>Registration Date</Label>
                <Input
                  type="date"
                  value={form.regDate}
                  onChange={(e) => updateField("regDate", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Authority</Label>
                <Select
                  value={form.authority}
                  onValueChange={(value) => updateField("authority", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AUTHORITIES.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) => updateField("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COOP_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Email Field */}
            <div className="grid gap-2">
              <Label>Contact Email</Label>
              <Input
                type="email"
                className={cn(
                  errors.email && "border-destructive ring-destructive",
                )}
                placeholder="admin@coop.org"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Account Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={cn(
                    "pr-10",
                    errors.password && "border-destructive",
                  )}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
              {errors.password ? (
                <p className="text-[11px] text-destructive">
                  {errors.password}
                </p>
              ) : (
                <p className="text-[10px] text-muted-foreground italic">
                  Min. 8 characters
                </p>
              )}
            </div>

            <Button type="submit" disabled={busy} className="w-full">
              {busy ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Register Identity <ArrowRight className="ml-2 size-4" />
                </>
              )}
            </Button>
          </form>
        )}

        {/* ... steps 2 and 3 remain the same ... */}
        {step === 2 && coop && (
          <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="size-5" />
                <p className="font-bold text-sm uppercase tracking-tight">
                  Backend Record Verified
                </p>
              </div>

              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div className="text-muted-foreground">Internal ID</div>
                <div className="font-mono font-bold text-right">{coop.id}</div>

                <div className="text-muted-foreground">Official Name</div>
                <div className="font-bold text-right">{coop.name || "N/A"}</div>

                <div className="text-muted-foreground">Account Number</div>
                <div className="font-mono font-bold text-right">
                  {coop.regNo || "N/A"}
                </div>

                <div className="text-muted-foreground">Contact Email</div>
                <div className="font-bold text-right">
                  {coop.email || "N/A"}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground text-center px-4">
                This identity is now eligible for a Rafiki Interledger wallet.
              </p>
              <Button
                onClick={handleActivate}
                disabled={busy}
                className="w-full py-7 text-lg shadow-xl"
              >
                {busy ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <Wallet className="mr-2" /> Activate Wallet
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && coop && (
          <div className="grid gap-6 animate-in zoom-in-95 duration-500">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 flex flex-col items-center text-center gap-3">
              <div className="bg-green-500 rounded-full p-2 text-white shadow-lg shadow-green-500/20">
                <CheckCircle2 className="size-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-green-700">
                  Wallet Activated
                </h3>
                <p className="text-sm text-green-600/80">
                  The cooperative is now live on the Interledger network.
                </p>
              </div>
            </div>

            <div className="grid gap-4 bg-muted/30 p-4 rounded-lg border">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                  Payment Pointer (Wallet Address)
                </Label>
                <div className="flex items-center gap-2 bg-background p-2.5 rounded-md border shadow-sm">
                  <code className="flex-1 truncate font-mono text-xs text-primary">
                    {coop.walletAddress}
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    onClick={() => {
                      navigator.clipboard.writeText(coop.walletAddress!);
                      toast.success("Copied to clipboard");
                    }}
                  >
                    <Copy className="size-3.5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-muted-foreground font-bold">
                    Status
                  </Label>
                  <div className="text-sm font-bold text-green-600 flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                    Active
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-muted-foreground font-bold">
                    Cooperative ID
                  </Label>
                  <div className="text-sm font-mono font-bold">{coop.id}</div>
                </div>
              </div>
            </div>

            <Separator />

            <Button variant="outline" onClick={reset} className="w-full">
              Enroll Another Cooperative
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StepBar({ currentStep }: { currentStep: number }) {
  const steps = ["Identity", "Activation", "Completed"];
  return (
    <div className="flex items-center gap-2 mt-4">
      {steps.map((label, i) => {
        const n = i + 1;
        const active = currentStep >= n;
        return (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={`size-6 rounded-full flex items-center justify-center text-[10px] font-bold ${active ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
            >
              {currentStep > n ? <CheckCircle2 className="size-4" /> : n}
            </div>
            <span
              className={`text-[11px] font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}
            >
              {label}
            </span>
            {i < 2 && <div className="h-px flex-1 bg-border" />}
          </div>
        );
      })}
    </div>
  );
}

function LoadingCard() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="h-32 bg-muted/20" />
      <CardContent className="h-64" />
    </Card>
  );
}
