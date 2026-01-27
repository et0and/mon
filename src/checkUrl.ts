import { UrlConfig, MonitoringResult } from "./types";

export async function checkUrl(urlConfig: UrlConfig): Promise<MonitoringResult> {
  const startTime = Date.now();
  const responseTime = Date.now() - startTime;

  try {
    const response = await fetch(urlConfig.url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
        DNT: "1",
        "Sec-GPC": "1",
      },
      // 30 second timeout
      signal: AbortSignal.timeout(30000),
    });

    const success = response.status === urlConfig.expectedStatus;

    return {
      url: urlConfig.url,
      name: urlConfig.name,
      status: response.status,
      success,
      responseTime,
      error: success ? undefined : `Expected ${urlConfig.expectedStatus}, got ${response.status}`,
    };
  } catch (error) {
    return {
      url: urlConfig.url,
      name: urlConfig.name,
      status: 0,
      success: false,
      responseTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
