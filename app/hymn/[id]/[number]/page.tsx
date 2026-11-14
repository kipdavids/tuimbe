"use client";
import { use } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Moon, Share2, Star, Sun } from "lucide-react";
import { FONT_SIZES } from "@/config/app.config";
import { useLibrary } from "@/hooks/useLibrary";
import { usePrefs } from "@/hooks/usePrefs";
import { useFavorites } from "@/hooks/useFavorites";
import { Skeleton } from "@/components/Skeleton";
import { cn, matchesCollectionRoute } from "@/lib/utils";
import type { Language } from "@/types";

export default function HymnPage({ params }: { params: Promise<{ id: string; number: string }> }) {
  const { id, number } = use(params);
  const n = Number(number);
  const { collections, status } = useLibrary();
  const { prefs, update } = usePrefs();
  const { isFav, toggle } = useFavorites();
  const col = collections.find((c) => matchesCollectionRoute(c, id));
  const idx = col ? col.songs.findIndex((s) => s.hymn_number === n) : -1;
  const song = col?.songs[idx];
  if (!col || !song) return status === "loading" ? <Skeleton /> : <p className="p-6 text-muted">Song not found.</p>;

  const lang = prefs.language;
  const block = song[lang];
  const step = (d: number) => {
    const i = (FONT_SIZES as readonly number[]).indexOf(prefs.fontSize);
    const j = Math.min(FONT_SIZES.length - 1, Math.max(0, (i < 0 ? 2 : i) + d));
    update({ fontSize: FONT_SIZES[j] });
  };
  const splitText = (text: string) => {
    const normalized = text.replace(/\s+/g, " ").trim();
    if (!normalized) return [];

    const parts = normalized
      .split(/(?<=[,;:])\s+|(?<=[.!?])\s+/)
      .map((part) => part.trim())
      .filter(Boolean);

    const lines: string[] = [];
    for (const part of parts) {
      const clean = part.replace(/^[,;:.!?\s]+|[,;:.!?\s]+$/g, "");
      if (!clean) continue;
      const last = lines.at(-1) ?? "";
      if (last && last.length < 26 && clean.length < 26) {
        lines[lines.length - 1] = `${last} ${clean}`;
      } else {
        lines.push(clean);
      }
    }

    return lines.length ? lines : [normalized];
  };

  const share = async () => {
    const text = `${n}. ${block.title ?? song.english.title}\n\n${block.verses.map((v) => `${v.number}. ${splitText(v.text).join("\n")}`).join("\n\n")}`;
    try { if (navigator.share) await navigator.share({ title: block.title ?? "", text, url: location.href }); else await navigator.clipboard.writeText(text); } catch {}
  };
  const prev = col.songs[idx - 1], next = col.songs[idx + 1];
  const btn = "grid h-10 w-10 place-items-center rounded-full bg-card shadow-sm shadow-black/5 active:scale-95";

  return (
    <>
      <div className="sticky top-0 z-10 bg-bg/95 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur">
        <div className="flex items-center gap-2">
          <Link href={`/library/${col.id}`} className={btn} aria-label="Back"><ChevronLeft size={20} /></Link>
          <div className="flex-1" />
          <button className={btn} onClick={() => toggle(col.id, n)} aria-label="Favorite"><Star size={20} className={isFav(col.id, n) ? "fill-accent text-accent" : ""} /></button>
          <button className={btn} onClick={() => update({ theme: prefs.theme === "dark" ? "light" : "dark" })} aria-label="Theme">{prefs.theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}</button>
          <button className={cn(btn, "font-semibold")} onClick={() => step(-1)} aria-label="Smaller text">A−</button>
          <button className={cn(btn, "font-semibold")} onClick={() => step(1)} aria-label="Larger text">A+</button>
          <button className={btn} onClick={share} aria-label="Share"><Share2 size={20} /></button>
        </div>
        <div className="mt-3 grid grid-cols-2 rounded-2xl bg-black/5 p-1 dark:bg-white/10">
          {(["english", "swahili"] as Language[]).map((l) => (
            <button key={l} onClick={() => update({ language: l })} className={cn("rounded-xl py-2 text-sm font-medium capitalize transition", lang === l ? "bg-card shadow text-primary dark:text-accent" : "text-muted")}>{l}</button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.article key={lang} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="px-5 pb-8 pt-4" style={{ fontSize: prefs.fontSize }}>
          <p className="text-sm text-muted">{lang === "english" ? song.category_english : song.category_swahili}</p>
          <h1 className="mb-5 font-serif font-bold leading-tight" style={{ fontSize: "1.35em" }}><span className="mr-2 text-accent">{n}</span>{block.title ?? song.english.title}</h1>
          {block.verses.length === 0 && <p className="text-muted">No {lang === "swahili" ? "Swahili" : "English"} text is printed for this song.</p>}
          <div className="space-y-5 font-serif leading-relaxed">
            {block.verses.map((v) => (
              <div key={v.number}>
                <div>
                  <span className="mr-2 font-sans text-[0.8em] font-semibold text-primary dark:text-accent">{v.number}.</span>
                  {splitText(v.text).map((line, index) => (
                    <p key={`${v.number}-${index}`} className="mb-1 last:mb-0">{line}</p>
                  ))}
                </div>
                {block.chorus && (
                  <div className="mt-3 border-l-4 border-accent pl-4 italic">
                    {splitText(block.chorus).map((line, index) => (
                      <p key={`chorus-${index}`} className="mb-1 last:mb-0">{line}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          {block.note && <p className="mt-6 text-[0.8em] text-muted">{block.note}</p>}
        </motion.article>
      </AnimatePresence>

      <div className="flex justify-between px-4 pb-4">
        {prev ? <Link href={`/hymn/${col.id}/${prev.hymn_number}`} className="flex items-center text-sm text-muted"><ChevronLeft size={18} />{prev.hymn_number}</Link> : <span />}
        {next ? <Link href={`/hymn/${col.id}/${next.hymn_number}`} className="flex items-center text-sm text-muted">{next.hymn_number}<ChevronRight size={18} /></Link> : <span />}
      </div>
    </>
  );
}
