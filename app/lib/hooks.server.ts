import { Buffer } from "node:buffer";
import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";
// import {
//   createWorkersKVSessionStorage,
//   SessionStorage,
// } from "@remix-run/cloudflare";
// import { eq } from "drizzle-orm";
// import { drizzle } from "drizzle-orm/d1";
// import { Authenticator } from "remix-auth";
// import { TOTPStrategy } from "remix-auth-totp";
import { z } from "zod";
import { SessionUser, users } from "~/lib/db/schema";

// import { sendAuthEmail } from "~/lib/email.server";

export const envSchema = z.object({
  ENVIRONMENT: z.enum(["production", "preview", "development"]),
  LMSQUEEZY_API_KEY: z.string().min(1),
  //   SESSION_SECRET: z.string().min(1),
  //   TOTP_SECRET: z.string().min(1),
  //   RESEND_API_KEY: z.string().min(1),
  KV: z.record(z.unknown()).transform((obj) => obj as unknown as KVNamespace),
  D1: z.record(z.unknown()).transform((obj) => obj as unknown as D1Database),
});

export type Env = z.infer<typeof envSchema>;

export function hookEnv(env: unknown) {
  globalThis.Buffer = Buffer;

  function assertEnv(obj: unknown): asserts obj is Env {
    envSchema.parse(obj);
  }
  assertEnv(env);
  return { env };
}

export function hookLmsqueezy({ LMSQUEEZY_API_KEY }: Env) {
  lemonSqueezySetup({
    apiKey: LMSQUEEZY_API_KEY,
    onError(error) {
      console.log(error);
    },
  });
}

// export function hookAuth({
//   SESSION_SECRET,
//   ENVIRONMENT,
//   RESEND_API_KEY,
//   TOTP_SECRET,
//   KV,
//   D1,
// }: CloudflareEnv) {
//   const sessionStorage = createWorkersKVSessionStorage<
//     {
//       "auth:email": string;
//     },
//     { "auth:error": { message: string } }
//   >({
//     kv: KV,
//     cookie: {
//       name: "_auth",
//       path: "/",
//       sameSite: "lax",
//       httpOnly: true,
//       secrets: [SESSION_SECRET],
//       secure: ENVIRONMENT === "production",
//     },
//   });
//   const authenticator = new Authenticator<SessionUser>(
//     sessionStorage as SessionStorage,
//   );
//   authenticator.use(
//     new TOTPStrategy(
//       {
//         secret: TOTP_SECRET,
//         magicLinkPath: "/magic-link",
//         sendTOTP: async ({ email, code, magicLink }) => {
//           console.log("sendTOTP:", { email, code, magicLink });
//           await sendAuthEmail({
//             email,
//             code,
//             magicLink,
//             resendApiKey: RESEND_API_KEY,
//           });
//         },
//       },
//       async ({ email }) => {
//         console.log("totps verify callback: email:", email);
//         const db = drizzle(D1);
//         let [user] = await db
//           .select({ id: users.id, email: users.email })
//           .from(users)
//           .where(eq(users.email, email))
//           .limit(1);
//         if (!user) {
//           [user] = await db
//             .insert(users)
//             .values({ email })
//             .returning({ id: users.id, email: users.email });
//           if (!user) throw new Error("Unable to create user.");
//         }
//         return user;
//       },
//     ),
//   );
//   return {
//     authenticator,
//     getSession: sessionStorage.getSession,
//     commitSession: sessionStorage.commitSession,
//     destroySession: sessionStorage.destroySession,
//   };
// }
