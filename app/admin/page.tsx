"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BookOpen, Baby, Music, Mic2, type LucideIcon } from "lucide-react";
import { repo } from "@/lib/repository";
import { syncCollections } from "@/lib/sync";
import { normalizeCollectionPath } from "@/lib/utils";
import { syncPwa } from "@/components/Providers";
import type { Collection } from "@/types";

const ADMIN_KEY = "tuimbe:admin";
const ICONS: Record<string, LucideIcon> = { "book-open": BookOpen, baby: Baby, music: Music, mic: Mic2 };


export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Collection>>({});
  const [loading, setLoading] = useState(true);
  const [collectionSearch, setCollectionSearch] = useState("");
  const [songSearch, setSongSearch] = useState("");
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [expandedSongNumber, setExpandedSongNumber] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "hymns">("details");
  const [saveNotice, setSaveNotice] = useState<{ id: string; message: string } | null>(null);
  const saveTimerRef = useRef<number | null>(null);

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
    if (!next.length) next = await syncCollections(true);

    const hydrated = next.map((collection) => ({
      ...collection,
      url: collection.url ?? `/library/${collection.id}`,
    }));

    setCollections(hydrated);
    setDrafts(Object.fromEntries(hydrated.map((collection) => [collection.id, collection])));
    setSelectedCollectionId((current) => (current || hydrated[0]?.id || ""));
    setLoading(false);
  };

  const updateDraft = (collectionId: string, patch: Partial<Collection>) => {
    setDrafts((current) => {
      const base = current[collectionId] ?? collections.find((collection) => collection.id === collectionId) ?? null;
      if (!base) return current;
      return { ...current, [collectionId]: { ...base, ...patch } };
    });
  };

  const updateSong = (collectionId: string, hymnNumber: number, field: "englishTitle" | "swahiliTitle" | "englishVerse1" | "swahiliVerse1", value: string) => {
    setDrafts((current) => {
      const base = current[collectionId] ?? collections.find((collection) => collection.id === collectionId) ?? null;
      if (!base) return current;

      const songs = base.songs.map((song) => {
        if (song.hymn_number !== hymnNumber) return song;

        const next = { ...song };
        if (field === "englishTitle") next.english = { ...next.english, title: value };
        if (field === "swahiliTitle") next.swahili = { ...next.swahili, title: value };

        if (field === "englishVerse1") {
          const verses = [...(next.english.verses ?? [])];
          verses[0] = { ...(verses[0] ?? { number: 1 }), number: 1, text: value };
          next.english = { ...next.english, verses };
        }

        if (field === "swahiliVerse1") {
          const verses = [...(next.swahili.verses ?? [])];
          verses[0] = { ...(verses[0] ?? { number: 1 }), number: 1, text: value };
          next.swahili = { ...next.swahili, verses };
        }

        return next;
      });

      return { ...current, [collectionId]: { ...base, songs } };
    });
  };

  const saveCollection = async (collectionId: string) => {
    const draft = drafts[collectionId];
    if (!draft) return;

    const normalized: Collection = {
      ...draft,
      url: normalizeCollectionPath(draft.url, `/library/${draft.id}`),
    };

    const next = collections.map((collection) => (collection.id === collectionId ? normalized : collection));
    setCollections(next);
    setDrafts((current) => ({ ...current, [collectionId]: normalized }));
    await repo.saveCollections(next);

    setSaveNotice({ id: collectionId, message: "Saved successfully" });
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = window.setTimeout(() => {
      setSaveNotice((current) => (current && current.id === collectionId ? null : current));
    }, 1800);
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

  const selectedCollection = collections.find((collection) => collection.id === selectedCollectionId) ?? collections[0] ?? null;
  const selectedDraft = selectedCollection ? drafts[selectedCollection.id] ?? selectedCollection : null;

  const filteredCollections = collections.filter((collection) => {
    const q = collectionSearch.trim().toLowerCase();
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

  const filteredSongs = (selectedDraft?.songs ?? []).filter((song) => {
    const q = songSearch.trim().toLowerCase();
    if (!q) return true;

    const haystack = [
      String(song.hymn_number),
      song.category_english,
      song.category_swahili,
      song.english.title ?? "",
      song.swahili.title ?? "",
      ...song.english.verses.map((verse) => verse.text),
      ...song.swahili.verses.map((verse) => verse.text),
    ].join(" ").toLowerCase();

    return haystack.includes(q);
  });

  const totalSongs = collections.reduce((sum, collection) => sum + collection.songs.length, 0);

  useEffect(() => {
    if (!selectedDraft) return;
    if (!expandedSongNumber || !selectedDraft.songs.some((song) => song.hymn_number === expandedSongNumber)) {
      setExpandedSongNumber(selectedDraft.songs[0]?.hymn_number ?? null);
    }
  }, [selectedDraft, expandedSongNumber]);

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
    <main className="mx-auto max-w-[1600px] py-6">
      <div className="flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden rounded-[2rem] border border-border bg-card/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm xl:flex-row">
        <aside className="w-full border-b border-border bg-slate-50/80 p-4 dark:bg-slate-950/70 xl:w-[25%] xl:min-w-[300px] xl:border-b-0 xl:border-r">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.26em] text-accent">Tuimbe</p>
              <h1 className="mt-1 font-serif text-2xl font-bold text-fg">Admin</h1>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => void syncPwa()} className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">Sync now</button>
              <button onClick={handleLogout} className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">Logout</button>
            </div>
          </div>

          <label className="mb-4 block text-sm">
            <span className="mb-2 block text-muted">Search collections</span>
            <input
              value={collectionSearch}
              onChange={(e) => setCollectionSearch(e.target.value)}
              className="w-full rounded-2xl border border-border bg-white px-3 py-2.5 outline-none transition focus:border-primary dark:bg-slate-900"
              placeholder="Search library"
            />
          </label>

          <div className="space-y-2">
            {filteredCollections.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-white/60 p-4 text-sm text-muted dark:bg-slate-900/60">No matching collections.</div>
            ) : (
              filteredCollections.map((collection) => {
                const draft = drafts[collection.id] ?? collection;
                const selected = selectedCollection?.id === draft.id;
                const Icon = ICONS[draft.icon] ?? Music;

                return (
                  <button
                    key={draft.id}
                    type="button"
                    onClick={() => {
                      setSelectedCollectionId(draft.id);
                      setActiveTab("hymns");
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${selected ? "border-primary bg-primary/5 shadow-sm" : "border-transparent bg-white/70 hover:border-border hover:bg-white dark:bg-slate-900/70 dark:hover:bg-slate-900"}`}
                  >
                    <span className="rounded-xl bg-gradient-to-br from-primary to-accent p-2 text-white">
                      <Icon size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-fg">{draft.title}</span>
                      <span className="block truncate text-xs text-muted">{draft.url ?? `/library/${draft.id}`}</span>
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {selectedDraft && (
            <div className="mt-6 rounded-[1.5rem] border border-border bg-white/70 p-4 dark:bg-slate-900/70">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">Library details</h2>
                <button type="button" onClick={() => setActiveTab("details")} className="text-xs font-medium text-primary">Edit</button>
              </div>

              <div className="space-y-3">
                <label className="block text-xs text-muted">
                  Title
                  <input
                    value={selectedDraft.title}
                    onChange={(e) => updateDraft(selectedDraft.id, { title: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-slate-50 px-2.5 py-2 outline-none dark:bg-slate-950"
                  />
                </label>

                <label className="block text-xs text-muted">
                  URL
                  <input
                    value={selectedDraft.url ?? `/library/${selectedDraft.id}`}
                    onChange={(e) => updateDraft(selectedDraft.id, { url: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-slate-50 px-2.5 py-2 outline-none dark:bg-slate-950"
                  />
                </label>

                <label className="block text-xs text-muted">
                  Description
                  <textarea
                    value={selectedDraft.description}
                    onChange={(e) => updateDraft(selectedDraft.id, { description: e.target.value })}
                    className="mt-1 min-h-[90px] w-full rounded-xl border border-border bg-slate-50 px-2.5 py-2 outline-none dark:bg-slate-950"
                  />
                </label>
              </div>
            </div>
          )}
        </aside>

        <section className="w-full min-w-0 p-4 sm:p-6 xl:w-[75%]">
          {selectedDraft ? (
            <>
              <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-[1.5rem] border border-border bg-gradient-to-br from-primary/10 to-transparent p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-accent">Collections</p>
                  <div className="mt-3 flex items-end justify-between">
                    <span className="font-serif text-3xl font-bold text-fg">{collections.length}</span>
                    <BookOpen className="text-primary" size={20} />
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-border bg-gradient-to-br from-emerald-500/10 to-transparent p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-accent">Hymns</p>
                  <div className="mt-3 flex items-end justify-between">
                    <span className="font-serif text-3xl font-bold text-fg">{totalSongs}</span>
                    <Music className="text-emerald-600" size={20} />
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-border bg-gradient-to-br from-violet-500/10 to-transparent p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-accent">URL</p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <span className="truncate text-sm font-medium text-fg">{selectedDraft.url ?? `/library/${selectedDraft.id}`}</span>
                    <Mic2 className="shrink-0 text-violet-600" size={20} />
                  </div>
                </div>
              </div>

              <div className="mb-5 flex flex-col gap-3 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.26em] text-accent">Selected collection</p>
                  <h2 className="mt-1 font-serif text-3xl font-bold text-fg">{selectedDraft.title}</h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("details")}
                    className={`rounded-full px-3 py-2 text-sm font-medium transition ${activeTab === "details" ? "bg-primary text-white" : "border border-border bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}
                  >
                    Library details
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("hymns")}
                    className={`rounded-full px-3 py-2 text-sm font-medium transition ${activeTab === "hymns" ? "bg-primary text-white" : "border border-border bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}
                  >
                    Hymns
                  </button>
                  <button
                    type="button"
                    onClick={() => void saveCollection(selectedDraft.id)}
                    className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:translate-y-[-1px]"
                  >
                    Save
                  </button>
                </div>
              </div>

              {saveNotice && saveNotice.id === selectedDraft.id && (
                <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {saveNotice.message}
                </div>
              )}

              {activeTab === "details" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm md:col-span-1">
                    <span className="mb-2 block text-muted">Title</span>
                    <input
                      value={selectedDraft.title}
                      onChange={(e) => updateDraft(selectedDraft.id, { title: e.target.value })}
                      className="w-full rounded-2xl border border-border bg-slate-50 px-3 py-3 outline-none transition focus:border-primary dark:bg-slate-900"
                    />
                  </label>

                  <label className="text-sm md:col-span-1">
                    <span className="mb-2 block text-muted">URL</span>
                    <input
                      value={selectedDraft.url ?? `/library/${selectedDraft.id}`}
                      onChange={(e) => updateDraft(selectedDraft.id, { url: e.target.value })}
                      className="w-full rounded-2xl border border-border bg-slate-50 px-3 py-3 outline-none transition focus:border-primary dark:bg-slate-900"
                    />
                  </label>

                  <label className="text-sm md:col-span-2">
                    <span className="mb-2 block text-muted">Description</span>
                    <textarea
                      value={selectedDraft.description}
                      onChange={(e) => updateDraft(selectedDraft.id, { description: e.target.value })}
                      className="min-h-[120px] w-full rounded-2xl border border-border bg-slate-50 px-3 py-3 outline-none transition focus:border-primary dark:bg-slate-900"
                    />
                  </label>

                  <div className="flex items-center justify-between rounded-2xl border border-border bg-slate-50 px-4 py-3 text-sm text-muted dark:bg-slate-900 md:col-span-2">
                    <span>{selectedDraft.songs.length} songs</span>
                    <Link href={selectedDraft.url ?? `/library/${selectedDraft.id}`} className="font-medium text-primary underline-offset-4 hover:underline">
                      Open collection
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="block text-sm">
                    <span className="mb-2 block text-muted">Search hymns</span>
                    <input
                      value={songSearch}
                      onChange={(e) => setSongSearch(e.target.value)}
                      className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 outline-none transition focus:border-primary dark:bg-slate-900"
                      placeholder="Search hymn number or title"
                    />
                  </label>

                  <div className="space-y-3">
                    {filteredSongs.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border bg-slate-50 p-5 text-center text-muted dark:bg-slate-900">No hymns match this search.</div>
                    ) : (
                      filteredSongs.map((song) => {
                        const expanded = expandedSongNumber === song.hymn_number;

                        return (
                          <div key={`${selectedDraft.id}-${song.hymn_number}`} className="rounded-[1.5rem] border border-border bg-slate-50 p-4 dark:bg-slate-900/60">
                            <button
                              type="button"
                              onClick={() => setExpandedSongNumber(expanded ? null : song.hymn_number)}
                              className="flex w-full items-center justify-between gap-3 text-left"
                            >
                              <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-accent">Hymn #{song.hymn_number}</p>
                                <p className="mt-1 font-medium text-fg">{song.english.title ?? "Untitled hymn"}</p>
                              </div>
                              <span className="rounded-full border border-border bg-white px-2.5 py-1 text-xs text-muted dark:bg-slate-950">{expanded ? "Hide" : "Open"}</span>
                            </button>

                            {expanded && (
                              <div className="mt-4 grid gap-3 md:grid-cols-2">
                                <label className="text-xs text-muted">
                                  English title
                                  <input
                                    value={song.english.title ?? ""}
                                    onChange={(e) => updateSong(selectedDraft.id, song.hymn_number, "englishTitle", e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-border bg-white px-2.5 py-2.5 outline-none dark:bg-slate-950"
                                  />
                                </label>

                                <label className="text-xs text-muted">
                                  Swahili title
                                  <input
                                    value={song.swahili.title ?? ""}
                                    onChange={(e) => updateSong(selectedDraft.id, song.hymn_number, "swahiliTitle", e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-border bg-white px-2.5 py-2.5 outline-none dark:bg-slate-950"
                                  />
                                </label>

                                <label className="text-xs text-muted md:col-span-2">
                                  English verse 1
                                  <textarea
                                    value={song.english.verses[0]?.text ?? ""}
                                    onChange={(e) => updateSong(selectedDraft.id, song.hymn_number, "englishVerse1", e.target.value)}
                                    className="mt-1 min-h-[80px] w-full rounded-xl border border-border bg-white px-2.5 py-2.5 outline-none dark:bg-slate-950"
                                  />
                                </label>

                                <label className="text-xs text-muted md:col-span-2">
                                  Swahili verse 1
                                  <textarea
                                    value={song.swahili.verses[0]?.text ?? ""}
                                    onChange={(e) => updateSong(selectedDraft.id, song.hymn_number, "swahiliVerse1", e.target.value)}
                                    className="mt-1 min-h-[80px] w-full rounded-xl border border-border bg-white px-2.5 py-2.5 outline-none dark:bg-slate-950"
                                  />
                                </label>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center rounded-[2rem] border border-dashed border-border p-10 text-muted">
              Select a collection to begin editing.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
