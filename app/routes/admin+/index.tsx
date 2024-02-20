import { listProducts } from "@lemonsqueezy/lemonsqueezy.js";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { hookEnv, hookLmsqueezy } from "~/lib/hooks.server";

export async function loader({ context }: LoaderFunctionArgs) {
  const { env } = hookEnv(context.env);
  hookLmsqueezy(env);
  const { statusCode, error, data } = await listProducts();

  return { statusCode, error, data };
}

export default function Route() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="container p-6">
      Lmsqueezy Products
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
