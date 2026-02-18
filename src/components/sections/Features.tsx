"use client";

import { motion } from "framer-motion";
import { Radio, BarChart3, Search, Zap, Users, Shield } from "lucide-react";

const features = [
  {
    icon: Radio,
    title: "Real-Time AI Monitoring",
    description:
      "Track your brand mentions across ChatGPT, Perplexity, Google AI Overviews, Claude, Grok, and more — updated daily with full citation context.",
    gradient: "from-emerald-500/15 to-transparent",
    border: "border-white/[0.1] hover:border-emerald-500/40",
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/15",
  },
  {
    icon: BarChart3,
    title: "AI Visibility Score",
    description:
      "Get a single GEO score that quantifies how visible your brand is in AI search results versus your competitors. Track progress week over week.",
    gradient: "from-cyan-500/15 to-transparent",
    border: "border-white/[0.1] hover:border-cyan-500/40",
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/15",
  },
  {
    icon: Search,
    title: "Prompt Volume Explorer",
    description:
      "Discover what AI users are actually asking. See search volume for 120M+ AI chat queries relevant to your market and find untapped opportunities.",
    gradient: "from-violet-500/15 to-transparent",
    border: "border-white/[0.1] hover:border-violet-500/40",
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/15",
  },
  {
    icon: Zap,
    title: "AI Action Center",
    description:
      "Get specific, actionable tasks: which content to create, which pages to refresh, which sites to get cited on — prioritized by impact.",
    gradient: "from-amber-500/15 to-transparent",
    border: "border-white/[0.1] hover:border-amber-500/40",
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/15",
  },
  {
    icon: Users,
    title: "Competitor Intelligence",
    description:
      "See exactly which prompts your competitors rank for but you don't. Find the gaps and systematically capture that traffic before they solidify.",
    gradient: "from-pink-500/15 to-transparent",
    border: "border-white/[0.1] hover:border-pink-500/40",
    iconColor: "text-pink-400",
    iconBg: "bg-pink-500/15",
  },
  {
    icon: Shield,
    title: "Sentiment Analysis",
    description:
      "Understand the tone and context of every AI mention. Know when AI is recommending, criticizing, or ignoring your brand across all platforms.",
    gradient: "from-blue-500/15 to-transparent",
    border: "border-white/[0.1] hover:border-blue-500/40",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/15",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 relative" aria-labelledby="features-heading">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.07] border border-white/[0.12] text-white/60 text-xs font-medium mb-5"
          >
            Everything you need
          </motion.div>
          <motion.h2
            id="features-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-white mb-5 tracking-tight"
          >
            One platform. Total{" "}
            <span className="gradient-text">AI visibility.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-xl mx-auto text-white/65 text-lg leading-relaxed"
          >
            Stop guessing how AI talks about you. GeoWatch gives you the data,
            insights, and action plan to dominate AI search results.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className={`group relative rounded-2xl border bg-zinc-900 p-6 transition-all duration-300 hover:bg-zinc-800 ${feature.border} overflow-hidden`}
            >
              {/* Hover gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`}
                aria-hidden="true"
              />

              <div className="relative">
                <div className={`w-10 h-10 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-5 h-5 ${feature.iconColor}`} aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
