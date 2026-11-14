"use client";
import { use, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Search } from "lucide-react";
import { useLibrary } from "@/hooks/useLibrary";
import { buildSearch } from "@/lib/search";
import { SongRow } from "@/components/SongRow";
import { Skeleton } from "@/components/Skeleton";

export default function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { collections, status } = useLibrary();
  const col = collections.find((c) => c.id === id);
  const [q, setQ] = useState("");
  const search = useMemo(() => buildSearch(col?.songs ?? []), [col]);
  if (!col) return status === "loading" ? <Skeleton /> : <p className="p-6 text-muted">Collection not found.</p>;
  const results = search(q);
  return (
    <>
      <div className="sticky top-0 z-10 bg-bg/95 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur">
        <Link href="/" className="mb-2 inline-flex items-center text-sm text-muted"><ChevronLeft size={18} />Library</Link>
        <h1 className="font-serif text-2xl font-bold">{col.title}</h1>
        <p className="mb-3 text-sm text-muted">{col.description}</p>
        <label className="flex items-center gap-2 rounded-2xl bg-card px-4 py-3 shadow-sm shadow-black/5">
          <Search size={18} className="text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search number, English title, or Swahili title" inputMode="search" className="w-full bg-transparent text-base outline-none" />
        </label>
      </div>
      <div className="space-y-2 px-4">
        {results.map((s) => <SongRow key={s.hymn_number} collectionId={col.id} song={s} />)}
        {!results.length && <p className="py-10 text-center text-muted">No songs match “{q}”. Try a number or part of a title.</p>}
      </div>
    </>
  );
}
