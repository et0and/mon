Mon is a simple URL monitoring service built with plain Typescript and Cloudflare Workers. It checks configured endpoints and sends Telegram alerts when URLs become unreachable. The Worker is set to ping the configured URLs every 30 minutes via a cron schedule, but this can be adjusted to as short or long as you like in the `wrangler.jsonc` or via the Cloudflare dashboard.

The service state is tracked via Cloudflare's KV store to detect when services recover.

This isn't a very sophisticated monitoring system, but based on a simple script I wrote several months ago when I needed to put together a hack monitoring service for something I was building at work (spoiler: it was AWS rugpulling me lol).

There are similar serverless approaches people have taken, such as [this one on Val.town](https://www.val.town/x/panphora/cronSiteMonitor) running on Deno.

## Development

```txt
bun install
bun run dev
```

## Deployment

You will need [Wrangler](https://developers.cloudflare.com/workers/wrangler/) configured on your system.

```txt
bun run deploy
```

## Type generation

Generate types based on Worker configuration:

```txt
bun run cf-typegen
```

Pass the `CloudflareBindings` generic when instantiating Hono:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>();
```
