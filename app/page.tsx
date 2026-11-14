"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { appConfig } from "@/config/app.config";
import { useLibrary } from "@/hooks/useLibrary";
import { CollectionCard } from "@/components/CollectionCard";
import { Skeleton } from "@/components/Skeleton";
import { Splash } from "@/components/Splash";
import { Logo } from "@/components/Logo";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>; 
};

export default function Home() {
  const { collections, status } = useLibrary();
  const [splash, setSplash] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (!sessionStorage.getItem("tuimbe:splash")) { sessionStorage.setItem("tuimbe:splash", "1"); setSplash(true); }
  }, []);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      event.preventDefault();
      if (!sessionStorage.getItem("tuimbe:install-prompt-seen")) {
        setInstallPrompt(promptEvent);
      }
    };

    const onAppInstalled = () => {
      sessionStorage.setItem("tuimbe:install-prompt-seen", "1");
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted" || choice.outcome === "dismissed") {
      sessionStorage.setItem("tuimbe:install-prompt-seen", "1");
    }
    setInstallPrompt(null);
  };

  const dismissInstall = () => {
    sessionStorage.setItem("tuimbe:install-prompt-seen", "1");
    setInstallPrompt(null);
  };

  return (
    <>
      <AnimatePresence>{splash && <Splash onDone={() => setSplash(false)} />}</AnimatePresence>
      <AnimatePresence>
        {installPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-4 sm:items-center"
          >
            <motion.div
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 16, opacity: 0, scale: 0.98 }}
              className="w-full max-w-md rounded-3xl border border-border bg-card p-5 shadow-2xl"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-accent">Install app</p>
              <h2 className="mt-2 text-2xl font-bold">Install Tuimbe</h2>
              <p className="mt-2 text-sm text-muted">Get fast offline access to your hymns and keep everything ready on your home screen.</p>
              <div className="mt-5 flex gap-3">
                <button onClick={handleInstall} className="flex-1 rounded-2xl bg-primary px-4 py-3 font-semibold text-white">Install</button>
                <button onClick={dismissInstall} className="rounded-2xl border border-border px-4 py-3 text-sm text-muted">Later</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="rounded-[2rem] border border-border bg-card/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Logo size={42} />
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-accent"># Tuimbe</p>
                <h1 className="font-serif text-2xl font-bold text-fg">{appConfig.appName}</h1>
              </div>
            </div>
            <Link href="/admin" className="rounded-full border border-border bg-slate-100 px-3 py-1.5 text-sm font-medium text-fg transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">Admin</Link>
          </div>

          <div className="mt-6">
            <h2 className="font-serif text-4xl font-bold tracking-tight text-fg">Sing. Worship. Together.</h2>
            <p className="mt-2 max-w-xl text-sm text-muted">A clean place for hymns, devotion, and shared worship moments.</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Link href="/admin" className="rounded-2xl border border-border bg-slate-50 p-3 transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900">
              <p className="text-xs uppercase tracking-[0.2em] text-accent">Admin</p>
              <p className="mt-2 font-medium text-fg">Manage hymns</p>
            </Link>
            <Link href="/" className="rounded-2xl border border-border bg-slate-50 p-3 transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900">
              <p className="text-xs uppercase tracking-[0.2em] text-accent">Library</p>
              <p className="mt-2 font-medium text-fg">Browse hymnals</p>
            </Link>
            <Link href="/favorites" className="rounded-2xl border border-border bg-slate-50 p-3 transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900">
              <p className="text-xs uppercase tracking-[0.2em] text-accent">Favorites</p>
              <p className="mt-2 font-medium text-fg">Saved songs</p>
            </Link>
          </div>
        </div>
      </header>

      <section className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-fg">Hymnals</h3>
          <span className="text-sm text-muted">{collections.length} collection{collections.length === 1 ? "" : "s"}</span>
        </div>

        {status === "loading" && <Skeleton />}
        {status === "error" && <p className="rounded-2xl border border-border bg-card p-6 text-center text-muted">Connect to the internet once to download your songs. After that, Tuimbe works offline.</p>}
        <div className="space-y-4">{collections.map((c, i) => <CollectionCard key={c.id} c={c} i={i} />)}</div>
      </section>
    </>
  );
}
