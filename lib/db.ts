import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Collection, Favorite } from "@/types";
interface Schema extends DBSchema {
  collections: { key: string; value: Collection };
  favorites: { key: string; value: Favorite & { key: string } };
}
let p: Promise<IDBPDatabase<Schema>> | null = null;
export const db = () => (p ??= openDB<Schema>("tuimbe", 1, {
  upgrade(d) { d.createObjectStore("collections", { keyPath: "id" }); d.createObjectStore("favorites", { keyPath: "key" }); },
}));
