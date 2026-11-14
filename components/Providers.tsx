"use client";
import { PrefsProvider } from "@/hooks/usePrefs";
import { LibraryProvider } from "@/hooks/useLibrary";
export function Providers({ children }: { children: React.ReactNode }) {
  return <PrefsProvider><LibraryProvider>{children}</LibraryProvider></PrefsProvider>;
}
