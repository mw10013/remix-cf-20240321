import { lemonSqueezySetup, listProducts } from "@lemonsqueezy/lemonsqueezy.js";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { hookEnv } from "~/lib/hooks.server";

export async function loader({ context }: LoaderFunctionArgs) {
  const {
    env: { LMSQUEEZY_API_KEY },
  } = hookEnv(context.env);
  lemonSqueezySetup({
    apiKey: LMSQUEEZY_API_KEY,
    onError(error) {
      console.log(error);
    },
  });
  const { statusCode, error, data } = await listProducts();

  return { statusCode, error, data };
}

export default function Route() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="container p-6">
      Lmsqueezy
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
