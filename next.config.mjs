import withPWAInit from "@ducanh2912/next-pwa";
const withPWA = withPWAInit({
  dest: "public", register: true, disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true, aggressiveFrontEndNavCaching: true,
  workboxOptions: {
    runtimeCaching: [
      { urlPattern: /\/data\/.*\.json$/, handler: "StaleWhileRevalidate", options: { cacheName: "tuimbe-data" } },
      { urlPattern: /\/(library|hymn|favorites)(\/.*)?$/, handler: "StaleWhileRevalidate", options: { cacheName: "tuimbe-pages" } },
    ],
  },
});
export default withPWA({ reactStrictMode: true });
