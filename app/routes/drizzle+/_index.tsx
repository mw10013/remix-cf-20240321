import { faker } from "@faker-js/faker";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { drizzle } from "drizzle-orm/d1";
import { Button } from "~/components/ui/button";
import * as schema from "~/lib/db/schema";
import { hookEnv } from "~/lib/hooks.server";

export async function loader({ context }: LoaderFunctionArgs) {
  const { env } = hookEnv(context.env);
  const db = drizzle(env.D1, { schema });
  const users = await db.query.users.findMany();
  return { users };
}

export async function action({ context }: ActionFunctionArgs) {
  const { env } = hookEnv(context.env);
  const db = drizzle(env.D1, { schema });
  const result = await db.insert(schema.users).values(
    [...Array(5).keys()].map(() => ({
      email: faker.internet.email(),
    })),
  );
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
  return { result };
}

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
