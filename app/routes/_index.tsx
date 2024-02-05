import { type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { setUpGlobals } from "~/.server/globals";
import { generateTOTP, verifyTOTP } from "@epic-web/totp";
import { TOTPStrategy } from "remix-auth-totp";

export async function loader({ context }: LoaderFunctionArgs) {
  setUpGlobals();
  const { otp, secret, algorithm } = generateTOTP({
    algorithm: "SHA512",
  });
  const result = verifyTOTP({ otp, secret, algorithm: "SHA512" });

  return {
    otp,
    secret,
    algorithm,
    result,
    strategy: new TOTPStrategy(
      { secret: "secret", sendTOTP: async () => console.log("sendTOTP") },
      async () => {
        id: "user-id-1";
      }
    ),
  };
}

export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
