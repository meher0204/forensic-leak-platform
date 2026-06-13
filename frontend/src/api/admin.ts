import { apiRequest } from "./client"

export interface AdminOverview {
  total_users: number
  total_images: number
  total_recipients: number
  total_watermarked_copies: number
  total_investigations: number
  total_leaks_matched: number
}

export function getAdminOverview(): Promise<AdminOverview> {
  return apiRequest<AdminOverview>("/admin/overview")
}

export function resetDemoData(): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>("/admin/reset", {
    method: "POST",
  })
}
