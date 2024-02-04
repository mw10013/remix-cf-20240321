import {
  unstable_vitePlugin as remix,
  unstable_cloudflarePreset as cloudflare,
} from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  resolve: {
    alias: {
      // crypto: "crypto-browserify",
      crypto: "node:crypto",
    },
  },
  plugins: [
    remix({
      presets: [cloudflare()],
    }),
    tsconfigPaths(),
  ],
  ssr: {
    noExternal: ["@epic-web/totp"],
    resolve: {
      externalConditions: ["workerd", "worker"],
    },
  },
});
