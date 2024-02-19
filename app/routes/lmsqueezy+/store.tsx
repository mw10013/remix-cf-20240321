import { invariant } from "@epic-web/invariant";
import {
  getStore,
  listPrices,
  listProducts,
  listVariants,
  Product,
} from "@lemonsqueezy/lemonsqueezy.js";
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
  const storeId = env.LEMON_SQUEEZY_STORE_ID;
  const store = await db.query.stores.findFirst({
    where: eq(schema.stores.id, storeId),
    with: {
      products: true,
    },
  });

  const { error: storeError, data: storeData } = await getStore(storeId, {
    include: ["subscriptions"],
  });
  if (storeError) throw storeError;
  const { error: productsError, data: productsData } = await listProducts({
    filter: { storeId },
    include: ["variants"],
  });
  if (productsError) throw productsError;

  const { error: variantsError, data: variantData } = await listVariants({
    include: ["price-model"],
  });
  if (variantsError) throw variantsError;

  // const { error: pricesError, data: pricesData } = await listPrices({});
  // if (pricesError) throw pricesError;

  return { productsData, variantData, store, storeData };
}

export async function action({ context }: ActionFunctionArgs) {
  const { env } = hookEnv(context.env);
  hookLmsqueezy(env);
  const db = drizzle(env.D1, { schema });
  const storeId = env.LEMON_SQUEEZY_STORE_ID;
  const { error: storeError, data: storeData } = await getStore(storeId, {
    include: ["subscriptions"],
  });
  if (storeError) throw storeError;
  invariant(storeData, "Store not found");
  await db
    .insert(schema.stores)
    .values({ id: storeId, name: storeData.data.attributes.name })
    .onConflictDoUpdate({
      target: schema.stores.id,
      set: { name: storeData.data.attributes.name },
    });

  const { error: productsError, data: productsData } = await listProducts({
    filter: { storeId },
    include: ["variants"],
  });
  if (productsError) throw productsError;
  console.log("productsData: %o", productsData);

  // console.log("data: %o", data);
  // console.log("data.included: %o", data.included);
  // invariant(data.included, "Missing included data");
  // for (const included of data.included) {
  //   if (included.type !== "products") continue;
  //   const productData = included as Product["data"];
  //   await db
  //     .insert(schema.products)
  //     .values({
  //       id: productData.id,
  //       storeId: id,
  //       name: productData.attributes.name,
  //       description: productData.attributes.description,
  //       status: productData.attributes.status,
  //       price: productData.attributes.price,
  //       priceFormatted: productData.attributes.price_formatted,
  //       buyNowUrl: productData.attributes.buy_now_url,
  //     })
  //     .onConflictDoUpdate({
  //       target: schema.products.id,
  //       set: {
  //         name: productData.attributes.name,
  //         description: productData.attributes.description,
  //         status: productData.attributes.status,
  //         price: productData.attributes.price,
  //         priceFormatted: productData.attributes.price_formatted,
  //         buyNowUrl: productData.attributes.buy_now_url,
  //       },
  //     });
  // }

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
