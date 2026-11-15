"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { repo } from "@/lib/repository";
import { ensureOfflineBootstrap, syncCollections, warmRoutes } from "@/lib/sync";
import type { Collection } from "@/types";

type Status = "loading" | "ready" | "error";
const Ctx = createContext<{ collections: Collection[]; status: Status }>({ collections: [], status: "loading" });
export const useLibrary = () => useContext(Ctx);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  useEffect(() => {
    let live = true;
    (async () => {
      const local = await repo.getCollections();

      if (live && local.length) {
        setCollections(local);
        setStatus("ready");
        if (!localStorage.getItem("tuimbe:warmed") && live) {
          void warmRoutes(local);
        }
        return;
      }

      try {
        const fresh = local.length ? local : await ensureOfflineBootstrap();
        if (live) {
          setCollections(fresh);
          setStatus("ready");
        }

        if (!localStorage.getItem("tuimbe:warmed") && live) {
          void warmRoutes(fresh);
        }
      } catch {
        try {
          const fallback = await syncCollections();
          if (live) {
            setCollections(fallback);
            setStatus("ready");
          }
          if (!localStorage.getItem("tuimbe:warmed") && live) {
            void warmRoutes(fallback);
          }
        } catch {
          if (live && !local.length) {
            setStatus("error");
          }
        }
      }
    })();
    return () => { live = false; };
  }, []);
  return <Ctx.Provider value={{ collections, status }}>{children}</Ctx.Provider>;
}
