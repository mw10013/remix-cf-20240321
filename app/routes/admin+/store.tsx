import { invariant } from "@epic-web/invariant";
import {
  getStore,
  listCustomers,
  listProducts,
  listSubscriptions,
  listVariants,
  Price,
  Product,
  Variant,
} from "@lemonsqueezy/lemonsqueezy.js";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
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
      subscriptions: true,
      products: {
        where: (products, { eq }) => eq(products.status, "published"),
        orderBy: (products, { asc }) => [asc(products.price)],
        with: {
          variants: {
            where: (variants, { eq }) => eq(variants.status, "published"),
            orderBy: (variants, { asc }) => [asc(variants.sort)],
            with: {
              prices: true,
            },
          },
        },
      },
    },
  });

  const { error: storeError, data: storeData } = await getStore(storeId, {
    include: ["products", "orders", "subscriptions"],
  });
  if (storeError) throw storeError;
  const { error: productsError, data: productsData } = await listProducts({
    filter: { storeId },
  });
  if (productsError) throw productsError;

  const { error: variantsError, data: variantData } = await listVariants({
    include: ["price-model"],
  });
  if (variantsError) throw variantsError;
  invariant(variantData, "No variants");

  const { error: subscriptionsError, data: subscriptionsData } =
    await listSubscriptions({
      filter: { storeId },
      include: ["customer"],
    });
  if (subscriptionsError) throw subscriptionsError;

  const { error: customersError, data: customersData } = await listCustomers({
    filter: { storeId },
    include: ["subscriptions", "orders"],
  });
  if (customersError) throw customersError;

  return {
    store,
    storeData,
    subscriptionsData,
    customersData,
    productsData,
    variantData,
  };
}

export async function action({ context }: ActionFunctionArgs) {
  const { env } = hookEnv(context.env);
  hookLmsqueezy(env);
  const db = drizzle(env.D1, { schema });
  await db.delete(schema.stores);
  const storeId = env.LEMON_SQUEEZY_STORE_ID;
  const { error: storeError, data: storeData } = await getStore(storeId, {
    include: ["products", "subscriptions"], // seems not to include subscriptions
  });
  if (storeError) throw storeError;
  invariant(storeData, "Missing store");
  await db
    .insert(schema.stores)
    .values({ id: storeId, name: storeData.data.attributes.name });
  invariant(storeData.included, "Missing included store data");
  const productMap = new Map<number, Product["data"]>();
  for (const included of storeData.included) {
    if (included.type !== "products") continue;
    const productData = included as Product["data"];
    const productId = parseInt(productData.id);
    await db.insert(schema.products).values({
      id: productId,
      storeId: storeId,
      name: productData.attributes.name,
      description: productData.attributes.description,
      status: productData.attributes.status,
      price:
        typeof productData.attributes.price === "string"
          ? parseInt(productData.attributes.price)
          : productData.attributes.price,
      priceFormatted: productData.attributes.price_formatted,
      buyNowUrl: productData.attributes.buy_now_url,
    });
    productMap.set(productId, productData);
  }

  const { error: variantListError, data: variantList } = await listVariants({
    include: ["price-model"],
  });
  if (variantListError) throw variantListError;
  invariant(variantList, "Missing variant list");
  const variantMap = new Map<number, Variant["data"]>();
  for (const variantData of variantList.data) {
    if (!productMap.has(variantData.attributes.product_id)) {
      console.log("Foreign variant: ", variantData);
      continue;
    }
    const variantId = parseInt(variantData.id);
    variantMap.set(variantId, variantData);
    await db.insert(schema.variants).values({
      id: variantId,
      productId: variantData.attributes.product_id,
      name: variantData.attributes.name,
      description: variantData.attributes.description ?? "",
      sort: variantData.attributes.sort,
      status: variantData.attributes.status,
    });
  }
  invariant(variantList.included, "Missing included variant data");
  for (const included of variantList.included) {
    if (included.type !== "prices") continue;
    const priceData = included as Price["data"];
    if (!variantMap.has(priceData.attributes.variant_id)) {
      console.log("Foreign price: ", priceData);
      continue;
    }
    const priceId = parseInt(priceData.id);
    invariant(
      priceData.attributes.renewal_interval_unit,
      "Missing renewal interval unit",
    );
    invariant(
      priceData.attributes.renewal_interval_quantity,
      "Missing renewal interval quantity",
    );
    await db.insert(schema.prices).values({
      id: priceId,
      variantId: priceData.attributes.variant_id,
      unitPrice:
        typeof priceData.attributes.unit_price === "string"
          ? parseInt(priceData.attributes.unit_price)
          : priceData.attributes.unit_price,
      renewalIntervalUnit: priceData.attributes.renewal_interval_unit,
      renewalIntervalQuantity: priceData.attributes.renewal_interval_quantity,
    });
  }

  const { error: subscriptionsError, data: subscriptionsData } =
    await listSubscriptions({
      filter: { storeId },
      include: ["customer"],
    });
  if (subscriptionsError) throw subscriptionsError;
  invariant(subscriptionsData, "Missing subscriptions data");
  invariant(
    subscriptionsData.meta.page.total <= subscriptionsData.meta.page.perPage,
    "Too many subscriptions pages.",
  );
  for (const subscriptionData of subscriptionsData.data) {
    const subscriptionId = parseInt(subscriptionData.id);
    await db.insert(schema.subscriptions).values({
      id: subscriptionId,
      storeId: storeId,
      customerId: subscriptionData.attributes.customer_id,
      productId: subscriptionData.attributes.product_id,
      variantId: subscriptionData.attributes.variant_id,
      productName: subscriptionData.attributes.product_name,
      variantName: subscriptionData.attributes.variant_name,
      userName: subscriptionData.attributes.user_name,
      userEmail: subscriptionData.attributes.user_email,
      status: subscriptionData.attributes.status,
    });
  }
  return null;
}

export default function Route() {
  const { store, subscriptionsData, customersData, ...data } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  return (
    <div className="container space-y-2 p-6">
      <Form method="post">
        <Button type="submit">Synchronize</Button>
      </Form>
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue="customers"
      >
        <AccordionItem value="store">
          <AccordionTrigger>Store</AccordionTrigger>
          <AccordionContent>
            <pre>{JSON.stringify(store, null, 2)}</pre>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="customers">
          <AccordionTrigger>Customers</AccordionTrigger>
          <AccordionContent>
            <pre>{JSON.stringify(customersData, null, 2)}</pre>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="subscriptions">
          <AccordionTrigger>Subscriptions</AccordionTrigger>
          <AccordionContent>
            <pre>{JSON.stringify(subscriptionsData, null, 2)}</pre>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="data">
          <AccordionTrigger>Data</AccordionTrigger>
          <AccordionContent>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <pre>{JSON.stringify(actionData, null, 2)}</pre>
    </div>
  );
}
