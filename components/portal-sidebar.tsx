"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowRightLeft, Globe, Settings, LogOut, Wallet, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthService } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  // { name: "Payments", href: "/payments", icon: ArrowRightLeft },
  // { name: "Network", href: "/network", icon: Globe },
  // { name: "Security", href: "/settings", icon: Settings },
];

export function PortalSidebar({ isOpen, setIsOpen, mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      onClick={() => !isOpen && setIsOpen(true)}
      className={cn(
        // Basic Styles
        "relative flex flex-col bg-[#0A0C10] text-white transition-all duration-300 ease-in-out border-r border-white/5 z-50",
        // Desktop Rail Logic
        isOpen ? "w-64" : "w-20",
        // Mobile Drawer Logic
        "fixed inset-y-0 left-0 md:relative transform",
        mobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0",
        "cursor-pointer"
      )}
    >
      {/* --- TOP SECTION --- */}
      <div className="flex h-20 items-center justify-between px-6">
        <div 
          className="flex items-center gap-3 overflow-hidden"
          onClick={(e) => {
            if (isOpen && !mobileOpen) {
              e.stopPropagation();
              setIsOpen(false);
            }
          }}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <Wallet className="size-5 text-white" />
          </div>
          {(isOpen || mobileOpen) && (
            <div className="flex flex-col animate-in fade-in slide-in-from-left-4">
              <span className="text-xl font-black italic tracking-tighter leading-none">NIFN</span>
              <span className="text-[8px] uppercase tracking-[0.3em] text-primary font-bold">Portal</span>
            </div>
          )}
        </div>

        {/* Mobile Close Button */}
        {mobileOpen && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-slate-500 hover:text-white"
          >
            <X className="size-5" />
          </Button>
        )}
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="flex-1 space-y-2 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              onClick={(e) => {
                e.stopPropagation();
                if (mobileOpen) setMobileOpen(false);
              }}
            >
              <div
                className={cn(
                  "flex items-center gap-4 rounded-xl px-3.5 py-3 text-sm font-medium transition-all group",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={cn("size-5 shrink-0", isActive ? "text-white" : "group-hover:scale-110 transition-transform")} />
                {(isOpen || mobileOpen) && <span className="truncate animate-in fade-in duration-500">{item.name}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* --- BOTTOM SECTION --- */}
      <div className="border-t border-white/5 p-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            AuthService.logout();
          }}
          className="flex w-full items-center gap-4 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all group"
        >
          <LogOut className="size-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
          {(isOpen || mobileOpen) && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}