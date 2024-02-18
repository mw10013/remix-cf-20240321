import { invariant } from "@epic-web/invariant";
import { getStore, Product } from "@lemonsqueezy/lemonsqueezy.js";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Button } from "~/components/ui/button";
import * as schema from "~/lib/db/schema";
import { hookEnv, hookLmsqueezy } from "~/lib/hooks.server";

export async function loader({ context }: LoaderFunctionArgs) {
  const { env } = hookEnv(context.env);
  hookLmsqueezy(env);
  const db = drizzle(env.D1, { schema });
  const store = await db.query.stores.findFirst({
    where: eq(schema.stores.id, env.LEMON_SQUEEZY_STORE_ID),
    with: {
      products: true,
    },
  });

  const { error, data } = await getStore(env.LEMON_SQUEEZY_STORE_ID, {
    include: ["products", "subscriptions"],
  });
  if (error) throw error;

  return { store, data };
}

export async function action({ context }: ActionFunctionArgs) {
  const { env } = hookEnv(context.env);
  hookLmsqueezy(env);
  const db = drizzle(env.D1, { schema });
  const id = env.LEMON_SQUEEZY_STORE_ID;
  const { error, data } = await getStore(id, {
    include: ["products", "subscriptions"],
  });
  if (error) throw error;
  invariant(data, "Store not found");
  await db
    .insert(schema.stores)
    .values({ id, name: data.data.attributes.name })
    .onConflictDoUpdate({
      target: schema.stores.id,
      set: { name: data.data.attributes.name },
    });

  console.log("data: %o", data);
  console.log("data.included: %o", data.included);
  invariant(data.included, "Missing included data");
  for (const included of data.included) {
    if (included.type !== "products") continue;
    const productData = included as Product["data"];
    await db
      .insert(schema.products)
      .values({
        id: productData.id,
        storeId: id,
        name: productData.attributes.name,
        description: productData.attributes.description,
        status: productData.attributes.status,
        price: productData.attributes.price,
        priceFormatted: productData.attributes.price_formatted,
        buyNowUrl: productData.attributes.buy_now_url,
      })
      .onConflictDoUpdate({
        target: schema.products.id,
        set: {
          name: productData.attributes.name,
          description: productData.attributes.description,
          status: productData.attributes.status,
          price: productData.attributes.price,
          priceFormatted: productData.attributes.price_formatted,
          buyNowUrl: productData.attributes.buy_now_url,
        },
      });
  }

  return null;
}

export default function Route() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  return (
    <div className="container p-6">
      Lmsqueezy Store
      <Form method="post">
        <Button type="submit">Synchronize</Button>
      </Form>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <pre>{JSON.stringify(actionData, null, 2)}</pre>
    </div>
  );
}
