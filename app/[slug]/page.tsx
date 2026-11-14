"use client";
import { use, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Search } from "lucide-react";
import { useLibrary } from "@/hooks/useLibrary";
import { buildSearch } from "@/lib/search";
import { SongRow } from "@/components/SongRow";
import { Skeleton } from "@/components/Skeleton";
import { matchesCollectionRoute } from "@/lib/utils";

export default function CustomCollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { collections, status } = useLibrary();
  const collection = collections.find((c) => matchesCollectionRoute(c, slug));
  const [q, setQ] = useState("");
  const search = useMemo(() => buildSearch(collection?.songs ?? []), [collection]);

  if (!collection) {
    return status === "loading" ? <Skeleton /> : <p className="p-6 text-muted">Collection not found.</p>;
  }

  const results = search(q);

  return (
    <>
      <div className="sticky top-0 z-10 bg-bg/95 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur">
        <Link href="/" className="mb-2 inline-flex items-center text-sm text-muted"><ChevronLeft size={18} />Library</Link>
        <h1 className="font-serif text-2xl font-bold">{collection.title}</h1>
        <p className="mb-3 text-sm text-muted">{collection.description}</p>
        <label className="flex items-center gap-2 rounded-2xl bg-card px-4 py-3 shadow-sm shadow-black/5">
          <Search size={18} className="text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search number, English title, or Swahili title" inputMode="search" className="w-full bg-transparent text-base outline-none" />
        </label>
      </div>
      <div className="space-y-2 px-4">
        {results.map((s) => <SongRow key={s.hymn_number} collectionId={collection.id} song={s} />)}
        {!results.length && <p className="py-10 text-center text-muted">No songs match “{q}”. Try a number or part of a title.</p>}
      </div>
    </>
  );
}
