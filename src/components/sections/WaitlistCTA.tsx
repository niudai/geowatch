"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function WaitlistCTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section id="waitlist" className="py-24 relative overflow-hidden" aria-labelledby="waitlist-heading">
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
          className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-900/35 to-zinc-900 p-10 sm:p-14 shadow-2xl shadow-emerald-500/10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-6">
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            Private beta — limited spots
          </div>

          <h2
            id="waitlist-heading"
            className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight"
          >
            Your competitors are already
            <br />
            <span className="gradient-text">winning AI search</span>
          </h2>

          <p className="text-white/65 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            Every day without GeoWatch is another day they capture your customers.
            Join the waitlist and be first to know when we open up.
          </p>

          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              aria-label="Waitlist signup"
            >
              <label htmlFor="cta-email" className="sr-only">Work email address</label>
              <input
                id="cta-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your work email"
                required
                className="flex-1 px-5 py-3.5 rounded-full bg-white/[0.08] border border-white/[0.15] text-white placeholder-white/40 text-sm focus:outline-none focus:border-emerald-500/60 focus:bg-white/10 transition-all"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-semibold hover:opacity-90 transition-all shadow-xl shadow-emerald-500/25"
              >
                Get Early Access <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-sm font-medium"
              role="status"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              You&apos;re on the list! We&apos;ll reach out within 48 hours.
            </motion.div>
          )}

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
