"use client";

import React from "react";
import Link from "next/link";
import { 
  Brain, ShieldCheck, BarChart3, MessageSquareCode, 
  MapPin, Landmark, ArrowUpRight, HelpCircle, ChevronDown
} from "lucide-react";

export default function LandingPage() {
  const stats = [
    { value: "45+", label: "Curated Prime Properties" },
    { value: "Dynamic", label: "Asset Underwriting" },
    { value: "8.9%", label: "Avg Rental Yield" },
    { value: "7+", label: "Dubai Communities" }
  ];

  const features = [
    {
      title: "Weighted Investment Scoring",
      description: "Every property gets a calculated score out of 100 based on Yield (30%), Appreciation (25%), Infra (15%), Developer (10%), Demand (10%), and Liquidity (10%).",
      icon: BarChart3,
      color: "text-cyan-accent"
    },
    {
      title: "Explain Like an Investment Manager",
      description: "Generate copy-pasteable client emails or text pitches explaining recommendations, tailored directly to your clients' risk profiles and investment goals.",
      icon: Brain,
      color: "text-purple-accent"
    },
    {
      title: "Interactive Objection Handler",
      description: "A sales-enablement tool that generates structured rebuttals to concerns like 'price too high' or 'location far from metro' using real property metrics.",
      icon: MessageSquareCode,
      color: "text-amber-accent"
    },
    {
      title: "Integrated CRM & Pipelines",
      description: "Manage client criteria, log viewing notes, and track active deals in a beautiful Kanban board tailored for real estate sales workflows.",
      icon: ShieldCheck,
      color: "text-emerald-accent"
    }
  ];

  const faqItems = [
    {
      q: "How does the AI Advisor calculate the recommendation score?",
      a: "EstateIQ AI uses a weighted scoring formula based on professional real estate parameters: 30% for rental yield, 25% for future appreciation, 15% for neighborhood infrastructure, 10% for developer rating, 10% for current demand velocity, and 10% for exit liquidity. When a client request is received, weights are automatically adjusted (e.g. prioritizing yield for income investors)."
    },
    {
      q: "Can the manager customize the generated pitches?",
      a: "Yes. The pitch generator ('Explain Like an Investment Manager') provides copyable formatted text that can be used directly for client emails, WhatsApp messages, or modified before sending."
    },
    {
      q: "What communities in Dubai are currently analyzed?",
      a: "Our curated list includes Palm Jumeirah, Downtown Dubai, Dubai Marina, Jumeirah Beach Residence (JBR), Business Bay, Jumeirah Village Circle (JVC), and Dubai Hills Estate."
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#08080a] text-zinc-300 font-sans overflow-hidden flex flex-col justify-between">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[50%] bg-[#06b6d4]/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-[#8b5cf6]/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full h-16 flex items-center justify-between px-6 sm:px-12 bg-[#08080a]/80 backdrop-blur-md border-b border-[#1a1a1f]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-accent to-purple-accent flex items-center justify-center font-bold text-black text-sm">
            IQ
          </div>
          <span className="font-bold text-lg text-white tracking-tight">EstateIQ <span className="text-xs text-cyan-accent">AI</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Advisor Portal
          </Link>
          <Link 
            href="/login" 
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-black bg-gradient-to-r from-cyan-accent to-purple-accent hover:opacity-90 transition-opacity"
          >
            Launch App
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 text-center max-w-5xl mx-auto flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-cyan-accent animate-pulse"></span>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Built for Luxury Real Estate</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
          Invest Smarter with <span className="bg-gradient-to-r from-cyan-accent via-[#a855f7] to-purple-accent bg-clip-text text-transparent">AI Decision Support</span>
        </h1>
        
        <p className="text-lg sm:text-xl font-medium text-zinc-400 max-w-2xl mx-auto mb-10">
          AI-Powered Real Estate Investment Advisor. Combine market metrics, scoring models, and client objection simulators in one unified workspace.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-black bg-white hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5"
          >
            Get Started
          </Link>
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-zinc-300 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors"
          >
            Try Demo
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-[#121215]/50 border border-[#222227] rounded-2xl backdrop-blur-sm max-w-4xl mx-auto">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-white bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 sm:px-12 bg-[#0c0c0e] border-y border-[#1a1a1f]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Engineered for Real Estate Advisors
            </h2>
            <p className="text-zinc-500 max-w-xl mx-auto text-sm sm:text-base">
              A specialized decision-support dashboard that helps client relationship managers structure recommendations and handle pricing objections.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feat, idx) => (
              <div 
                key={idx} 
                className="p-6 rounded-xl bg-[#121215] border border-[#222227] hover:border-zinc-700 transition-colors flex gap-5 items-start"
              >
                <div className={`p-3 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0 ${feat.color}`}>
                  <feat.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{feat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 sm:px-12 max-w-4xl mx-auto w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {faqItems.map((item, idx) => (
            <div key={idx} className="p-6 rounded-xl bg-[#121215]/50 border border-[#222227]">
              <div className="flex gap-3 items-start mb-2">
                <HelpCircle className="w-5 h-5 text-cyan-accent shrink-0 mt-0.5" />
                <h4 className="text-base font-semibold text-white">{item.q}</h4>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed pl-8">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-[#1a1a1f] px-6 sm:px-12 text-center text-xs text-zinc-600 bg-[#08080a]">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center justify-between w-full flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center font-bold text-[10px] text-white">
                IQ
              </div>
              <span className="font-semibold text-zinc-500">EstateIQ AI</span>
            </div>
            <p>© 2026 EstateIQ AI. Built for real estate recruitment and portfolio showcase.</p>
          </div>
          <p className="text-[10px] text-zinc-700 max-w-2xl mt-2 leading-relaxed">
            Disclaimer: This application is a student-built educational project demonstrating AI-assisted investment analysis using mock property data. It is not affiliated with STOREYS or intended for real financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
