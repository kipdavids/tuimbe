import { repo } from "./repository";
import type { Collection } from "@/types";

/** Downloads every collection listed in /data/index.json into IndexedDB. */
export async function syncCollections(): Promise<Collection[]> {
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

  const cols: Collection[] = raw.map((c) => ({
    id: c.id, title: c.title, description: c.description ?? "", icon: c.icon ?? "music",
    coverImage: c.coverImage, url: c.url ?? `/library/${c.id}`, unit: c.unit, songs: c.songs ?? c.hymns ?? [],
  }));

  await repo.saveCollections(cols);
  return cols;
}

/** Pre-fetches the minimal set of page shells needed for responsive offline browsing. */
export async function warmRoutes(cols: Collection[]) {
  const urls = ["/", "/favorites", ...cols.map((c) => `/library/${c.id}`)];

  for (let i = 0; i < urls.length; i += 5) {
    await Promise.allSettled(
      urls.slice(i, i + 5).map((u) => fetch(u, { cache: "force-cache" }).catch(() => undefined)),
    );
  }

  localStorage.setItem("tuimbe:warmed", "1");
}
