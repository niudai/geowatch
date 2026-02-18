"use client";

import { motion } from "framer-motion";
import { Globe, Cpu, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Globe,
    title: "Connect your brand",
    description:
      "Add your domain and keywords. GeoWatch starts mapping how AI platforms respond to queries related to your brand, products, and competitors.",
    color: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    bgColor: "bg-emerald-500/12",
    numColor: "text-emerald-500/25",
    glowColor: "shadow-emerald-500/10",
  },
  {
    number: "02",
    icon: Cpu,
    title: "We track everything",
    description:
      "Our system runs thousands of prompts daily across ChatGPT, Perplexity, Google AI Overviews, Claude, and more — capturing every mention, citation, and sentiment.",
    color: "text-cyan-400",
    borderColor: "border-cyan-500/30",
    bgColor: "bg-cyan-500/12",
    numColor: "text-cyan-500/25",
    glowColor: "shadow-cyan-500/10",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Take action and rank higher",
    description:
      "Get a prioritized action plan. Create content AI cites, fix technical issues, and outmaneuver competitors in the AI search landscape.",
    color: "text-violet-400",
    borderColor: "border-violet-500/30",
    bgColor: "bg-violet-500/12",
    numColor: "text-violet-500/25",
    glowColor: "shadow-violet-500/10",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative" aria-labelledby="how-it-works-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.07] border border-white/[0.12] text-white/60 text-xs font-medium mb-5"
          >
            Simple setup
          </motion.div>
          <motion.h2
            id="how-it-works-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-white mb-5 tracking-tight"
          >
            Up and running{" "}
            <span className="gradient-text">in minutes</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-xl mx-auto text-white/65 text-lg leading-relaxed"
          >
            No complex setup. No code required. See your first AI visibility
            report within 24 hours of signing up.
          </motion.p>
        </div>

        <div className="relative">
          {/* Connecting line — desktop only */}
          <div
            className="hidden lg:block absolute top-[3.5rem] left-[calc(16.666%+3rem)] right-[calc(16.666%+3rem)] h-px bg-gradient-to-r from-emerald-500/30 via-cyan-500/30 to-violet-500/30"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <div className={`rounded-2xl border ${step.borderColor} bg-zinc-900 p-8 h-full shadow-lg ${step.glowColor}`}>
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-12 h-12 rounded-xl ${step.bgColor} border ${step.borderColor} flex items-center justify-center shrink-0`}>
                      <step.icon className={`w-6 h-6 ${step.color}`} aria-hidden="true" />
                    </div>
                    <span className={`text-5xl font-bold ${step.numColor} leading-none select-none`}>
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
