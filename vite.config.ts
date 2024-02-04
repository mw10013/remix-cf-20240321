import {
  unstable_vitePlugin as remix,
  unstable_cloudflarePreset as cloudflare,
} from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  resolve: {
    alias: {
      buffer: 'node:buffer',
      crypto: 'node:crypto',
    }
  },
  plugins: [
    remix({
      presets: [cloudflare()],
    }),
    tsconfigPaths(),
  ],
  ssr: {
    resolve: {
      externalConditions: ["workerd", "worker"],
    },
  },
});
