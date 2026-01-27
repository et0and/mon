import { Bindings } from "./types";
import { getServiceState, saveServiceState } from "./checkState";
import { checkUrl } from "./checkUrl";
import { formatRecoveryResults, formatResults } from "./resultFormat";
import { sendTelegramAlert } from "./sendAlert";
import { MonitoringResult, ServiceState } from "./types";
import { URLS } from "./urls";

export async function handleScheduled(env: Bindings): Promise<Response> {
  console.log("Running scheduled monitoring check...");

  const results = await Promise.all(
    URLS.map((urlConfig) => checkUrl(urlConfig)),
  );

  const previousStates = await Promise.all(
    results.map((result) => getServiceState(result.name, env)),
  );

  const recoveredServices: MonitoringResult[] = [];
  const newFailures: MonitoringResult[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const previousState = previousStates[i];
    const timestamp = new Date().toISOString();

    const newState: ServiceState = {
      name: result.name,
      url: result.url,
      isDown: !result.success,
      lastFailureTime: result.success
        ? previousState?.lastFailureTime
        : timestamp,
      lastSuccessTime: result.success
        ? timestamp
        : previousState?.lastSuccessTime,
    };

    if (previousState?.isDown && result.success) {
      recoveredServices.push(result);
      console.log(`Service recovered: ${result.name}`);
    }

    if ((!previousState?.isDown) && !result.success) {
      newFailures.push(result);
      console.log(`Service failed: ${result.name}`);
    }

    await saveServiceState(newState, env);
  }

  if (recoveredServices.length > 0) {
    const recoveryMessage = formatRecoveryResults(recoveredServices);
    const recoverySent = await sendTelegramAlert(recoveryMessage, env);

    if (!recoverySent) {
      console.error("Failed to send recovery notification via Telegram");
    }
  }

  const currentFailures = results.filter((r) => !r.success);
  if (currentFailures.length > 0) {
    const alertMessage = formatResults(results);
    const alertSent = await sendTelegramAlert(alertMessage, env);

    if (!alertSent) {
      console.error("Failed to send alert via Telegram");
    }

    return new Response(
      JSON.stringify({
        status: "alert_sent",
        failures: currentFailures.length,
        recoveries: recoveredServices.length,
        alertSent,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return new Response(
    JSON.stringify({
      status: "all_ok",
      checkedServices: results.length,
      recoveries: recoveredServices.length,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}