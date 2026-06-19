"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Banknote,
  Coins,
  Loader2,
  PiggyBank,
  Wallet,
  RefreshCw,
  Copy,
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useSandbox } from "@/lib/sandbox-store";
import { ASSET_SCALE, formatNpr, unitsToNpr } from "@/lib/types";

const QUICK_AMOUNTS = [1000, 5000, 25000];

export function CooperativeDashboard() {
  const { coops, selectedCoopId, setSelectedCoopId, deposit, refreshBalance } =
    useSandbox();
  const [showUnits, setShowUnits] = useState(false);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. We look for the coop in the ENTIRE list to get the name,
  // ignoring filters just for the display label.
  const selectedCoopObject = coops.find(
    (c) => String(c.id) === String(selectedCoopId),
  );

  // 2. We only show "Active" coops in the actual dropdown list
  const active = coops.filter((c) => {
    const s = c.status?.toLowerCase().trim();
    return s === "active" || s === "activated";
  });

  const handleRefresh = async () => {
    if (!selectedCoopObject) return;
    setIsRefreshing(true);
    try {
      await refreshBalance(String(selectedCoopObject.id));
      toast.info("Balance Refreshed");
    } catch (err) {
      toast.error("Refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  };

  async function handleDeposit() {
    if (!selectedCoopObject || busy) return;
    const npr = Number(amount);
    if (!npr || npr <= 0) return toast.error("Enter a valid amount");
    setBusy(true);
    try {
      await deposit(String(selectedCoopObject.id), npr);
      toast.success(`Credited ₨ ${formatNpr(npr)}`);
      setAmount("");
    } catch (err: any) {
      toast.error("Deposit failed", { description: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="shadow-md border-primary/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="grid gap-1">
          <div className="flex items-center gap-2">
            <PiggyBank className="size-5 text-primary" />
            <CardTitle>Cooperative Dashboard</CardTitle>
          </div>
          <CardDescription>
            Manage balances and fund active cooperatives.
          </CardDescription>
        </div>
        {selectedCoopObject && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={isRefreshing ? "animate-spin" : ""}
          >
            <RefreshCw className="size-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Managing Cooperative
          </Label>

          <Select
            value={selectedCoopId ? String(selectedCoopId) : ""}
            onValueChange={(v) => setSelectedCoopId(v)}
          >
            <SelectTrigger className="w-full h-auto min-h-10 bg-muted/30 text-left px-3 py-2">
              {/* 
                  FIX: Instead of relying on <SelectValue />, we manually 
                  render the name if an object is found. This prevents the ID "59" 
                  from showing up.
              */}
              {selectedCoopObject ? (
                <span className="block truncate font-medium">
                  {selectedCoopObject.name}
                </span>
              ) : (
                <SelectValue placeholder="Select an active cooperative" />
              )}
            </SelectTrigger>
            <SelectContent>
              {active.length === 0 ? (
                <div className="px-2 py-3 text-center text-sm text-muted-foreground italic">
                  No active cooperatives found
                </div>
              ) : (
                active.map((c) => (
                  <SelectItem key={String(c.id)} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {selectedCoopObject ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <BalanceCard
              balanceUnits={selectedCoopObject.balanceUnits}
              walletAddress={
                selectedCoopObject.walletAddress ?? "No Wallet Address"
              }
              showUnits={showUnits}
              onToggle={() => setShowUnits((s) => !s)}
              isRefreshing={isRefreshing}
            />

            <Separator />

            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <Banknote className="size-4 text-primary" />
                <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Funding Tool
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((a) => (
                  <Button
                    key={a}
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setAmount(String(a))}
                  >
                    ₨ {formatNpr(a)}
                  </Button>
                ))}
              </div>

              <div className="flex items-end gap-3 bg-accent/5 p-4 rounded-xl border border-accent/10">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="deposit" className="text-xs">
                    Deposit Amount (NPR)
                  </Label>
                  <Input
                    id="deposit"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleDeposit}
                  disabled={busy}
                  className="px-6"
                >
                  {busy ? <Loader2 className="animate-spin" /> : "Deposit"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed bg-muted/20 p-12 text-center text-sm text-muted-foreground">
            Select a cooperative to manage its shadow ledger.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BalanceCard({
  balanceUnits,
  walletAddress,
  showUnits,
  onToggle,
  isRefreshing,
}: any) {
  const copyAddress = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    toast.success("Wallet address copied");
  };

  return (
    <div
      className={`rounded-2xl bg-primary p-6 text-primary-foreground shadow-inner transition-opacity duration-300 ${isRefreshing ? "opacity-50" : "opacity-100"}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary-foreground/60">
          <Wallet className="size-4" />
          Cooperative Balance
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={onToggle}
          className="h-7 text-[10px] font-bold uppercase"
        >
          <Coins className="mr-1 size-3" />
          {showUnits ? "View NPR" : "View Units"}
        </Button>
      </div>

      <div className="flex items-baseline gap-2">
        {showUnits ? (
          <span className="font-mono text-3xl font-bold tabular-nums">
            {balanceUnits.toLocaleString("en-NP")} units
          </span>
        ) : (
          <span className="text-4xl font-bold tabular-nums tracking-tight">
            ₨ {formatNpr(unitsToNpr(balanceUnits))}{" "}
            <span className="text-xs uppercase opacity-60">NPR</span>
          </span>
        )}
      </div>

      <div className="mt-6 space-y-3">
        <Badge
          variant="outline"
          className="border-primary-foreground/20 text-primary-foreground text-[10px]"
        >
          Scale {ASSET_SCALE}
        </Badge>
        <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/10">
          <span className="text-[10px] font-mono opacity-60 break-all leading-relaxed flex-1">
            {walletAddress}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 hover:bg-white/10 text-white"
            onClick={copyAddress}
          >
            <Copy className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
