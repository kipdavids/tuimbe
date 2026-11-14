"use client";
import { useCallback, useEffect, useState } from "react";
import { repo } from "@/lib/repository";
import type { Favorite } from "@/types";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  useEffect(() => { repo.getFavorites().then(setFavorites); }, []);
  const isFav = useCallback((c: string, s: number) => favorites.some((f) => f.collection === c && f.song === s), [favorites]);
  const toggle = async (c: string, s: number) => { await repo.toggleFavorite({ collection: c, song: s }); setFavorites(await repo.getFavorites()); };
  return { favorites, isFav, toggle };
}
