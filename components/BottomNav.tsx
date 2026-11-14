"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Library, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const path = usePathname();
  const items = [{ href: "/", label: "Library", Icon: Library }, { href: "/favorites", label: "Favorites", Icon: Star }];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-black/5 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-white/10">
      <div className="mx-auto flex max-w-2xl">
        {items.map(({ href, label, Icon }) => {
          const on = href === "/" ? !path.startsWith("/favorites") : path.startsWith(href);
          return (
            <Link key={href} href={href} className={cn("flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium", on ? "text-primary dark:text-accent" : "text-muted")}>
              <Icon size={22} />{label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
