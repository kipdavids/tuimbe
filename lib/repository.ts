import { db } from "./db";
import type { Collection, Favorite } from "@/types";

/** Swap this for a Supabase implementation later; UI only talks to `repo`. */
export interface ContentRepository {
  getCollections(): Promise<Collection[]>;
  saveCollections(c: Collection[]): Promise<void>;
  getFavorites(): Promise<Favorite[]>;
  toggleFavorite(f: Favorite): Promise<boolean>;
}
const fk = (f: Favorite) => `${f.collection}:${f.song}`;

export const repo: ContentRepository = {
  async getCollections() { return (await db()).getAll("collections"); },
  async saveCollections(cols) {
    const d = await db(); const tx = d.transaction("collections", "readwrite");
    await tx.store.clear(); await Promise.all(cols.map((c) => tx.store.put(c))); await tx.done;
  },
  async getFavorites() { return (await (await db()).getAll("favorites")).map(({ collection, song }) => ({ collection, song })); },
  async toggleFavorite(f) {
    const d = await db(); const key = fk(f);
    if (await d.get("favorites", key)) { await d.delete("favorites", key); return false; }
    await d.put("favorites", { ...f, key }); return true;
  },
};
