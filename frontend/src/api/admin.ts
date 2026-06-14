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

export interface AdminUser {
  id: number
  username: string
  email: string
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export function getAdminUsers(): Promise<AdminUser[]> {
  return apiRequest<AdminUser[]>("/admin/users")
}

export function updateUserRole(
  userId: number,
  role: "admin" | "investigator",
): Promise<AdminUser> {
  return apiRequest<AdminUser>(`/admin/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  })
}

export function updateUserStatus(
  userId: number,
  isActive: boolean,
): Promise<AdminUser> {
  return apiRequest<AdminUser>(`/admin/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ is_active: isActive }),
  })
}

export interface UserActivity {
  images_count: number
  recipients_count: number
  copies_count: number
  investigations_count: number
  recent_items: string[]
}

export function getUserActivity(userId: number): Promise<UserActivity> {
  return apiRequest<UserActivity>(`/admin/users/${userId}/activity`)
}

export function resetDemoData(): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>("/admin/reset", {
    method: "POST",
  })
}
