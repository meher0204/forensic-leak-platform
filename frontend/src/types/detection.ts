export interface MatchResult {
  recipient_id: number
  recipient_name: string
  confidence: number
  watermark_id: string
  image_id: number
  created_at: string
}

export interface ImageInfo {
  width: number
  height: number
  file_size: number
  format: string
}

export interface DetectionResult {
  match_found: boolean
  confidence: number
  top_match: MatchResult | null
  all_matches: MatchResult[]
  possible_tampering: boolean
  image_info: ImageInfo
  investigation_id?: number
}

export interface Investigation {
  id: number
  leaked_filename: string
  detected_watermark_id: string | null
  match_found: boolean
  confidence: number
  matched_recipient_id: number | null
  matched_image_id: number | null
  possible_tampering: boolean
  image_width: number | null
  image_height: number | null
  file_size: number | null
  notes: string | null
  created_at: string
}

export interface InvestigationDetail extends Investigation {
  recipient_name: string | null
  recipient_email: string | null
  image_filename: string | null
  image_created_at: string | null
  watermark_created_at: string | null
  evidence_url: string | null
}

export interface WatermarkRecord {
  id: number
  image_id: number
  recipient_id: number
  watermark_id: string
  algorithm: string
  status: string
  error_message: string | null
  duration_ms: number | null
  created_at: string
}
