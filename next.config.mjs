import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  skipWaiting: true,
  clientsClaim: true,
  workboxOptions: {
    runtimeCaching: [
      { urlPattern: /\/data\/.*\.json$/, handler: "StaleWhileRevalidate", options: { cacheName: "tuimbe-data" } },
      {
        urlPattern: ({ sameOrigin, url }) => sameOrigin && !url.pathname.startsWith("/_next") && !url.pathname.startsWith("/api") && !url.pathname.includes(".") && !url.pathname.startsWith("/icons"),
        handler: "NetworkFirst",
        options: { cacheName: "tuimbe-shell" },
      },
    ],
  },
});

export default withPWA({ reactStrictMode: true });
