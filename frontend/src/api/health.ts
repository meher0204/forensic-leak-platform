import { apiRequest } from "./client"

export interface HealthStatus {
  status: string
}

export function checkHealth(): Promise<HealthStatus> {
  return apiRequest<HealthStatus>("/health")
}
