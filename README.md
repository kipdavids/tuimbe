# Tuimbe

Offline-first church music library PWA. Next.js 15, TypeScript, App Router, Tailwind, Framer Motion, Fuse.js, IndexedDB.

## Run
```bash
npm install
npm run dev                  # service worker is disabled in dev
npm run build && npm start   # test install and offline here
```
`prebuild` runs `scripts/prebuild.mjs`: it indexes `public/data/collections/*.json` and renders PNG icons from `public/icons/icon.svg`.

## Add a collection
Drop a file in `public/data/collections/`, for example `children-songs.json`:
```json
{ "id": "children-songs", "title": "Children Songs", "description": "...", "icon": "baby", "unit": "Songs", "coverImage": "/images/kids.jpg", "songs": [ /* same shape as hymns */ ] }
```
Rebuild. No code changes. Icons available: `book-open`, `baby`, `music`, `mic` (extend the map in `components/CollectionCard.tsx`).

## Deploy
- **Vercel:** import the repo. The Next.js preset and default settings are correct.
- **Netlify:** import the repo, build command `npm run build`, with the Next.js runtime (auto-detected).

## Architecture
| Folder | Role |
|---|---|
| `config/` | Branding, theme colors, font sizes. Single source for the theme engine. |
| `types/` | Domain types. |
| `lib/repository.ts` | `ContentRepository` interface plus IndexedDB implementation. Replace with a Supabase implementation later; the UI only calls `repo`. |
| `lib/sync.ts` | First-run download to IndexedDB and route warming for offline pages. |
| `lib/search.ts` | Fuse.js search over number, English title, Swahili title. |
| `hooks/` | Library, preferences (localStorage), favorites (IndexedDB). |
| `components/`, `app/` | UI and routes: `/`, `/library/[id]`, `/hymn/[id]/[number]`, `/favorites`. |

Offline: content lives in IndexedDB. Page shells are cached by the service worker (`@ducanh2912/next-pwa`) and pre-fetched after the first sync. Open the app online once and let the first load finish before going offline.

## Future admin and Supabase
Branding comes from `config/app.config.ts`, content from `repo`. An admin portal can write to Supabase `collections`, `songs`, `themes` and `branding` tables, and a `SupabaseRepository` can implement `ContentRepository` without touching the UI.
