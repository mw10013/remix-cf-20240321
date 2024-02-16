import { faker } from "@faker-js/faker";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { drizzle } from "drizzle-orm/d1";
import { Button } from "~/components/ui/button";
import * as schema from "~/lib/db/schema";
import { hookEnv } from "~/lib/hooks.server";

export async function loader({ context }: LoaderFunctionArgs) {
  const {
    env: { D1 },
  } = hookEnv(context.env);
  const db = drizzle(D1, { schema });

  const stmt = D1.prepare("select * from users");
  const all = await stmt.all();
  const raw = await stmt.raw();

  const batch = await D1.batch([
    // D1.prepare("PRAGMA table_list"),
    D1.prepare("PRAGMA table_info(users)"),
  ]);

  const query = await db.query.users.findMany();
  const select = await db.select().from(schema.users).all();
  console.log("select: %o", select);

  return { all, raw, batch, query, select };
}

export async function action({ context }: ActionFunctionArgs) {
  const { env } = hookEnv(context.env);
  const db = drizzle(env.D1, { schema });
  const result = await db.insert(schema.users).values(
    [...Array(5).keys()].map(() => ({
      email: faker.internet.email(),
    })),
  );
  return { result };
}

//   const result = await Promise.all(
//     [...Array(10).keys()].map(async () => {
//       const avatarUrl = faker.image.avatar();
//       const response = await fetch(avatarUrl);
//       const contentType = response.headers.get("content-type") ?? "";
//       const bytes = await response.arrayBuffer();
//       const user = await prisma.user.create({
//         data: {
//           email: faker.internet.email(),
//           username: faker.word.noun(),
//           roles: { connect: [{ name: "user" }] },
//           image: { create: { blob: Buffer.from(bytes), contentType } },
//         },
//         include: {
//           image: { select: { id: true } },
//           roles: {
//             select: {
//               name: true,
//             },
//           },
//         },
//       });
//       return user;
//     }),
//   );

export default function Route() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="container p-6">
      Drizzle
      <Form method="POST">
        <Button type="submit">Populate</Button>
      </Form>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <pre>{JSON.stringify(actionData, null, 2)}</pre>
    </div>
  );
}
