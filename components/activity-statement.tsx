"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  History,
  Newspaper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Transaction {
  transaction_id: number;
  date: string;
  amount: string;
  type: "CREDIT" | "DEBIT";
  description: string;
  counterparty_name: string;
  counterparty_account: string;
  status: string;
}

interface ActivityStatementProps {
  transactions: Transaction[];
}

export function ActivityStatement({ transactions }: ActivityStatementProps) {
  return (
    // FIX 1: Responsive padding (p-4 on mobile, p-8 on desktop)
    // FIX 2: rounded-3xl is usually better for mobile than 40px
    <div className="p-4 md:p-8 bg-white rounded-3xl md:rounded-[40px] border border-slate-100 shadow-sm space-y-6 overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-6">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="size-10 md:size-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
            <Newspaper className="size-5 md:size-6" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base md:text-lg font-bold text-slate-900 leading-none truncate">
              Activity Statement
            </h3>
            <p className="text-[10px] md:text-xs text-slate-400 mt-1 truncate">
              Verified Transactions
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-widest shrink-0"
        >
          Export
        </Button>
      </div>

      {/* Transactions List with Scroll Area */}
      <div
        className={cn(
          "space-y-1 pr-1 transition-all duration-500",
          transactions.length > 4
            ? "max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200"
            : "",
        )}
      >
        {transactions.length > 0 ? (
          transactions.map((tx) => {
            const isCredit = tx.type === "CREDIT";
            return (
              <div
                key={tx.transaction_id}
                className="flex items-center justify-between p-3 md:p-4 rounded-2xl hover:bg-slate-50 transition-all group cursor-pointer gap-2"
              >
                <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                  {/* ICON BLOCK */}
                  <div
                    className={cn(
                      "size-9 md:size-11 rounded-xl md:rounded-2xl flex items-center justify-center transition-all shadow-sm shrink-0",
                      isCredit
                        ? "bg-green-50 text-green-600 group-hover:bg-green-100"
                        : "bg-[#121212] text-white group-hover:bg-black",
                    )}
                  >
                    {isCredit ? (
                      <ArrowDownLeft className="size-4 md:size-5" />
                    ) : (
                      <ArrowUpRight className="size-4 md:size-5" />
                    )}
                  </div>

                  {/* TEXT BLOCK: min-w-0 is critical for truncation */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-bold text-slate-900 truncate">
                      {tx.description ||
                        (isCredit ? "Settlement In" : "Transfer Out")}
                    </p>
                    <p className="text-[9px] md:text-[10px] text-slate-400 font-medium uppercase tracking-tight truncate">
                      {tx.counterparty_name}
                    </p>
                  </div>
                </div>

                {/* AMOUNT BLOCK: shrink-0 ensures numbers don't wrap */}
                <div className="text-right shrink-0">
                  <p
                    className={cn(
                      "text-xs md:text-sm font-black tracking-tight",
                      isCredit ? "text-green-600" : "text-slate-900",
                    )}
                  >
                    {isCredit ? "+" : "-"} ₨ {tx.amount}
                  </p>
                  <p className="text-[8px] md:text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-0.5">
                    {new Date(tx.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center opacity-40">
            <History className="size-8 mx-auto mb-3 text-slate-300" />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              No activity recorded
            </p>
          </div>
        )}
      </div>
    </div>
  );
}