"use client";
import { useFavorites } from "@/hooks/useFavorites";
import { useLibrary } from "@/hooks/useLibrary";
import { SongRow } from "@/components/SongRow";

export default function Favorites() {
  const { favorites } = useFavorites();
  const { collections } = useLibrary();
  const rows = favorites.flatMap((f) => {
    const song = collections.find((c) => c.id === f.collection)?.songs.find((s) => s.hymn_number === f.song);
    return song ? [{ cid: f.collection, song }] : [];
  });
  return (
    <div className="px-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <h1 className="mb-4 font-serif text-2xl font-bold">Favorites</h1>
      <div className="space-y-2">{rows.map((r) => <SongRow key={`${r.cid}:${r.song.hymn_number}`} collectionId={r.cid} song={r.song} />)}</div>
      {!rows.length && <p className="py-10 text-center text-muted">No favorites yet. Tap the star on any song to keep it here.</p>}
    </div>
  );
}
