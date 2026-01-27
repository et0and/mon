import { URLS } from "./urls";
import { Bindings } from "./types";
import { checkUrl } from "./checkUrl";
import { sendTelegramAlert } from "./sendAlert";
import { handleScheduled } from "./scheduler";
import { HttpStatus } from "./http";

function generateRequestId(): string {
  return crypto.randomUUID();
}

function jsonResponse(data: unknown, status: number = HttpStatus.Ok): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default {
  async fetch(request: Request, env: Bindings): Promise<Response> {
    const url = new URL(request.url);
    const requestId = generateRequestId();
    const timestamp = new Date().toISOString();

    console.log(`[${requestId}] ${request.method} ${url.pathname}`);

    if (url.pathname === "/check") {
      const results = await Promise.all(URLS.map((urlConfig) => checkUrl(urlConfig)));

      const hasFailures = results.some((r) => !r.success);

      console.log(`[${requestId}] /check - ${hasFailures ? "issues_detected" : "all_ok"}`);

      return jsonResponse({
        timestamp,
        status: hasFailures ? "issues_detected" : "all_ok",
        results,
      });
    }

    if (url.pathname === "/health") {
      console.log(`[${requestId}] /health - healthy`);
      return jsonResponse({ status: "healthy", timestamp }, HttpStatus.Ok);
    }

    if (url.pathname === "/test-alert") {
      const testMessage = ` *Test Alert*\n\nThis is a test message from mon on ${timestamp}`;
      const alertSent = await sendTelegramAlert(testMessage, env);

      console.log(`[${requestId}] /test-alert - sent: ${alertSent}`, HttpStatus.Created);

      return jsonResponse({
        message: "Test alert sent",
        success: alertSent,
        timestamp,
      });
    }

    if (url.pathname === "/") {
      console.log(`[${requestId}] / - monke time`);
      return Response.redirect(env.SURPRISE_URL, HttpStatus.FunnyMemeStatus);
    }

    console.log(`[${requestId}] ${url.pathname} - 404`);
    return new Response("Nope there's nothing there", {
      status: HttpStatus.NotFound,
    });
  },

  scheduled: async (env: Bindings, ctx: ExecutionContext): Promise<void> => {
    ctx.waitUntil(handleScheduled(env));
  },
};
