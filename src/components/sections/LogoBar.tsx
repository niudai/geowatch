"use client";

import { motion } from "framer-motion";

const companies = [
  "Notion", "Linear", "Figma", "Stripe", "Vercel", "Supabase", "Resend", "Raycast"
];

export default function LogoBar() {
  return (
    <section className="py-16 border-y border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs font-medium text-white/25 uppercase tracking-widest mb-10"
        >
          Trusted by growth teams at
        </motion.p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {companies.map((name, i) => (
            <motion.span
              key={name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="text-white/20 font-semibold text-sm tracking-wide hover:text-white/40 transition-colors cursor-default"
            >
              {name}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
