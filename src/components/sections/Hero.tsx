"use client";

import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Eye, Zap, Sparkles } from "lucide-react";

const floatingBadges = [
  { icon: Eye, label: "ChatGPT", sub: "Cited #1", color: "from-cyan-500/20 to-cyan-900/20", border: "border-cyan-500/50", iconColor: "text-cyan-400", delay: 0 },
  { icon: TrendingUp, label: "Perplexity", sub: "+42% visibility", color: "from-amber-500/20 to-amber-900/20", border: "border-amber-500/40", iconColor: "text-amber-400", delay: 0.5 },
  { icon: Zap, label: "Google AI", sub: "Top mention", color: "from-cyan-400/15 to-cyan-800/15", border: "border-cyan-400/40", iconColor: "text-cyan-300", delay: 1 },
];

export default function Hero() {

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
      aria-label="GeoWatch hero — AI search visibility monitoring platform"
    >
      {/* Background glow blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="glow-pulse absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-emerald-500/10 rounded-full blur-[130px]" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[100px]" />
        <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-violet-500/8 rounded-full blur-[90px]" />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          {/* Beta badge with cyan accent */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 text-xs font-medium mb-8"
          >
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            Now in Private Beta · 50+ Brands Tracking
          </motion.div>

          {/* Main headline — Data-centric, bold */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
          >
            <span className="text-white">Your brand in</span>
            <br />
            <span className="gradient-text">every AI response</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg sm:text-xl text-white/70 leading-relaxed mb-10"
          >
            GeoWatch tracks your brand's citations across ChatGPT, Perplexity, Google AI Overviews,
            and every major AI answer engine. Monitor competitors, find gaps, and rank higher —
            before they do.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto mb-4"
          >
            <a
              href="/dashboard"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-emerald-500/40 whitespace-nowrap"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
            <a
              href="/signin"
              className="px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/15 transition-all whitespace-nowrap"
            >
              Sign In
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-white/45"
          >
            No credit card required · Private beta · 500+ brands already tracking
          </motion.p>

          {/* Floating AI platform badges */}
          <div className="relative mt-16 max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {floatingBadges.map((badge, i) => (
                <motion.div
                  key={badge.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
                  style={{ animationDelay: `${badge.delay}s` }}
                  className="float-animation"
                >
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-b ${badge.color} border ${badge.border} backdrop-blur-sm`}>
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <badge.icon className={`w-4 h-4 ${badge.iconColor}`} aria-hidden="true" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-white/90">{badge.label}</div>
                      <div className="text-xs text-white/55">{badge.sub}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Mock dashboard preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-8 rounded-2xl border border-zinc-700/60 bg-zinc-900 overflow-hidden shadow-2xl shadow-black/50"
              aria-label="GeoWatch dashboard preview"
            >
              {/* Browser chrome */}
              <div className="bg-zinc-800 border-b border-zinc-700/60 px-4 py-3 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
                <div className="flex-1 mx-3 h-5 rounded bg-white/[0.07] flex items-center px-3">
                  <span className="text-[10px] text-white/35">app.geowatch.ai/dashboard</span>
                </div>
              </div>

              <div className="p-6">
                {/* Data metric cards — cyan focused */}
                <div className="grid grid-cols-3 gap-4 mb-5">
                  {[
                    { label: "AI Visibility", value: "87%", delta: "+12%", icon: "📊" },
                    { label: "Mentions Found", value: "2.8K", delta: "+24%", icon: "🎯" },
                    { label: "Avg. Rating", value: "4.6★", delta: "+0.3★", icon: "⭐" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-zinc-900/60 rounded-lg p-4 border border-cyan-500/30 hover:border-cyan-500/60 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{stat.icon}</span>
                        <div className="text-xs text-white/50 uppercase tracking-wide">{stat.label}</div>
                      </div>
                      <div className="text-2xl font-bold text-cyan-300 mb-1 font-mono">{stat.value}</div>
                      <div className="text-xs font-medium text-amber-400">{stat.delta} this week</div>
                    </div>
                  ))}
                </div>

                {/* Platform breakdown chart */}
                <div className="bg-zinc-900/50 rounded-lg p-4 border border-cyan-500/20">
                  <div className="text-xs text-white/60 mb-4 font-medium uppercase tracking-wide">Platform Breakdown</div>
                  <div className="space-y-3">
                    {[
                      { platform: "ChatGPT", pct: 82, color: "bg-cyan-500" },
                      { platform: "Perplexity", pct: 67, color: "bg-amber-500/80" },
                      { platform: "Google AI", pct: 71, color: "bg-cyan-400/60" },
                      { platform: "Claude", pct: 45, color: "bg-cyan-600/50" },
                    ].map((item) => (
                      <div key={item.platform} className="flex items-center gap-3">
                        <span className="text-xs text-white/60 w-20 shrink-0">{item.platform}</span>
                        <div className="flex-1 h-2 bg-white/[0.08] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.pct}%` }}
                            transition={{ duration: 1.2, delay: 0.8 }}
                            className={`h-full ${item.color} rounded-full opacity-80`}
                          />
                        </div>
                        <span className="text-xs text-white/55 w-8 text-right font-medium">{item.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
