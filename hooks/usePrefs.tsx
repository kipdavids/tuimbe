"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { appConfig, DEFAULT_PREFS } from "@/config/app.config";
import type { Prefs } from "@/types";

const KEY = "tuimbe:prefs";
const Ctx = createContext<{ prefs: Prefs; update: (p: Partial<Prefs>) => void }>({ prefs: { ...DEFAULT_PREFS }, update: () => {} });
export const usePrefs = () => useContext(Ctx);

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>({ ...DEFAULT_PREFS });
  useEffect(() => {
    try { const s = localStorage.getItem(KEY); if (s) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(s) }); } catch {}
  }, []);
  useEffect(() => {
    const r = document.documentElement;
    r.classList.toggle("dark", prefs.theme === "dark");
    r.style.setProperty("--primary", appConfig.primaryColor);
    r.style.setProperty("--accent", appConfig.accentColor);
  }, [prefs.theme]);
  const update = (p: Partial<Prefs>) => setPrefs((c) => { const n = { ...c, ...p }; try { localStorage.setItem(KEY, JSON.stringify(n)); } catch {} return n; });
  return <Ctx.Provider value={{ prefs, update }}>{children}</Ctx.Provider>;
}
