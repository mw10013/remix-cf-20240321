import { invariant } from "@epic-web/invariant";
import { getStore, listStores } from "@lemonsqueezy/lemonsqueezy.js";
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
  });

  // const { statusCode, error, data } = await listStores();
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
