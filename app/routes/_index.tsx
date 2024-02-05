import { type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { setUpGlobals } from "~/.server/globals";
import { generateTOTP, verifyTOTP } from "@epic-web/totp";

// @ts-expect-error - `thirty-two` is not typed.
import * as base32 from "thirty-two";
// import * as crypto from "crypto";
import { TOTPStrategy } from "remix-auth-totp";

// export function generateSecret() {
//   return base32.encode(crypto.randomBytes(10)).toString() as string;
// }

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
    // secret: generateSecret(),
    // verifyTOTP: verifyTOTP({ otp: "otp", secret: "secret" }),
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
