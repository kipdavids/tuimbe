"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { appConfig } from "@/config/app.config";
import { Logo } from "./Logo";

export function Splash({ onDone }: { onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 1400); return () => clearTimeout(t); }, [onDone]);
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-primary text-white" exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 160, damping: 14 }}><Logo size={96} /></motion.div>
      <h1 className="font-serif text-4xl font-bold">{appConfig.appName}</h1>
      <p className="text-sm text-white/80">{appConfig.tagline}</p>
    </motion.div>
  );
}
