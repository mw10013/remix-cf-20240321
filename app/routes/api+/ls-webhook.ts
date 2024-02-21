import * as crypto from "node:crypto";
import { invariant } from "@epic-web/invariant";
import { Order, Subscription, Webhook } from "@lemonsqueezy/lemonsqueezy.js";
import { ActionFunctionArgs } from "@remix-run/cloudflare";
import { eq } from "drizzle-orm";
import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "~/lib/db/schema";
import { hookEnv } from "~/lib/hooks.server";

type Event = {
  meta: {
    event_name: string;
  };
};
type OrderEvent = Event & { data: Order["data"] };
type SubscriptionEvent = Event & { data: Subscription["data"] };

export async function action({ request, context }: ActionFunctionArgs) {
  const { env } = hookEnv(context.env);
  const db = drizzle(env.D1, { schema });

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

  const json = JSON.parse(textBody);
  // console.log("json:", json);

  const dataType = json?.data?.type;
  invariant(dataType, "Missing data.type");
  invariant(typeof dataType === "string", "data.type must be a string");
  if (dataType === "subscriptions") {
    await handleSubscriptionEvent({ event: json as SubscriptionEvent, db });
  } else {
    console.error(`Unknown data.type: ${json?.meta?.event_name}: ${dataType}`);
  }

  return new Response(null);
}

type T = Webhook["data"]["attributes"]["events"][number];

async function handleSubscriptionEvent({
  event,
  db,
}: {
  event: SubscriptionEvent;
  db: DrizzleD1Database<typeof schema>;
}) {
  console.log("handleSubscriptionEvent:", {
    eventName: event.meta.event_name,
    type: event.data.type,
  });
  const attributes = event.data.attributes;
  switch (event.meta.event_name) {
    case "subscription_created":
    case "subscription_updated":
      await db
        .insert(schema.subscriptions)
        .values({
          id: parseInt(event.data.id),
          storeId: attributes.store_id,
          customerId: attributes.customer_id,
          productId: attributes.product_id,
          variantId: attributes.variant_id,
          productName: attributes.product_name,
          variantName: attributes.variant_name,
          userName: attributes.user_name,
          userEmail: attributes.user_email,
          status: attributes.status,
          createdAt: new Date(attributes.created_at),
          updatedAt: new Date(attributes.updated_at),
        })
        .onConflictDoUpdate({
          target: schema.subscriptions.id,
          set: {
            customerId: attributes.customer_id,
            productId: attributes.product_id,
            variantId: attributes.variant_id,
            productName: attributes.product_name,
            variantName: attributes.variant_name,
            userName: attributes.user_name,
            userEmail: attributes.user_email,
            status: attributes.status,
            updatedAt: new Date(attributes.updated_at),
          },
        });
      await db
        .insert(schema.users)
        .values({
          email: attributes.user_email,
          name: attributes.user_name,
        })
        .onConflictDoUpdate({
          target: schema.users.email,
          set: {
            name: attributes.user_name,
          },
          where: eq(schema.users.email, attributes.user_email),
        });
      break;
  }
}

/*
export const subscriptions = sqliteTable("subscriptions", {
  id: integer("id").primaryKey(),
  storeId: integer("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  customerId: integer("customer_id").notNull(),
  productId: integer("product_id").notNull(),
  variantId: integer("variant_id").notNull(),
  productName: text("product_name").notNull(),
  variantName: text("variant_name").notNull(),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  status: text("status").notNull(),
});
*/
