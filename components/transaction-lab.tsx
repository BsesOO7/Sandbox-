"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowRightLeft,
  Check,
  CircleDot,
  Loader2,
  XCircle,
  History,
  MessageSquare,
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
import { formatNpr, unitsToNpr } from "@/lib/types";

const QUICK_AMOUNTS = [500, 2000, 10000];

const ILP_STEPS = [
  {
    label: "Incoming Payment",
    actor: "Receiver",
    hint: "Preparing receiver wallet",
  },
  {
    label: "Generating Quote",
    actor: "Sender",
    hint: "Calculating units & fees",
  },
  {
    label: "Outgoing Payment",
    actor: "Sender",
    hint: "Authorizing value movement",
  },
  {
    label: "Shadow Settlement",
    actor: "Operator",
    hint: "Finalizing ledger updates",
  },
];

export function TransactionLab() {
  const { coops, transfer } = useSandbox();

  const [senderId, setSenderId] = useState<string>("");
  const [receiverId, setReceiverId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("Cooperative Transfer");
  const [currentStep, setCurrentStep] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [txnResult, setTxnResult] = useState<{
    ok: boolean;
    paymentId?: string;
    error?: string;
  } | null>(null);

  // Filter for active coops
  const activeCoops = coops.filter((c) => {
    const s = c.status?.toLowerCase().trim();
    return s === "active" || s === "activated" || s === "provisioned";
  });

  // MANUAL LOOKUP: Find the full objects for display in the Triggers
  const selectedSender = coops.find((c) => String(c.id) === String(senderId));
  const selectedReceiver = coops.find(
    (c) => String(c.id) === String(receiverId),
  );

  // Options for receiver (exclude sender)
  const receiverOptions = activeCoops.filter(
    (c) => String(c.id) !== String(senderId),
  );

  const handleTransfer = async () => {
    if (isProcessing) return;
    if (!senderId || !receiverId) return toast.error("Select both parties");

    const nprAmount = Number(amount);
    if (!nprAmount || nprAmount <= 0) return toast.error("Invalid amount");

    setTxnResult(null);
    setIsProcessing(true);
    setCurrentStep(0);

    try {
      const res = await transfer(
        senderId,
        receiverId,
        nprAmount,
        description,
        (step: number) => setCurrentStep(step),
      );

      if (res.ok) {
        setTxnResult({ ok: true, paymentId: res.rafikiPaymentId });
        toast.success("Transfer Completed");
        setAmount("");
      } else {
        setTxnResult({ ok: false, error: res.error });
        toast.error("Transfer Failed", { description: res.error });
      }
    } catch (err) {
      setTxnResult({ ok: false, error: "Network error occurred" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-primary/10 shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="size-5 text-primary" />
          <CardTitle>Transaction Lab</CardTitle>
        </div>
        <CardDescription>
          Visualize Interledger transfers between cooperatives.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* SENDER SELECT */}
          <div className="grid gap-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Sender
            </Label>
            <Select
              value={senderId || ""}
              onValueChange={(v) => {
                setSenderId(v || "");
                if (v === receiverId) setReceiverId("");
              }}
            >
              <SelectTrigger className="w-full h-auto min-h-10 py-2 bg-muted/30 text-left">
                {/* FIX: Manually render sender name */}
                {selectedSender ? (
                  <div className="whitespace-normal break-words line-clamp-2 font-medium">
                    {selectedSender.name}
                  </div>
                ) : (
                  <SelectValue placeholder="Select Sender" />
                )}
              </SelectTrigger>
              <SelectContent className="max-w-[350px]">
                {activeCoops.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)} className="py-2">
                    <div className="flex flex-col">
                      <span className="font-medium whitespace-normal break-words">
                        {c.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        ID: {c.id}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* RECEIVER SELECT */}
          <div className="grid gap-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Receiver
            </Label>
            <Select
              value={receiverId || ""}
              onValueChange={(v) => setReceiverId(v ?? "")}
            >
              <SelectTrigger className="w-full h-auto min-h-10 py-2 bg-muted/30 text-left">
                {/* FIX: Manually render receiver name */}
                {selectedReceiver ? (
                  <div className="whitespace-normal break-words line-clamp-2 font-medium">
                    {selectedReceiver.name}
                  </div>
                ) : (
                  <SelectValue placeholder="Select Receiver" />
                )}
              </SelectTrigger>
              <SelectContent className="max-w-[350px]">
                {receiverOptions.length > 0 ? (
                  receiverOptions.map((c) => (
                    <SelectItem
                      key={c.id}
                      value={String(c.id)}
                      className="py-2"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium whitespace-normal break-words">
                          {c.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          ID: {c.id}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-xs text-muted-foreground italic text-center">
                    No other active co-ops
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* AMOUNT & REMARKS */}
        <div className="space-y-4 bg-accent/5 p-4 rounded-xl border border-accent/10">
          <div className="grid gap-2">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground">
              Transfer Amount (NPR)
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {QUICK_AMOUNTS.map((a) => (
                <Button
                  key={a}
                  size="xs"
                  variant="outline"
                  className="rounded-full h-7 px-3 text-[10px]"
                  onClick={() => setAmount(String(a))}
                >
                  ₨ {formatNpr(a)}
                </Button>
              ))}
            </div>
            <Input
              type="number"
              placeholder="0.00"
              className="text-lg font-bold"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-3 text-muted-foreground" />
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">
                Remarks / Description
              </Label>
            </div>
            <Input
              placeholder="Transfer description"
              className="text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Button
            onClick={handleTransfer}
            disabled={isProcessing || !amount || !senderId || !receiverId}
            className="w-full h-11"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin mr-2" />
            ) : (
              <ArrowRightLeft className="mr-2" />
            )}
            {isProcessing ? "Processing..." : "Execute Transfer"}
          </Button>
        </div>

        {/* TIMELINE VISUALIZATION */}
        {(isProcessing || currentStep >= 0 || txnResult) && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            <Separator />
            <div className="flex items-center gap-2">
              <History className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Timeline
              </h3>
            </div>
            <div className="grid gap-1 ml-2">
              {ILP_STEPS.map((s, i) => {
                const isDone =
                  currentStep > i || (txnResult?.ok && currentStep >= 3);
                const isActive = currentStep === i && isProcessing;
                return (
                  <div key={s.label} className="flex gap-4 relative">
                    <div className="flex flex-col items-center">
                      <div
                        className={`z-10 flex size-6 items-center justify-center rounded-full transition-colors ${isDone ? "bg-green-500 text-white" : isActive ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
                      >
                        {isDone ? (
                          <Check className="size-3.5" />
                        ) : isActive ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <CircleDot className="size-3.5" />
                        )}
                      </div>
                      {i < ILP_STEPS.length - 1 && (
                        <div
                          className={`w-[2px] h-8 ${isDone ? "bg-green-500" : "bg-muted"}`}
                        />
                      )}
                    </div>
                    <div className="pt-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${isDone || isActive ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {s.label}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted font-bold text-muted-foreground uppercase">
                          {s.actor}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {s.hint}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUCCESS MESSAGE */}
        {txnResult?.ok && (
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 flex gap-4 animate-in zoom-in-95">
            <div className="grid gap-1">
              <p className="text-sm font-bold text-green-700">
                Payment Settled
              </p>
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                  Transaction ID
                </span>
                <code className="text-xs font-mono break-all">
                  {txnResult.paymentId}
                </code>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
