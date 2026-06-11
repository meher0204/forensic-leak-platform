import { apiRequest } from "./client"

export function resetDemoData(): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>("/admin/reset", {
    method: "POST",
  })
}
