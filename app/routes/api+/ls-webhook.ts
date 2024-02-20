import * as crypto from "node:crypto";
import { ActionFunctionArgs } from "@remix-run/cloudflare";
import { hookEnv } from "~/lib/hooks.server";

export async function action({ request, context }: ActionFunctionArgs) {
  const { env } = hookEnv(context.env);
const hmac      = crypto.createHmac('sha256', env.LEMON_SQUEEZY_WEBHOOK_SECRET);
// const digest    = Buffer.from(hmac.update(request.rawBody).digest('hex'), 'utf8');
const digest    = Buffer.from(hmac.update(await request.text()).digest('hex'), 'utf8');
const signature = Buffer.from(request.headers.get('X-Signature') || '', 'utf8');

if (!crypto.timingSafeEqual(digest, signature)) {
    throw new Error('Invalid signature.');
}
  return new Response(null);
}
