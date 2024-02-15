/// <reference types="@remix-run/cloudflare" />
/// <reference types="vite/client" />

import '@cloudflare/workers-types';

interface Env {
	ENVIRONMENT?: 'development';
	KV: KVNamespace<string>;
  D1: D1Database;
}

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    env: Env;
  }
}
