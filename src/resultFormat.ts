import { MonitoringResult } from "./types";

export function formatResults(results: MonitoringResult[]): string {
  const timestamp = new Date().toISOString();
  const failures = results.filter((r) => !r.success);

  if (failures.length === 0) {
    return (
      ` *Mon*\n\n` +
      `All services are operational at ${timestamp}\n\n` +
      results.map((r) => `• ${r.name}: ${r.status} (${r.responseTime}ms)`).join("\n")
    );
  }

  return (
    ` *Mon alert*\n\n` +
    `${failures.length} service(s) experiencing issues at ${timestamp}\n\n` +
    `*Failed Services:*\n` +
    failures.map((r) => `• ${r.name}: ${r.error} (${r.responseTime}ms)`).join("\n") +
    "\n\n*All Services:*\n" +
    results
      .map((r) => `${r.success ? "✅" : "❌"} ${r.name}: ${r.status} (${r.responseTime}ms)`)
      .join("\n")
  );
}

export function formatRecoveryResults(recoveredServices: MonitoringResult[]): string {
  const timestamp = new Date().toISOString();

  return (
    ` *Mon services recovery*\n\n` +
    `${recoveredServices.length} service(s) have recovered at ${timestamp}\n\n` +
    `*Recovered Services:*\n` +
    recoveredServices.map((r) => `• ${r.name}: ${r.status} (${r.responseTime}ms)`).join("\n")
  );
}
