"use client";

import { motion } from "framer-motion";
import { Check, Lock, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Starter",
    tagline: "For solo marketers",
    price: "Coming Soon",
    features: [
      "1 brand tracked",
      "3 AI platforms",
      "100 prompts / month",
      "Weekly reports",
      "Email support",
    ],
    cta: "Join Waitlist",
    featured: false,
  },
  {
    name: "Growth",
    tagline: "For growing teams",
    price: "Coming Soon",
    badge: "Most Popular",
    features: [
      "3 brands tracked",
      "All AI platforms",
      "500 prompts / month",
      "Daily monitoring",
      "Competitor tracking",
      "AI Action Center",
      "Priority support",
    ],
    cta: "Join Waitlist",
    featured: true,
  },
  {
    name: "Enterprise",
    tagline: "For agencies & large brands",
    price: "Custom",
    features: [
      "Unlimited brands",
      "Custom AI platforms",
      "Unlimited prompts",
      "Real-time monitoring",
      "Dedicated strategist",
      "API access",
      "SSO + SOC2",
      "SLA guarantee",
    ],
    cta: "Talk to Sales",
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
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.07] border border-white/[0.12] text-white/60 text-xs font-medium mb-5"
          >
            <Lock className="w-3 h-3" aria-hidden="true" /> Private beta pricing
          </motion.div>
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
            We&apos;re in private beta. Join the waitlist to lock in early-bird
            pricing — up to 40% off at launch.
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
                  ? "border-emerald-500/40 bg-gradient-to-b from-emerald-900/40 to-zinc-900 scale-105 shadow-xl shadow-emerald-500/15"
                  : "border-zinc-700/60 bg-zinc-900"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20">
                    <Sparkles className="w-3 h-3" aria-hidden="true" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className="text-sm font-medium text-white/55 mb-1">{plan.tagline}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className={`text-sm font-medium ${plan.featured ? "text-emerald-400" : "text-white/45"}`}>
                  {plan.price}
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

              <a
                href="#waitlist"
                className={`block w-full text-center py-3 rounded-full text-sm font-semibold transition-all duration-200 ${
                  plan.featured
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:opacity-90 shadow-lg shadow-emerald-500/25"
                    : "bg-zinc-800 border border-zinc-600/60 text-white/80 hover:bg-zinc-700 hover:text-white"
                }`}
                aria-label={`${plan.cta} for ${plan.name} plan`}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs text-white/40 mt-8"
        >
          Beta users get early-bird pricing locked in for life · No credit card during beta
        </motion.p>
      </div>
    </section>
  );
}
