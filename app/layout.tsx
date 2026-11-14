import type { Metadata, Viewport } from "next";
import "./globals.css";
import { appConfig } from "@/config/app.config";
import { Providers } from "@/components/Providers";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: appConfig.appName, description: appConfig.tagline,
  icons: { icon: "/icons/favicon.png", apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: appConfig.appName, statusBarStyle: "default" },
};
export const viewport: Viewport = { themeColor: appConfig.primaryColor, width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="min-h-dvh bg-bg text-fg antialiased">
            <main className="mx-auto min-h-dvh max-w-6xl px-4 pb-28 pt-4">{children}</main>
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
