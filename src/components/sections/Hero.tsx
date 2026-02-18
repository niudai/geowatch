"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, Eye, Zap } from "lucide-react";

const floatingBadges = [
  { icon: Eye, label: "ChatGPT", sub: "Cited #1", color: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-500/20", delay: 0 },
  { icon: TrendingUp, label: "Perplexity", sub: "+42% visibility", color: "from-cyan-500/20 to-cyan-500/5", border: "border-cyan-500/20", delay: 0.5 },
  { icon: Zap, label: "Google AI", sub: "Top mention", color: "from-violet-500/20 to-violet-500/5", border: "border-violet-500/20", delay: 1 },
];

export default function Hero() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-violet-500/5 rounded-full blur-[80px]" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-8"
          >
            <Sparkles className="w-3 h-3" />
            Now in Private Beta · Limited spots available
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
          >
            <span className="text-white">See how AI</span>
            <br />
            <span className="gradient-text">sees your brand</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg sm:text-xl text-white/50 leading-relaxed mb-10"
          >
            Track your brand's citations across ChatGPT, Perplexity, Google AI Overviews, and every major AI Answer Engine.
            Monitor competitors, find gaps, and rank higher — before they do.
          </motion.p>

          {/* Email form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-4"
          >
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex w-full gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your work email"
                  required
                  className="flex-1 px-4 py-3 rounded-full bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all"
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-emerald-500/25 whitespace-nowrap"
                >
                  Join Waitlist <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium"
              >
                <Sparkles className="w-4 h-4" />
                You're on the list! We'll be in touch soon.
              </motion.div>
            )}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-white/25"
          >
            No credit card required · Private beta · 500+ brands already tracking
          </motion.p>

          {/* Floating badges */}
          <div className="relative mt-20 max-w-3xl mx-auto">
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
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <badge.icon className="w-4 h-4 text-white/70" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-white/80">{badge.label}</div>
                      <div className="text-xs text-white/40">{badge.sub}</div>
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
              className="mt-8 rounded-2xl border border-white/8 bg-white/2 backdrop-blur-sm overflow-hidden shadow-2xl"
            >
              <div className="bg-white/3 border-b border-white/8 px-4 py-3 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                <div className="flex-1 mx-3 h-5 rounded bg-white/5 flex items-center px-3">
                  <span className="text-[10px] text-white/20">app.geowatch.ai/dashboard</span>
                </div>
              </div>
              <div className="p-6">
                {/* Mock chart area */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "AI Visibility Score", value: "87", delta: "+12%", color: "text-emerald-400" },
                    { label: "Prompts Tracked", value: "2,840", delta: "+8.3%", color: "text-cyan-400" },
                    { label: "Citations Found", value: "1,203", delta: "+24%", color: "text-violet-400" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white/3 rounded-xl p-4 border border-white/5">
                      <div className="text-xs text-white/40 mb-2">{stat.label}</div>
                      <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                      <div className={`text-xs font-medium ${stat.color}`}>{stat.delta} this week</div>
                    </div>
                  ))}
                </div>
                {/* Mock bar chart */}
                <div className="bg-white/2 rounded-xl p-4 border border-white/5">
                  <div className="text-xs text-white/40 mb-4">AI Platform Visibility Breakdown</div>
                  <div className="space-y-3">
                    {[
                      { platform: "ChatGPT", pct: 82, color: "bg-emerald-500" },
                      { platform: "Perplexity", pct: 67, color: "bg-cyan-500" },
                      { platform: "Google AI", pct: 71, color: "bg-violet-500" },
                      { platform: "Claude", pct: 45, color: "bg-blue-500" },
                    ].map((item) => (
                      <div key={item.platform} className="flex items-center gap-3">
                        <span className="text-xs text-white/50 w-20 shrink-0">{item.platform}</span>
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.pct}%` }}
                            transition={{ duration: 1, delay: 0.8 }}
                            className={`h-full ${item.color} rounded-full opacity-70`}
                          />
                        </div>
                        <span className="text-xs text-white/40 w-8 text-right">{item.pct}%</span>
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
