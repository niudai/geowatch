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
    borderColor: "border-emerald-500/20",
    bgColor: "bg-emerald-500/10",
  },
  {
    number: "02",
    icon: Cpu,
    title: "We track everything",
    description:
      "Our system runs thousands of prompts daily across ChatGPT, Perplexity, Google AI Overviews, Claude, and more — capturing every mention, citation, and sentiment.",
    color: "text-cyan-400",
    borderColor: "border-cyan-500/20",
    bgColor: "bg-cyan-500/10",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Take action and rank higher",
    description:
      "Get a prioritized action plan. Create content AI cites, fix technical issues, and outmaneuver competitors in the AI search landscape.",
    color: "text-violet-400",
    borderColor: "border-violet-500/20",
    bgColor: "bg-violet-500/10",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-medium mb-5"
          >
            Simple setup
          </motion.div>
          <motion.h2
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
            className="max-w-xl mx-auto text-white/50 text-lg"
          >
            No complex setup. No code required. See your first AI visibility
            report within 24 hours of signing up.
          </motion.p>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <div className={`rounded-2xl border ${step.borderColor} bg-white/2 p-8 h-full`}>
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-xl ${step.bgColor} border ${step.borderColor} flex items-center justify-center shrink-0`}>
                      <step.icon className={`w-6 h-6 ${step.color}`} />
                    </div>
                    <span className="text-4xl font-bold text-white/8 leading-none mt-1">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-white/45 text-sm leading-relaxed">
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
