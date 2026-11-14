import type { Config } from "tailwindcss";
export default {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { colors: { bg: "var(--bg)", fg: "var(--fg)", card: "var(--card)", muted: "var(--muted)", primary: "var(--primary)", accent: "var(--accent)" },
    fontFamily: { serif: ["Georgia", "Cambria", "serif"] } } },
} satisfies Config;
