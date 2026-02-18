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
    <section id="waitlist" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-emerald-500/15 bg-gradient-to-b from-emerald-500/5 to-transparent p-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
            <Sparkles className="w-3 h-3" />
            Private beta — limited spots
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            Your competitors are already
            <br />
            <span className="gradient-text">winning AI search</span>
          </h2>

          <p className="text-white/50 text-lg mb-10 max-w-lg mx-auto">
            Every day without GeoWatch is another day they capture your customers.
            Join the waitlist and be first to know when we open up.
          </p>

          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your work email"
                required
                className="flex-1 px-5 py-3.5 rounded-full bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-semibold hover:opacity-90 transition-all shadow-xl shadow-emerald-500/25"
              >
                Get Early Access <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" />
              You&apos;re on the list! We&apos;ll reach out within 48 hours.
            </motion.div>
          )}

          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-white/25">
            <span>✓ No credit card</span>
            <span>✓ Free during beta</span>
            <span>✓ Cancel anytime</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
