"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Building2, Brain, Users2, Calculator, 
  TrendingUp, FileBarChart, Settings, Menu, X, LogOut, Search, Bell
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active navigation items for the MVP
  const primaryNavItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Properties", href: "/dashboard/properties", icon: Building2 },
    { name: "AI Advisor", href: "/dashboard/advisor", icon: Brain },
    { name: "CRM & Pipelines", href: "/dashboard/crm", icon: Users2 },
    { name: "Calculators", href: "/dashboard/calculator", icon: Calculator },
  ];

  // Secondary items marked "Coming Soon"
  const secondaryNavItems = [
    { name: "Market Trends", icon: TrendingUp, comingSoon: true },
    { name: "PDF Reports", icon: FileBarChart, comingSoon: true },
    { name: "System Settings", icon: Settings, comingSoon: true },
  ];

  const handleLogout = () => {
    // Clear mock session and redirect to landing page
    router.push("/");
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground overflow-hidden">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0d0d0f] border-r border-[#1a1a1f] shrink-0">
        {/* Brand Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[#1a1a1f]">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-accent to-purple-accent flex items-center justify-center font-bold text-black text-sm">
              IQ
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              EstateIQ <span className="text-xs font-semibold text-cyan-accent">AI</span>
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
          <nav className="space-y-6">
            <div>
              <div className="px-3 mb-2 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                Advisory Workspace
              </div>
              <ul className="space-y-1">
                {primaryNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-[#1b1b22] to-[#121215] border-l-2 border-cyan-accent text-white shadow-sm"
                            : "text-zinc-400 hover:text-white hover:bg-[#121215]"
                        }`}
                      >
                        <item.icon className={`w-4 h-4 ${isActive ? "text-cyan-accent" : "text-zinc-400"}`} />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <div className="px-3 mb-2 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                Extended Tools
              </div>
              <ul className="space-y-1">
                {secondaryNavItems.map((item) => (
                  <li key={item.name}>
                    <div className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-600 cursor-not-allowed">
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4 text-zinc-600" />
                        <span>{item.name}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 font-semibold border border-zinc-700">
                        SOON
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* User Account / Logout */}
          <div className="border-t border-[#1a1a1f] pt-4 mt-6">
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-accent to-pink-500 flex items-center justify-center font-bold text-white text-xs">
                  IM
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-white">Investment Manager</p>
                  <p className="text-[10px] text-zinc-500">Dubai Advisory Desk</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-sm">
          <div className="w-64 bg-[#0d0d0f] border-r border-[#1a1a1f] p-4 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#1a1a1f]">
                <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-accent to-purple-accent flex items-center justify-center font-bold text-black text-sm">
                    IQ
                  </div>
                  <span className="font-bold text-lg text-white">EstateIQ</span>
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {primaryNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-[#1b1b22] to-[#121215] border-l-2 border-cyan-accent text-white"
                          : "text-zinc-400 hover:text-white hover:bg-[#121215]"
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${isActive ? "text-cyan-accent" : "text-zinc-400"}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-[#1a1a1f] pt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-accent to-pink-500 flex items-center justify-center font-bold text-white text-xs">
                  IM
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Advisory Agent</p>
                  <p className="text-[10px] text-zinc-500">Demo Session</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <header className="h-16 flex items-center justify-between px-6 bg-[#08080a]/90 backdrop-blur-md border-b border-[#1a1a1f] z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Global Search Interface */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#121215] border border-[#222227] rounded-lg w-64 text-zinc-400">
              <Search className="w-3.5 h-3.5" />
              <span className="text-xs">Quick search...</span>
              <kbd className="ml-auto text-[9px] font-semibold bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications Toggle */}
            <button className="relative p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#121215] transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-accent rounded-full ring-2 ring-background"></span>
            </button>

            {/* Current Region / Market Indicator */}
            <div className="flex items-center gap-2 px-3 py-1 bg-[#121215] border border-[#222227] rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-accent animate-pulse"></span>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Dubai Local Time
              </span>
            </div>
          </div>
        </header>

        {/* Child Views */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
