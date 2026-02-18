"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "GeoWatch showed us that ChatGPT was recommending our competitor for 73% of our key product queries. In 6 weeks of optimizing, we flipped that. Game-changing.",
    name: "Sarah Chen",
    role: "Head of Growth",
    company: "Meridian SaaS",
    stars: 5,
    initials: "SC",
    avatarColor: "from-emerald-500 to-teal-600",
  },
  {
    quote:
      "We were flying blind on AI search. GeoWatch gave us the first real visibility into where our brand stood — and a clear path to fixing it. Worth every penny.",
    name: "Marcus Webb",
    role: "VP Marketing",
    company: "Stackify",
    stars: 5,
    initials: "MW",
    avatarColor: "from-cyan-500 to-blue-600",
  },
  {
    quote:
      "The competitor intelligence alone is worth it. We can see exactly which prompts they're winning on, and we go after those systematically.",
    name: "Priya Sharma",
    role: "SEO Director",
    company: "Luminary Digital",
    stars: 5,
    initials: "PS",
    avatarColor: "from-violet-500 to-purple-600",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 border-t border-white/[0.08]" aria-labelledby="testimonials-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            id="testimonials-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold text-white mb-5 tracking-tight"
          >
            Loved by{" "}
            <span className="gradient-text">growth teams</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/65 text-lg"
          >
            See what early access users are saying about GeoWatch.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-zinc-700/60 bg-zinc-900 p-6 flex flex-col hover:bg-zinc-800 hover:border-zinc-600/60 transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4" aria-label={`${t.stars} out of 5 stars`}>
                {[...Array(t.stars)].map((_, j) => (
                  <Star
                    key={j}
                    className="w-3.5 h-3.5 text-amber-400 fill-amber-400"
                    aria-hidden="true"
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-white/75 text-sm leading-relaxed flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <figcaption className="flex items-center gap-3 pt-4 border-t border-white/[0.08]">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-xs font-bold text-white shadow-md shrink-0`}
                  aria-hidden="true"
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {t.name}
                  </div>
                  <div className="text-xs text-white/50">
                    {t.role} · {t.company}
                  </div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
