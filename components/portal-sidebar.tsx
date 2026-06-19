"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowRightLeft,
  Globe,
  Settings,
  LogOut,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthService } from "@/lib/api/auth";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Payments", href: "/payments", icon: ArrowRightLeft },
  { name: "Network", href: "/network", icon: Globe },
  { name: "Security", href: "/settings", icon: Settings },
];

export function PortalSidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      onClick={() => !isOpen && setIsOpen(true)} // Expand if clicked while closed
      className={cn(
        "relative flex flex-col bg-[#0A0C10] text-white transition-all duration-300 ease-in-out border-r border-white/5 cursor-pointer",
        isOpen ? "w-64" : "w-20",
      )}
    >
      {/* --- TOP SECTION: CLICK TO COLLAPSE --- */}
      <div
        className="flex h-20 items-center px-6 hover:bg-white/5 transition-colors"
        onClick={(e) => {
          if (isOpen) {
            e.stopPropagation(); // Prevent parent expand trigger
            setIsOpen(false); // Collapse if clicked while open
          }
        }}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <Wallet className="size-5 text-white" />
          </div>
          {isOpen && (
            <div className="flex flex-col animate-in fade-in slide-in-from-left-4">
              <span className="text-xl font-black italic tracking-tighter leading-none">
                NIFN
              </span>
              <span className="text-[8px] uppercase tracking-[0.3em] text-primary font-bold">
                Portal
              </span>
            </div>
          )}
        </div>
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="flex-1 space-y-2 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={(e) => e.stopPropagation()} // DON'T toggle sidebar when clicking a link
            >
              <div
                className={cn(
                  "flex items-center gap-4 rounded-xl px-3.5 py-3 text-sm font-medium transition-all group",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5",
                )}
              >
                <item.icon
                  className={cn(
                    "size-5 shrink-0",
                    isActive
                      ? "text-white"
                      : "group-hover:scale-110 transition-transform",
                  )}
                />
                {isOpen && (
                  <span className="truncate animate-in fade-in duration-500">
                    {item.name}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* --- BOTTOM SECTION: LOGOUT --- */}
      <div className="border-t border-white/5 p-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            AuthService.logout();
          }}
          className="flex w-full items-center gap-4 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all group"
        >
          <LogOut className="size-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>

      {/* Visual Indicator Hint (Optional) */}
      {!isOpen && (
        <div className="absolute inset-x-0 bottom-12 flex justify-center opacity-20 group-hover:opacity-100 transition-opacity">
          <div className="w-1 h-8 bg-slate-500 rounded-full" />
        </div>
      )}
    </div>
  );
}
