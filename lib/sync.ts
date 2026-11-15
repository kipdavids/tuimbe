import { repo } from "./repository";
import type { Collection } from "@/types";
import bundledCollection from "@/data/collections/kenyan-hymns.json";

const bundledCollectionData = bundledCollection as any;
const bundledCoverImage = "coverImage" in bundledCollectionData ? bundledCollectionData.coverImage : undefined;

const bundledCollections: Collection[] = [
  {
    id: bundledCollection.id,
    title: bundledCollection.title,
    description: bundledCollection.description ?? "",
    icon: bundledCollection.icon ?? "music",
    coverImage: bundledCoverImage,
    url: bundledCollection.url ?? `/library/${bundledCollection.id}`,
    unit: bundledCollection.unit,
    songs: bundledCollectionData.songs ?? bundledCollectionData.hymns ?? [],
  },
];

const normalizeCollections = (raw: any[]): Collection[] => raw.map((c) => ({
  id: c.id, title: c.title, description: c.description ?? "", icon: c.icon ?? "music",
  coverImage: c.coverImage, url: c.url ?? `/library/${c.id}`, unit: c.unit, songs: c.songs ?? c.hymns ?? [],
}));

async function loadRemoteCollections(): Promise<Collection[]> {
  const idx: { id: string; file: string }[] = await (await fetch("/data/index.json", { cache: "no-cache" })).json();
  const raw: any[] = [];

  for (let i = 0; i < idx.length; i += 3) {
    const batch = idx.slice(i, i + 3);
    const chunk = await Promise.all(
      batch.map(async (item) => {
        const res = await fetch(`/data/collections/${item.file}`, { cache: "force-cache" });
        return res.json();
      }),
    );
    raw.push(...chunk);
  }

  return normalizeCollections(raw);
}

export async function ensureOfflineBootstrap(): Promise<Collection[]> {
  const saved = await repo.getCollections();
  if (saved.length) return saved;

  await repo.saveCollections(bundledCollections);
  return bundledCollections;
}

/** Downloads every collection listed in /data/index.json into IndexedDB.
 * If local edits already exist, keep them intact instead of overwriting the store.
 */
export async function syncCollections(force = false): Promise<Collection[]> {
  const existing = await repo.getCollections();
  if (!force && existing.length) return existing;

  try {
    const cols = await loadRemoteCollections();
    await repo.saveCollections(cols);
    return cols;
  } catch {
    return ensureOfflineBootstrap();
  }
}

/** Pre-fetches the minimal set of page shells needed for responsive offline browsing. */
export async function warmRoutes(cols: Collection[]) {
  const urls = [
    "/",
    "/favorites",
    "/admin",
    "/hmnals",
    "/library/hymns",
    ...new Set(cols.flatMap((c) => {
      const base = c.url ?? `/library/${c.id}`;
      return [base, `/library/${c.id}`, `/hmnals`, "/library/hymns"]; 
    })),
  ];

  for (let i = 0; i < urls.length; i += 5) {
    await Promise.allSettled(
      urls.slice(i, i + 5).map((u) => fetch(u, { cache: "force-cache" }).catch(() => undefined)),
    );
  }

  localStorage.setItem("tuimbe:warmed", "1");
}
