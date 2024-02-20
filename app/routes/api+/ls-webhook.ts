import { ActionFunctionArgs } from "@remix-run/cloudflare";

export async function action({ request }: ActionFunctionArgs) {
  console.log("lemonSqueezyWebHook: request: %o", request);
  return new Response(null);
}
