"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Baby, Music, Mic2, type LucideIcon } from "lucide-react";
import type { Collection } from "@/types";

const ICONS: Record<string, LucideIcon> = { "book-open": BookOpen, baby: Baby, music: Music, mic: Mic2 };

export function CollectionCard({ c, i }: { c: Collection; i: number }) {
  const Icon = ICONS[c.icon] ?? Music;
  const n = c.songs.length;
  const href = c.url ?? `/library/${c.id}`;

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} whileTap={{ scale: 0.98 }}>
      <Link href={href} className="block overflow-hidden rounded-3xl bg-card shadow-md shadow-black/5">
        <div className="relative flex h-32 items-end bg-gradient-to-br from-primary to-accent p-4" style={c.coverImage ? { backgroundImage: `url(${c.coverImage})`, backgroundSize: "cover" } : undefined}>
          <span className="rounded-2xl bg-white/90 p-2.5 text-primary"><Icon size={24} /></span>
        </div>
        <div className="p-4">
          <h2 className="font-serif text-xl font-semibold">{c.title}</h2>
          <p className="text-sm text-muted">{c.description}</p>
          {c.url && <p className="mt-2 text-xs text-muted">{c.url}</p>}
          <p className="mt-2 text-sm font-medium text-primary dark:text-accent">{n} {c.unit ?? (n === 1 ? "Song" : "Songs")}</p>
        </div>
      </Link>
    </motion.div>
  );
}
