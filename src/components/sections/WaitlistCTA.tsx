"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function WaitlistCTA() {
  return (
    <section id="waitlist" className="py-24 relative overflow-hidden" aria-labelledby="cta-heading">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/25 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-900/25 to-zinc-900 p-10 sm:p-14 shadow-2xl shadow-emerald-500/10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-6">
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            Now open for all users · Join 500+ brands
          </div>

          <h2
            id="cta-heading"
            className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight"
          >
            Ready to see where you rank in
            <br />
            <span className="gradient-text">AI search results?</span>
          </h2>

          <p className="text-white/65 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            Start monitoring your brand across ChatGPT, Perplexity, Google AI Overviews, and more.
            No credit card required. Free during beta.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
            <a
              href="/dashboard"
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:opacity-90 transition-all shadow-xl shadow-emerald-500/30 whitespace-nowrap"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
            <a
              href="/signin"
              className="px-8 py-3.5 rounded-full bg-white/[0.08] border border-white/[0.15] text-white font-semibold hover:bg-white/[0.12] transition-all whitespace-nowrap"
            >
              Sign In
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-xs text-white/45">
            <span>✓ No credit card</span>
            <span>✓ Free during beta</span>
            <span>✓ Cancel anytime</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
