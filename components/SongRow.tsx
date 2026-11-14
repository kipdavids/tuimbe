import Link from "next/link";
import type { Song } from "@/types";
export function SongRow({ collectionId, song }: { collectionId: string; song: Song }) {
  return (
    <Link href={`/hymn/${collectionId}/${song.hymn_number}`} className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-sm shadow-black/5 active:scale-[0.99]">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-sm font-semibold text-primary dark:text-accent">{song.hymn_number}</span>
      <span className="min-w-0">
        <span className="block truncate font-medium">{song.english.title ?? song.swahili.title}</span>
        <span className="block truncate text-sm text-muted">{song.swahili.title ?? ""}</span>
      </span>
    </Link>
  );
}
