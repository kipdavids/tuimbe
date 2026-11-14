import Fuse from "fuse.js";
import type { Song } from "@/types";

export function buildSearch(songs: Song[]) {
  const docs = songs.map((song) => ({ song, num: String(song.hymn_number), en: song.english.title ?? "", sw: song.swahili.title ?? "" }));
  const fuse = new Fuse(docs, { keys: [{ name: "num", weight: 2 }, "en", "sw"], threshold: 0.3, ignoreLocation: true });
  return (q: string): Song[] => {
    q = q.trim();
    if (!q) return songs;
    if (/^\d+$/.test(q)) {
      const hit = docs.filter((d) => d.num.startsWith(q)).map((d) => d.song);
      if (hit.length) return hit;
    }
    return fuse.search(q).map((r) => r.item.song);
  };
}
