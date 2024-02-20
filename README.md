# Welcome to Remix + Vite!

📖 See the [Remix docs](https://remix.run/docs) and the [Remix Vite docs](https://remix.run/docs/en/main/future/vite) for details on supported features.

## Development

Run the Vite dev server:

```shellscript
npm run dev
```

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`

- `build/server`
- `build/client`

```sh
pnpm wrangler d1 info rcf-d1-prod
pnpm wrangler d1 info rcf-d1-preview

# dev
pnpm wrangler d1 execute rcf-d1-dev --local --command "select * from d1_migrations;"
pnpm wrangler d1 execute rcf-d1-dev --local --command "select * from users;"
pnpm wrangler d1 execute rcf-d1-dev --local --command "pragma table_list"
pnpm wrangler d1 execute rcf-d1-dev --local --command "pragma table_info(users)"
pnpm wrangler d1 execute rcf-d1-dev --local --command "pragma foreign_keys"

# prod
pnpm wrangler d1 execute rcf-d1-prod --command "select * from d1_migrations;"
pnpm wrangler d1 execute rcf-d1-prod --command "select * from users;"
pnpm wrangler d1 migrations list rcf-d1-prod --env prod

# preview
pnpm wrangler d1 execute rcf-d1-preview --command "select * from d1_migrations;"
pnpm wrangler d1 execute rcf-d1-preview --command "select * from users;"
pnpm wrangler d1 migrations list rcf-d1-preview --env preview
```

### Cloudflare

- https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/do-more-with-tunnels/trycloudflare/
