"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Building2,
  ChevronRight,
  Loader2,
  ShieldCheck,
  Zap,
  Globe,
  Cpu,
  RefreshCcw,
  BarChart3,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import router from "next/dist/shared/lib/router/router";
import { AuthService } from "@/lib/services/auth";

export default function LoginPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    try {
      const res = await AuthService.login({ email, password });

      if (res.status === "success") {
        toast.success("Identity Authenticated");

        router.push("/dashboard");
      }
    } catch (err: any) {
      toast.error("Authentication Failed", { description: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-[#020202] text-white overflow-hidden font-sans">
      {/* --- LEFT SECTION: LOGIN (45%) --- */}
      <section className="relative z-10 flex w-full flex-col justify-between p-8 md:w-[45%] lg:p-16 bg-[#020202]">
        {/* Top Logo */}
        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white text-black shadow-xl">
            <Wallet className="size-6" />
          </div>
          <span className="text-xl font-bold tracking-tighter italic">
            NIFN
          </span>
        </div>

        {/* Login Form Area */}
        <div className="mx-auto w-full max-w-[380px] animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="mb-10">
            <h1 className="text-4xl font-bold tracking-tight mb-3">
              Access Your Cooperative Wallet
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Please enter your cooperative credentials to unlock your
              Interledger wallet.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="group relative rounded-2xl bg-white/[0.03] border border-white/10 p-1.5 focus-within:border-primary/50 transition-all duration-300">
              <span className="absolute left-4 top-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white-900 group-focus-within:text-primary">
                Email
              </span>
              <Input
                type="email"
                placeholder="admin@cooperative.np"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 pt-6 bg-transparent border-none text-white placeholder:text-slate-700 focus-visible:ring-0"
                required
              />
            </div>

            <div className="group relative rounded-2xl bg-white/[0.03] border border-white/10 p-1.5 focus-within:border-primary/50 transition-all duration-300">
              <span className="absolute left-4 top-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white-500 group-focus-within:text-primary">
                Password
              </span>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 pt-6 bg-transparent border-none text-white placeholder:text-slate-700 focus-visible:ring-0"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="w-full h-16 rounded-2xl bg-white text-black font-bold"
            >
              {busy ? <Loader2 className="animate-spin" /> : "Unlock Wallet"}
            </Button>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-[11px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest pt-4"
            >
              <Zap className="size-3" />
              Switch to Sandbox Environment
            </Link>
          </form>
        </div>

        {/* Footer info */}
        <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-3 text-primary" /> Encrypted
          </div>
          <span>v1.4.0</span>
          <span>© 2025 NIFN</span>
        </div>
      </section>

      {/* --- RIGHT SECTION: INFORMATION (55%) --- */}
      <section className="relative hidden w-[55%] md:flex flex-col items-center justify-center overflow-hidden border-l border-white/5 bg-[#050505]">
        {/* Background Visuals */}
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/5 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

        {/* Holographic Wallet Card */}
        <div className="relative group perspective-1000">
          <div className="relative w-[480px] h-[280px] bg-gradient-to-br from-white/10 to-white/[0.02] backdrop-blur-2xl border border-white/20 rounded-[40px] p-10 shadow-2xl transition-transform duration-700 group-hover:rotate-x-12 group-hover:rotate-y-[-12deg] group-hover:scale-105">
            <div className="flex justify-between items-start mb-12">
              <div className="size-12 rounded-full bg-gradient-to-tr from-primary to-blue-400 p-0.5">
                <div className="size-full bg-black rounded-full flex items-center justify-center text-[8px] font-black italic">
                  NIFN
                </div>
              </div>
              <Cpu className="size-10 text-white/20" />
            </div>

            <div className="space-y-4">
              <div className="h-2 w-48 bg-white/20 rounded-full animate-pulse" />
              <div className="h-2 w-32 bg-white/10 rounded-full" />
              <div className="pt-8 flex justify-between items-end">
                <span className="font-mono text-xl tracking-[0.3em] opacity-40">
                  **** **** **** 8821
                </span>
                <Globe className="size-6 opacity-20" />
              </div>
            </div>

            {/* Glossy Reflection Overlay */}
            <div className="absolute inset-0 rounded-[40px] bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        </div>

        {/* Information Grid */}
        <div className="mt-16 grid grid-cols-2 gap-8 w-full max-w-[480px] animate-in fade-in duration-1000 delay-500">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <RefreshCcw className="size-4" />
              <span className="text-[11px] font-black uppercase tracking-widest">
                Instant Settlement
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Transactions are cleared over the Interledger Protocol in
              sub-seconds.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-400">
              <BarChart3 className="size-4" />
              <span className="text-[11px] font-black uppercase tracking-widest">
                Shadow Ledgers
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Maintain precise liquidity records.
            </p>
          </div>
        </div>

        {/* Floating Tag */}
        <div className="absolute top-12 right-12 px-4 py-2 rounded-full bg-white/5 border border-white/10 flex items-center gap-3">
          <div className="size-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Network Operational
          </span>
        </div>
      </section>
    </div>
  );
}
