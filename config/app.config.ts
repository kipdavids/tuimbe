// Single source of branding. A future admin portal or Supabase `themes` table can replace this object.
export const appConfig = {
  appName: "Tuimbe",
  tagline: "Sing. Worship. Together.",
  primaryColor: "#1E40AF",
  accentColor: "#F59E0B",
};
export const FONT_SIZES = [14, 16, 18, 20, 22, 24, 28] as const;
export const DEFAULT_PREFS = { theme: "light", fontSize: 18, language: "english" } as const;
