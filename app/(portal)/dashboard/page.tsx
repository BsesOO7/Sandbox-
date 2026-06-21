"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Bell,
  Plus,
  ShieldCheck,
  Globe,
  RefreshCw,
  Coins,
  Copy,
  Eye,
  EyeOff,
  Wallet,
  Zap,
  ArrowUpCircle,
  Loader2,
  ArrowDownLeft,
  ArrowUpRight,
  History,
  MessageSquare,
  ArrowRightLeft,
  UserCheck,
  Search,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ActivityStatement } from "@/components/activity-statement";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { PortalService } from "@/lib/api/portal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PortalDashboard() {
  // --- Existing States ---
  const [profile, setProfile] = useState<any>(null);
  const [balanceNpr, setBalanceNpr] = useState("0.00");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showUnits, setShowUnits] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- Deposit States ---
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);

  // --- Transfer States ---
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [recipient, setRecipient] = useState<any>(null); // Found recipient

  const [transferForm, setTransferForm] = useState({
    recipientName: "",
    recipientAccount: "",
    amount: "",
    description: "Cooperative Transfer",
  });

  // --- Load Data Logic ---
  const loadData = useCallback(async (isManualRefresh = false) => {
    const id = localStorage.getItem("nifn_coop_id");
    if (!id) return;

    if (isManualRefresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const [profileRes, balanceRes, historyRes] = await Promise.all([
        PortalService.getProfile(id),
        PortalService.getBalance(id),
        PortalService.getTransactionHistory(id),
      ]);

      setProfile((profileRes as any).data || profileRes);
      setBalanceNpr((balanceRes as any).balance || "0.00");

      // FIX: Correctly access 'data.activity' from your response
      setTransactions((historyRes as any).data?.activity || []);

      if (isManualRefresh) toast.success("Ledger Synchronized");
    } catch (err) {
      toast.error("Sync Error");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Transfer Logic ---
  const handleRecipientLookup = async () => {
    if (!transferForm.recipientName || !transferForm.recipientAccount) {
      return toast.error("Enter recipient name and account number");
    }
    setIsVerifying(true);
    try {
      const res = await PortalService.lookupCooperative(
        transferForm.recipientName,
        transferForm.recipientAccount,
      );
      if (res.status === "success" && res.data) {
        setRecipient(res.data);
        toast.success("Recipient Verified");
      } else {
        throw new Error("Recipient not found");
      }
    } catch (err: any) {
      toast.error("Lookup failed", {
        description: "Double check the name and account number",
      });
      setRecipient(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleTransferExecute = async () => {
    const amountNum = parseFloat(transferForm.amount);
    if (!amountNum || amountNum <= 0)
      return toast.error("Enter a valid amount");
    if (amountNum > parseFloat(balanceNpr))
      return toast.error("Insufficient balance");

    setIsTransferring(true);
    try {
      await PortalService.transferFunds({
        sender_id: String(profile.id),
        receiver_id: String(recipient.id),
        amount: amountNum,
        description: transferForm.description,
      });

      toast.success("Settlement Complete", {
        description: `₨ ${amountNum} sent to ${recipient.name}`,
      });
      setIsTransferOpen(false);
      setTransferForm({
        recipientName: "",
        recipientAccount: "",
        amount: "",
        description: "Cooperative Transfer",
      });
      setRecipient(null);
      await loadData(true);
    } catch (err: any) {
      toast.error("Transfer failed", { description: err.message });
    } finally {
      setIsTransferring(false);
    }
  };

  // --- Deposit Logic ---
  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) return toast.error("Enter a valid amount");
    setIsDepositing(true);
    try {
      await PortalService.loadFunds({
        cooperative_id: String(profile.id),
        account_number: profile.account_number || profile.registration_number,
        amount: amount,
        description: "Direct Load",
      });
      toast.success(`₨ ${amount.toLocaleString()} loaded`);
      setDepositAmount("");
      setIsDepositOpen(false);
      await loadData(true);
    } catch (err: any) {
      toast.error("Funding failed");
    } finally {
      setIsDepositing(false);
    }
  };

  const balanceUnits = Math.round(parseFloat(balanceNpr) * 100);

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Address Copied");
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="size-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  if (loading)
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="size-10 animate-spin text-primary opacity-20" />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">
            Welcome, {profile?.cooperative_name || "Partner"}
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Node Identity: {profile?.cooperative_code}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* FUND TRANSFER BUTTON */}
          <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
            <DialogTrigger
              render={
                <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl gap-2 font-bold text-[10px] uppercase tracking-widest px-4 text-white transition-all active:scale-95">
                  <ArrowRightLeft className="size-3.5" />
                  Fund Transfer
                </Button>
              }
            />
            <DialogContent className="rounded-[32px] sm:max-w-[450px] border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <ArrowRightLeft className="size-6 text-primary" /> Interledger
                  Transfer
                </DialogTitle>
                <DialogDescription>
                  Move liquidity to another cooperative node instantly.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-4">
                {!recipient ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400">
                        Recipient Name
                      </label>
                      <Input
                        placeholder="Enter Cooperative Name"
                        className="h-12 bg-slate-50"
                        value={transferForm.recipientName}
                        onChange={(e) =>
                          setTransferForm((prev) => ({
                            ...prev,
                            recipientName: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400">
                        Recipient Account Number
                      </label>
                      <Input
                        placeholder="E.g. ACC123..."
                        className="h-12 bg-slate-50 font-mono"
                        value={transferForm.recipientAccount}
                        onChange={(e) =>
                          setTransferForm((prev) => ({
                            ...prev,
                            recipientAccount: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <Button
                      className="w-full h-12 rounded-xl font-bold"
                      onClick={handleRecipientLookup}
                      disabled={isVerifying}
                    >
                      {isVerifying ? (
                        <Loader2 className="animate-spin size-4" />
                      ) : (
                        "Verify Recipient Identity"
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in zoom-in-95">
                    <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-green-600 font-bold uppercase">
                          Recipient Verified
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          {recipient.name}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => setRecipient(null)}
                      >
                        Change
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400">
                        Amount (NPR)
                      </label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="h-12 text-lg font-bold bg-slate-50"
                        value={transferForm.amount}
                        onChange={(e) =>
                          setTransferForm((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400">
                        Description
                      </label>
                      <Input
                        placeholder="Remarks"
                        className="h-12 bg-slate-50"
                        value={transferForm.description}
                        onChange={(e) =>
                          setTransferForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <Button
                      className="w-full h-14 rounded-xl font-bold text-lg shadow-xl shadow-primary/20"
                      onClick={handleTransferExecute}
                      disabled={isTransferring}
                    >
                      {isTransferring ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Execute Settlement"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* LOAD FUNDS BUTTON */}
          <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
            <DialogTrigger
              render={
                <Button
                  variant="outline"
                  className="bg-white shadow-sm rounded-xl gap-2 font-bold text-[10px] uppercase tracking-widest px-4 border border-slate-200 hover:bg-slate-50"
                >
                  <ArrowUpCircle className="size-3.5" />
                  Load Funds
                </Button>
              }
            />
            <DialogContent className="rounded-[32px] sm:max-w-[425px] border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  Load Wallet
                </DialogTitle>
              </DialogHeader>
              <div className="py-6 space-y-4">
                <Input
                  type="number"
                  placeholder="0.00"
                  className="h-14 text-xl font-bold"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button
                  className="w-full h-14 rounded-2xl"
                  onClick={handleDeposit}
                  disabled={isDepositing || !depositAmount}
                >
                  {isDepositing ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Confirm Deposit"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            size="sm"
            className="bg-white shadow-sm rounded-xl gap-2 font-bold text-[10px] uppercase tracking-widest px-4 border border-slate-100"
            onClick={() => loadData(true)}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn("size-3.5", isRefreshing && "animate-spin")}
            />{" "}
            Sync Ledger
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* --- LEFT: CARD & BALANCE --- */}
        <div className="w-full lg:w-[480px] space-y-10">
          {/* BLACK WALLET CARD */}
          <div className="relative h-[320px] w-full group perspective-1000">
            <div className="absolute top-10 left-0 w-full h-[270px] bg-white border border-slate-100 rounded-[40px] shadow-sm rotate-[-3deg]" />
            <div className="absolute top-0 left-0 w-full h-[270px] bg-[#121212] rounded-[40px] p-10 text-white shadow-2xl z-10 overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[80px] rounded-full translate-x-16 -translate-y-16" />
              <div className="flex justify-between items-start relative z-20">
                <div className="flex items-center gap-2.5">
                  <div className="size-2.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[11px] font-black uppercase tracking-[0.25em] text-white">
                    NIFN Network Node
                  </span>
                </div>
                {/* <div className="flex">
                  <div className="size-7 rounded-full bg-[#eb001b] opacity-90" />
                  <div className="size-7 rounded-full bg-[#f79e1b] opacity-80 -ml-4" />
                </div> */}
              </div>
              <div className="relative z-20">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 mb-2">
                  Wallet Pointer URL
                </p>
                <div
                  className="group/url flex items-center justify-between bg-white/[0.04] p-4 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all"
                  onClick={() =>
                    handleCopy(profile?.rafiki?.wallet_address_url)
                  }
                >
                  <p className="text-[11px] font-mono tracking-tight text-white/90 break-all line-clamp-2 leading-relaxed flex-1 pr-4">
                    {profile?.rafiki?.wallet_address_url ||
                      "pointer_loading..."}
                  </p>
                  <Copy className="size-3.5 opacity-20 group-hover/url:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="flex justify-between items-end relative z-20">
                <div className="space-y-1">
                  <p className="text-[9px] uppercase text-white/30 font-bold tracking-widest">
                    Registered Account
                  </p>
                  <p className="text-lg font-mono tracking-[0.2em] text-white leading-none">
                    {profile?.registration_number?.replace(/(.{4})/g, "$1 ") ||
                      "XXXX XXXX XXXX"}
                  </p>
                  <p className="text-[11px] font-medium text-white/60 pt-1 uppercase truncate max-w-[200px]">
                    {profile?.cooperative_name || profile?.name}
                  </p>
                </div>
                <div className="px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md font-black italic text-[10px]">
                  NIFN
                </div>
              </div>
            </div>
          </div>

          {/* BALANCE CARD */}
          <div className="bg-white border border-slate-50 rounded-[40px] p-10 shadow-sm space-y-8">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.15em] flex items-center gap-2">
                    Shadow Balance
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 text-slate-300"
                      onClick={() => setShowBalance(!showBalance)}
                    >
                      {showBalance ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 text-primary"
                      onClick={() => setShowUnits(!showUnits)}
                    >
                      <Coins className="size-3.5" />
                    </Button>
                  </p>
                </div>
                <div className="text-5xl font-black text-slate-900 tracking-tighter">
                  {!showBalance
                    ? "XXXXXX"
                    : showUnits
                      ? `${balanceUnits.toLocaleString()} paisa`
                      : `₨ ${balanceNpr}`}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-10 rounded-2xl bg-slate-50 hover:bg-primary/10 text-slate-400",
                  isRefreshing && "animate-spin",
                )}
                onClick={() => loadData(true)}
              >
                <RefreshCw className="size-5" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-50">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                  Currency
                </p>
                <p className="text-base font-bold text-slate-900">NPR</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                  Node Status
                </p>
                <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <div className="size-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  Verified
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: ACTIVITY & INFO --- */}
        <div className="flex-1 space-y-8">
          {/* SECURITY CERTIFICATE */}
          <div className="p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                <ShieldCheck className="size-7" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 tracking-tight">
                  Security Certificate
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  Node ID: {profile?.cooperative_code}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Authority
                </p>
                <p className="text-xs font-bold text-slate-700 leading-tight truncate">
                  {profile?.registration_authority}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Member Since
                </p>
                <p className="text-xs font-bold text-slate-700">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString(
                        undefined,
                        { year: "numeric", month: "long", day: "numeric" },
                      )
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* SETTLEMENT ACTIVITY (The new logic for your JSON response) */}
          <ActivityStatement transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
