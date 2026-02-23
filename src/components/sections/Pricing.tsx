"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    tagline: "Get started",
    price: "$0",
    period: "",
    features: [
      "1 app tracked",
      "3 keywords per app",
      "Google AI + ChatGPT",
      "Manual monitoring",
    ],
    cta: "Get Started",
    featured: false,
  },
  {
    name: "Pro",
    tagline: "For solo marketers",
    price: "$49",
    period: "/mo",
    badge: "Most Popular",
    features: [
      "Up to 3 apps",
      "10 keywords per app",
      "Daily AI monitoring",
      "Google AI + ChatGPT",
      "Email reports",
      "3-day free trial",
    ],
    cta: "Start Free Trial",
    featured: true,
  },
  {
    name: "Business",
    tagline: "For growing teams",
    price: "$199",
    period: "/mo",
    features: [
      "Up to 10 apps",
      "10 keywords per app",
      "Real-time monitoring",
      "All AI platforms",
      "Priority support",
      "API access",
      "3-day free trial",
    ],
    cta: "Start Free Trial",
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 relative" aria-labelledby="pricing-heading">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-violet-500/6 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            id="pricing-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-white mb-5 tracking-tight"
          >
            Simple, transparent{" "}
            <span className="gradient-text">pricing</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-lg mx-auto text-white/65 text-lg leading-relaxed"
          >
            Start free. Upgrade when you need more apps and keywords.
            All paid plans include a 3-day free trial.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border p-8 ${
                plan.featured
                  ? "border-cyan-500/40 bg-gradient-to-b from-cyan-900/30 to-zinc-900 scale-105 shadow-xl shadow-cyan-500/20"
                  : "border-zinc-700/60 bg-zinc-900"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-amber-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/30">
                    <Sparkles className="w-3 h-3" aria-hidden="true" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className="text-sm font-medium text-white/55 mb-1">{plan.tagline}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className={`${plan.featured ? "text-cyan-400" : "text-white/80"}`}>
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-sm text-white/45">{plan.period}</span>}
                </div>
              </div>

              <ul className="space-y-3 mb-8" aria-label={`${plan.name} plan features`}>
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-white/65">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/dashboard"
                className={`block w-full text-center py-3 rounded-full text-sm font-semibold transition-all duration-200 ${
                  plan.featured
                    ? "bg-gradient-to-r from-cyan-500 to-amber-500 text-white hover:opacity-90 shadow-lg shadow-cyan-500/30"
                    : "bg-zinc-800 border border-zinc-600/60 text-white/80 hover:bg-zinc-700 hover:text-white"
                }`}
                aria-label={`${plan.cta} for ${plan.name} plan`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs text-white/40 mt-8"
        >
          All paid plans include a 3-day free trial · Cancel anytime
        </motion.p>
      </div>
    </section>
  );
}
