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
