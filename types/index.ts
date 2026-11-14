export interface Verse { number: number; text: string }
export interface LangBlock { title: string | null; verses: Verse[]; chorus: string | null; note?: string }
export interface Song {
  hymn_number: number; category_english: string; category_swahili: string;
  english: LangBlock; swahili: LangBlock;
}
export interface Collection {
  id: string; title: string; description: string; icon: string; coverImage?: string; url?: string; unit?: string; songs: Song[];
}
export type Language = "english" | "swahili";
export interface Prefs { theme: "light" | "dark"; fontSize: number; language: Language }
export interface Favorite { collection: string; song: number }
