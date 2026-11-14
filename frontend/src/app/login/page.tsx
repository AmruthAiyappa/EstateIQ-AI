"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Brain, Lock, Mail, Globe, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoLogin = () => {
    setIsLoading(true);
    // Simulate slight loading to show the premium spinner, then redirect
    setTimeout(() => {
      router.push("/dashboard");
    }, 800);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleDemoLogin();
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#08080a] text-zinc-300 px-4 overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-[20%] left-[10%] w-[50%] h-[50%] bg-[#06b6d4]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[10%] w-[50%] h-[50%] bg-[#8b5cf6]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md p-8 rounded-2xl bg-[#121215]/80 border border-[#222227] backdrop-blur-md shadow-2xl relative z-10">
        {/* Brand logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-accent to-purple-accent flex items-center justify-center font-extrabold text-black text-base">
              IQ
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">EstateIQ <span className="text-xs text-cyan-accent font-semibold">AI</span></span>
          </Link>
          <h2 className="text-lg font-bold text-white mb-1">Welcome to EstateIQ</h2>
          <p className="text-xs text-zinc-500">Log in to access your investment manager workspace.</p>
        </div>

        {/* Demo login shortcut box - Highly visible */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#121215] to-[#1a1a23] border border-[#3b3b4f] mb-6 text-center shadow-lg shadow-cyan-950/20">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-cyan-accent mb-2 uppercase tracking-wider">
            <Brain className="w-4 h-4" />
            Interview Quick Demo Access
          </div>
          <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed">
            Bypass standard authentication. Log in instantly with pre-seeded clients, pipelines, and active OpenAI integrations.
          </p>
          <button
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                Demo Login (Instant Access)
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-zinc-800"></div>
          <span className="flex-shrink mx-4 text-[10px] text-zinc-600 uppercase font-bold tracking-wider">Or continue with</span>
          <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        {/* Traditional inputs */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-700 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-xs font-bold text-white transition-colors flex items-center justify-center gap-2"
          >
            Send Magic Link
          </button>
        </form>

        <div className="mt-4 grid grid-cols-1 gap-3">
          <button
            onClick={handleDemoLogin}
            className="py-2.5 bg-[#121215] border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-bold text-white transition-all flex items-center justify-center gap-2"
          >
            <Globe className="w-4 h-4 text-zinc-400" />
            Sign in with Google
          </button>
        </div>

        <div className="mt-8 text-center text-[10px] text-zinc-600">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
