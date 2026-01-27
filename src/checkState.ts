import { Bindings, ServiceState } from "./types";

export async function getServiceState(
  serviceName: string,
  env: Bindings,
): Promise<ServiceState | null> {
  try {
    const stateJson = await env.SERVICE_STATE.get(`service:${serviceName}`);
    return stateJson ? JSON.parse(stateJson) : null;
  } catch (error) {
    console.error(`Failed to get state for ${serviceName}:`, error);
    return null;
  }
}

export async function saveServiceState(state: ServiceState, env: Bindings): Promise<void> {
  try {
    await env.SERVICE_STATE.put(`service:${state.name}`, JSON.stringify(state));
  } catch (error) {
    console.error(`Failed to save state for ${state.name}:`, error);
  }
}
