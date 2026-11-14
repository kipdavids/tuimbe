"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Baby, Music, Mic2, type LucideIcon } from "lucide-react";
import { repo } from "@/lib/repository";
import { syncCollections } from "@/lib/sync";
import type { Collection } from "@/types";

const ADMIN_KEY = "tuimbe:admin";
const ICONS: Record<string, LucideIcon> = { "book-open": BookOpen, baby: Baby, music: Music, mic: Mic2 };

const normalizeCollectionUrl = (value: string | undefined, fallback: string) => {
  const raw = (value ?? "").trim();
  if (!raw) return fallback;

  if (/^https?:\/\//i.test(raw)) {
    try {
      return new URL(raw).pathname || fallback;
    } catch {
      return fallback;
    }
  }

  return raw.startsWith("/") ? raw : `/${raw}`;
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Collection>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem(ADMIN_KEY) === "1";
    setAuthenticated(isLoggedIn);
    if (isLoggedIn) {
      void loadCollections();
    } else {
      setLoading(false);
    }
  }, []);

  const loadCollections = async () => {
    let next = await repo.getCollections();
    if (!next.length) next = await syncCollections();

    const hydrated = next.map((collection) => ({
      ...collection,
      url: collection.url ?? `/library/${collection.id}`,
    }));

    setCollections(hydrated);
    setDrafts(Object.fromEntries(hydrated.map((collection) => [collection.id, collection])));
    setLoading(false);
  };

  const updateDraft = (collectionId: string, patch: Partial<Collection>) => {
    setDrafts((current) => {
      const base = current[collectionId] ?? collections.find((collection) => collection.id === collectionId) ?? null;
      if (!base) return current;
      return { ...current, [collectionId]: { ...base, ...patch } };
    });
  };

  const saveCollection = async (collectionId: string) => {
    const draft = drafts[collectionId];
    if (!draft) return;

    const normalized: Collection = {
      ...draft,
      url: normalizeCollectionUrl(draft.url, `/library/${draft.id}`),
    };

    const next = collections.map((collection) => (collection.id === collectionId ? normalized : collection));
    setCollections(next);
    setDrafts((current) => ({ ...current, [collectionId]: normalized }));
    await repo.saveCollections(next);
  };

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    if (username === "admin" && password === "praise") {
      localStorage.setItem(ADMIN_KEY, "1");
      setAuthenticated(true);
      void loadCollections();
      return;
    }
    alert("Invalid username or password.");
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_KEY);
    setAuthenticated(false);
    setCollections([]);
    setDrafts({});
    setUsername("");
    setPassword("");
  };

  const filteredCollections = collections.filter((collection) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;

    const metadata = [
      collection.title,
      collection.description,
      collection.id,
      collection.url ?? "",
      collection.unit ?? "",
    ].join(" ").toLowerCase();

    const songMatch = collection.songs.some((song) => {
      const haystack = [
        String(song.hymn_number),
        song.category_english,
        song.category_swahili,
        song.english.title ?? "",
        song.swahili.title ?? "",
        song.english.chorus ?? "",
        song.swahili.chorus ?? "",
        ...song.english.verses.map((verse) => verse.text),
        ...song.swahili.verses.map((verse) => verse.text),
      ].join(" ").toLowerCase();

      return haystack.includes(q) || metadata.includes(q);
    });

    return songMatch || metadata.includes(q);
  });

  if (loading) {
    return <main className="p-6 text-muted">Loading admin…</main>;
  }

  if (!authenticated) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4 py-10">
        <div className="w-full rounded-[2rem] border border-border bg-card/85 p-6 shadow-[0_24px_70px_rgba(30,64,175,0.12)] backdrop-blur-sm">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.28em] text-accent">Admin</p>
            <h1 className="mt-3 font-serif text-3xl font-bold text-fg">Tuimbe</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <label className="block space-y-2 text-sm">
              <span className="text-muted">Username</span>
              <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-2xl border border-border bg-slate-50 px-3 py-3 outline-none transition focus:border-primary focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-800" placeholder="Username" />
            </label>

            <label className="block space-y-2 text-sm">
              <span className="text-muted">Password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl border border-border bg-slate-50 px-3 py-3 outline-none transition focus:border-primary focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-800" placeholder="Password" />
            </label>

            <button type="submit" className="w-full rounded-2xl bg-primary px-4 py-3 font-semibold text-white shadow-lg shadow-primary/25 transition hover:translate-y-[-1px]">Login</button>
            <Link href="/" className="block text-center text-sm text-muted transition hover:text-fg">Back to home</Link>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 py-6">
      <div className="rounded-[2rem] border border-border bg-card/85 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-accent">Tuimbe Admin</p>
            <h1 className="mt-2 font-serif text-3xl font-bold text-fg">Content management</h1>
          </div>

          <button onClick={handleLogout} className="rounded-full border border-border bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">Logout</button>
        </div>
      </div>

      <div className="rounded-[2rem] border border-border bg-card/80 p-4 shadow-sm backdrop-blur-sm">
        <label className="block text-sm">
          <span className="mb-2 block text-muted">Search collection</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 outline-none transition focus:border-primary dark:bg-slate-900"
            placeholder="Search title, hymn, description, or URL"
          />
        </label>
      </div>

      {filteredCollections.length === 0 ? (
        <div className="rounded-[2rem] border border-border bg-card p-6 text-center text-muted">No matching collections.</div>
      ) : (
        <div className="space-y-4">
          {filteredCollections.map((collection) => {
            const draft = drafts[collection.id] ?? collection;
            const Icon = ICONS[draft.icon] ?? Music;
            const href = draft.url ?? `/library/${draft.id}`;

            return (
              <div key={draft.id} className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
                <div className="relative flex h-32 items-end bg-gradient-to-br from-primary to-accent p-4" style={draft.coverImage ? { backgroundImage: `url(${draft.coverImage})`, backgroundSize: "cover" } : undefined}>
                  <span className="rounded-2xl bg-white/90 p-2.5 text-primary"><Icon size={24} /></span>
                </div>

                <div className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="font-serif text-xl font-semibold text-fg">{draft.title}</h2>
                      <p className="text-sm text-muted">{draft.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void saveCollection(draft.id)}
                      className="rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white shadow-lg shadow-primary/20 transition hover:translate-y-[-1px]"
                    >
                      Save
                    </button>
                  </div>

                  <p className="mt-2 text-sm font-medium text-primary dark:text-accent">
                    {draft.songs.length} {draft.unit ?? (draft.songs.length === 1 ? "Song" : "Songs")}
                  </p>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <label className="text-sm">
                      <span className="mb-1 block text-muted">Title</span>
                      <input
                        value={draft.title}
                        onChange={(e) => updateDraft(draft.id, { title: e.target.value })}
                        className="w-full rounded-xl border border-border bg-slate-50 px-3 py-2.5 outline-none dark:bg-slate-900"
                      />
                    </label>

                    <label className="text-sm">
                      <span className="mb-1 block text-muted">URL</span>
                      <input
                        value={draft.url ?? href}
                        onChange={(e) => updateDraft(draft.id, { url: e.target.value })}
                        className="w-full rounded-xl border border-border bg-slate-50 px-3 py-2.5 outline-none dark:bg-slate-900"
                      />
                    </label>

                    <label className="md:col-span-2 text-sm">
                      <span className="mb-1 block text-muted">Description</span>
                      <textarea
                        value={draft.description}
                        onChange={(e) => updateDraft(draft.id, { description: e.target.value })}
                        className="min-h-[90px] w-full rounded-xl border border-border bg-slate-50 px-3 py-2.5 outline-none dark:bg-slate-900"
                      />
                    </label>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
                    <Link href={href} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                      Open collection
                    </Link>
                    <span className="text-xs text-muted">{draft.id}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
