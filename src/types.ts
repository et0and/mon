import { HttpStatus } from "./http";

export interface MonitoringResult {
  url: string;
  name: string;
  status: HttpStatus;
  success: boolean;
  responseTime: number;
  error?: string;
}

export interface UrlConfig {
  name: string;
  url: string;
  expectedStatus: HttpStatus.Ok;
}

export interface ServiceState {
  name: string;
  url: string;
  isDown: boolean;
  lastFailureTime?: string;
  lastSuccessTime?: string;
}

export type Bindings = {
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  SURPRISE_URL: string;
  SERVICE_STATE: KVNamespace;
};
