import clsx, { type ClassValue } from "clsx";
import type { Collection } from "@/types";

export const cn = (...i: ClassValue[]) => clsx(i);

export const normalizeCollectionPath = (value: string | undefined, fallback: string) => {
  const raw = (value ?? "").trim();
  if (!raw) return fallback;

  if (/^https?:\/\//i.test(raw)) {
    try {
      return new URL(raw).pathname || fallback;
    } catch {
      return fallback;
    }
  }

  const withoutLeadingSlash = raw.replace(/^\/+/, "");
  if (!withoutLeadingSlash) return fallback;

  const compact = withoutLeadingSlash.replace(/^library\//, "");
  if (compact === "hymns" || compact === "hymnals") {
    return "/hmnals";
  }

  if (withoutLeadingSlash === "library" || withoutLeadingSlash.startsWith("library/")) {
    return `/${withoutLeadingSlash}`;
  }

  return `/${withoutLeadingSlash}`;
};

export const getCollectionRoute = (collection: Pick<Collection, "id" | "url">) =>
  normalizeCollectionPath(collection.url, `/library/${collection.id}`);

export const matchesCollectionRoute = (collection: Pick<Collection, "id" | "url">, route: string) => {
  const slug = route.replace(/^\/+|\/+$/g, "");
  const routeKey = slug.replace(/^library\//, "");
  const collectionPath = (collection.url ?? `/library/${collection.id}`).replace(/^\/+|\/+$/g, "");
  const collectionPathKey = collectionPath.replace(/^library\//, "");
  const fallbackPath = `/library/${collection.id}`.replace(/^\/+|\/+$/g, "");
  const fallbackKey = fallbackPath.replace(/^library\//, "");

  const legacyAliases = new Set([
    "hymnals",
    "hymns",
    "hmnals",
    "library/hymnals",
    "library/hymns",
    collection.id,
    collectionPath,
    collectionPathKey,
    fallbackPath,
    fallbackKey,
  ]);

  return (
    legacyAliases.has(slug) ||
    legacyAliases.has(routeKey) ||
    route === collection.url ||
    route === `/${collection.id}` ||
    route === `/library/${collection.id}` ||
    route === "/hmnals" ||
    route === "/library/hymns"
  );
};
