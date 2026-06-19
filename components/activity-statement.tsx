"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  History,
  Newspaper,
  Zap,
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
    <div className="p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-6">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
            <Newspaper className="size-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-none">
              Activity Statement
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Verified Interledger Transactions
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="text-xs font-bold text-primary uppercase tracking-widest"
        >
          Export
        </Button>
      </div>

      {/* Transactions List with Scroll Area */}
      <div
        className={cn(
          "space-y-1 pr-2 transition-all duration-500",
          // Scrollable after 4 items
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
                className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {/* ICON BLOCK: Green for Credit, Dark for Debit */}
                  <div
                    className={cn(
                      "size-11 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                      isCredit
                        ? "bg-green-50 text-green-600 group-hover:bg-green-100"
                        : "bg-[#121212] text-white group-hover:bg-black",
                    )}
                  >
                    {isCredit ? (
                      <ArrowDownLeft className="size-5" />
                    ) : (
                      <ArrowUpRight className="size-5" />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900 line-clamp-1">
                      {tx.description ||
                        (isCredit ? "Settlement In" : "Transfer Out")}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight truncate max-w-[200px]">
                      {tx.counterparty_name} • {tx.counterparty_account}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={cn(
                      "text-sm font-black tracking-tight",
                      isCredit ? "text-green-600" : "text-slate-900",
                    )}
                  >
                    {isCredit ? "+" : "-"} ₨ {tx.amount}
                  </p>
                  <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-0.5">
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
            <History className="size-8 mx-auto mb-3" />
            <p className="text-sm font-bold uppercase tracking-widest text-slate-400">
              No activity recorded
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
