import { Hono } from "hono";
import { URLS } from "./urls";
import { Bindings } from "./types";
import { checkUrl } from "./checkUrl";
import { sendTelegramAlert } from "./sendAlert";
import { requestId } from "hono/request-id";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { handleScheduled } from "./scheduler";

const app = new Hono<{ Bindings: Bindings }>();

app.use(requestId(), logger(), prettyJSON());

app.get("/check", async (c) => {
  const results = await Promise.all(
    URLS.map((urlConfig) => checkUrl(urlConfig)),
  );

  const hasFailures = results.some((r) => !r.success);

  return c.json({
    timestamp: new Date().toISOString(),
    status: hasFailures ? "issues_detected" : "all_ok",
    results,
  });
});

app.get("/health", (c) => {
  return c.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.notFound((c) => {
  return c.text("Nope g there's nothing there", 404);
});

app.get("/test-alert", async (c) => {
  const testMessage = ` *Test Alert*\n\nThis is a test message from mon on ${new Date().toISOString()}`;
  const alertSent = await sendTelegramAlert(testMessage, c.env);

  return c.json({
    message: "Test alert sent",
    success: alertSent,
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (c) => {
  return c.redirect(
    "https://image.tmdb.org/t/p/original/oL0k5JA53PyoHSZqKb3cNkhwBCE.jpg",
  );
});

export default {
  fetch: app.fetch,
  scheduled: async (
    env: Bindings,
    ctx: ExecutionContext,
  ): Promise<void> => {
    ctx.waitUntil(handleScheduled(env));
  },
};
