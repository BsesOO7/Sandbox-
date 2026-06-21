"use client";

import { useState, useEffect } from "react";
import { PortalSidebar } from "@/components/portal-sidebar";
import { PortalHeader } from "@/components/portal-header";
import { Wallet, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Desktop rail state
  const [mobileOpen, setMobileOpen] = useState(false); // Mobile drawer state

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, []);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      
      {/* 1. MOBILE OVERLAY (Backdrop) */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 2. SIDEBAR (Enhanced with mobile classes) */}
      <PortalSidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen}
      />
      
      <div className="flex flex-1 flex-col min-w-0">
        
        {/* 3. MOBILE HEADER (Only visible on small screens) */}
        <div className="flex h-16 items-center justify-between border-b bg-[#0A0C10] px-4 md:hidden text-white">
          <div className="flex items-center gap-3">
             <Button 
               variant="ghost" 
               size="icon" 
               onClick={() => setMobileOpen(true)}
               className="text-white hover:bg-white/10"
             >
               <Wallet className="size-6 text-white-200" />
             </Button>
             <span className="text-lg font-black italic tracking-tighter">NIFN</span>
          </div>
          {/* User ID display on mobile header if needed */}
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block">
          <PortalHeader />
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Mobile view padding adjustment since header is fixed/sticky */}
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}