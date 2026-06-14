import { apiRequest } from "./client"

export interface WatermarkedCopy {
  id: number
  image_id: number
  image_filename: string
  recipient_id: number
  recipient_name: string
  recipient_email: string
  watermark_id: string
  created_at: string
}

export function listCopies(): Promise<WatermarkedCopy[]> {
  return apiRequest<WatermarkedCopy[]>("/copies")
}

export function deleteCopy(id: number): Promise<void> {
  return apiRequest<void>(`/copies/${id}`, { method: "DELETE" })
}
