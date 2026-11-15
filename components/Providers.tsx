"use client";
import { useEffect } from "react";
import { PrefsProvider } from "@/hooks/usePrefs";
import { LibraryProvider } from "@/hooks/useLibrary";

function PWAUpdateWatcher() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const checkForUpdate = () => {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.update().catch(() => undefined);
        }
      }).catch(() => undefined);
    };

    checkForUpdate();
    const interval = window.setInterval(checkForUpdate, 60000);

    const onControllerChange = () => {
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    return () => {
      window.clearInterval(interval);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrefsProvider>
      <LibraryProvider>
        <PWAUpdateWatcher />
        {children}
      </LibraryProvider>
    </PrefsProvider>
  );
}
