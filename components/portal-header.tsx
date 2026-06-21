"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, UserCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function PortalHeader() {
  const pathname = usePathname();
  const [coopId, setCoopId] = useState<string | null>(null);

  useEffect(() => {
    setCoopId(localStorage.getItem("nifn_coop_id"));
  }, []);

  const getTitle = () => {
    const segment = pathname.split("/").pop();
    if (!segment || segment === "dashboard") return "Cooperative Wallet";
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-8">
      <div className="animate-in fade-in slide-in-from-left-4 duration-500">
        <h2 className="text-lg font-bold tracking-tight text-slate-900 leading-none">
          {getTitle()}
        </h2>
        <p className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wider">
          Cooperative
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden w-64 lg:block">
          <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
          <Input
            placeholder="Search records..."
            className="h-9 w-full bg-slate-50 border-none pl-9 text-xs focus-visible:ring-1 focus-visible:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-4 border-l border-slate-100 pl-6">
          <button className="relative text-slate-400 hover:text-primary transition-colors">
            <Bell className="size-5" />
            <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-red-500 border-2 border-white" />
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none">
                Logged in
              </p>
              {/* <p className="text-xs font-black text-slate-900 mt-0.5 italic">
                Node #{coopId || "----"}
              </p> */}
            </div>
            <div className="size-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
              <UserCircle className="size-6" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
