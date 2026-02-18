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
      "100 prompts/month",
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
      "500 prompts/month",
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
    <section id="pricing" className="py-24 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-violet-500/4 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-medium mb-5"
          >
            <Lock className="w-3 h-3" /> Private beta pricing
          </motion.div>
          <motion.h2
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
            className="max-w-lg mx-auto text-white/50 text-lg"
          >
            We're in private beta. Join the waitlist to lock in early-bird
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
                  ? "border-emerald-500/30 bg-gradient-to-b from-emerald-500/8 to-transparent scale-105"
                  : "border-white/8 bg-white/2"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-semibold">
                    <Sparkles className="w-3 h-3" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className="text-sm font-medium text-white/50 mb-1">{plan.tagline}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="text-white/30 text-sm">{plan.price}</div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-white/60">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="#waitlist"
                className={`block w-full text-center py-3 rounded-full text-sm font-semibold transition-all duration-200 ${
                  plan.featured
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:opacity-90 shadow-lg shadow-emerald-500/20"
                    : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
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
          className="text-center text-xs text-white/25 mt-8"
        >
          Beta users get early-bird pricing locked in for life · No credit card during beta
        </motion.p>
      </div>
    </section>
  );
}
