/// <reference types="@remix-run/cloudflare" />
/// <reference types="vite/client" />
import "@cloudflare/workers-types";
import type { Env } from "~/lib/hooks.server";

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    env: Env;
  }
}
