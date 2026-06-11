export interface Recipient {
  id: number
  name: string
  email: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface WatermarkedCopy {
  id: number
  image_id: number
  recipient_id: number
  recipient_name: string
  watermark_id: string
  created_at: string
}
