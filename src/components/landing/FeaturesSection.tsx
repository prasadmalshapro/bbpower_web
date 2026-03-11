"use client";

import { FEATURES } from "@/constants/landing";
import { motion } from "framer-motion";

const icons: Record<string, JSX.Element> = {
  battery: (
    <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  payment: (
    <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  leaf: (
    <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
};

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative flex flex-col items-center justify-center gap-12 px-6 py-20 md:py-28"
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-3xl font-semibold md:text-4xl"
      >
        <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Why BB Charge
        </span>
      </motion.h2>

      <div className="grid w-full max-w-5xl gap-8 md:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="landing-welcome-box flex flex-col items-center gap-4 rounded-2xl border border-[#7042f88b] p-6 text-center md:p-8"
          >
            <span className="text-[#b49bff]">
              {icons[feature.icon] ?? icons.battery}
            </span>
            <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
            <p className="text-gray-400">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
