import { type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
// import * as Buffer from "node:buffer";
import { setUpGlobals } from "~/.server/polyfill";

// @ts-expect-error - `thirty-two` is not typed.
import * as base32 from "thirty-two";
import * as crypto from "crypto";

export function generateSecret() {
  // return base32.encode("abacab").toString() as string;
  return base32.encode(crypto.randomBytes(10)).toString() as string;
}

export async function loader({ context }: LoaderFunctionArgs) {
  setUpGlobals();
  return { secret: generateSecret() };
}

export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
