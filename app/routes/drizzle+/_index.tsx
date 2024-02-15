import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { hookEnv } from "~/lib/hooks.server";

export async function loader({ context }: LoaderFunctionArgs) {
    const { env } = hookEnv(context.env);

}
export default function Route() {
    return <div className="container p-6">Drizzle</div>;
}