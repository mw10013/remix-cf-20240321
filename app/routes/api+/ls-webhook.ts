import * as crypto from "node:crypto";
import { invariant } from "@epic-web/invariant";
import { Order, Subscription, Webhook } from "@lemonsqueezy/lemonsqueezy.js";
import { ActionFunctionArgs } from "@remix-run/cloudflare";
import { hookEnv } from "~/lib/hooks.server";

type T = Webhook["data"]["attributes"]["events"][number];

type Event = {
  meta: {
    event_name: string;
  };
};
type OrderEvent = Event & { data: Order["data"] };
type SubscriptionEvent = Event & { data: Subscription["data"] };

export async function action({ request, context }: ActionFunctionArgs) {
  const { env } = hookEnv(context.env);
  const textBody = await request.text();
  const hmac = crypto.createHmac("sha256", env.LEMON_SQUEEZY_WEBHOOK_SECRET);
  const digest = Buffer.from(hmac.update(textBody).digest("hex"), "utf8");
  const signature = Buffer.from(
    request.headers.get("X-Signature") || "",
    "utf8",
  );

  if (!crypto.timingSafeEqual(digest, signature)) {
    throw new Error("Invalid signature.");
  }

  // const eventName = request.headers.get("X-Event-Name");
  // invariant(eventName, "Missing event_name");

  const json = JSON.parse(textBody);
  // console.log("json:", json);

  const dataType = json?.data?.type;
  invariant(dataType, "Missing data.type");
  invariant(typeof dataType === "string", "data.type must be a string");
  if (dataType === "subscriptions") {
    await handleSubscriptionEvent(json as SubscriptionEvent);
  } else {
    console.error(`Unknown data.type: ${json?.meta?.event_name}: ${dataType}`);
  }

  return new Response(null);
}

async function handleSubscriptionEvent(event: SubscriptionEvent) {
  console.log("handleSubscriptionEvent:", {
    eventName: event.meta.event_name,
    type: event.data.type,
  });
}
