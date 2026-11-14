import withPWAInit from "@ducanh2912/next-pwa";

const isWindows = process.platform === "win32";
const disablePWA = isWindows && process.env.NEXT_DISABLE_PWA !== "0";

const withPWA = withPWAInit({
  dest: "public",
  register: !disablePWA,
  disable: disablePWA || process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: !disablePWA,
  aggressiveFrontEndNavCaching: !disablePWA,
  workboxOptions: disablePWA
    ? undefined
    : {
        runtimeCaching: [
          { urlPattern: /\/data\/.*\.json$/, handler: "StaleWhileRevalidate", options: { cacheName: "tuimbe-data" } },
          { urlPattern: /\/(library|hymn|favorites)(\/.*)?$/, handler: "StaleWhileRevalidate", options: { cacheName: "tuimbe-pages" } },
        ],
      },
});

export default withPWA({ reactStrictMode: true });
