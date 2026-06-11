import type { DetectionResult, Investigation, InvestigationDetail } from "../types/detection"
import { apiRequest } from "./client"

export function detectLeak(file: File): Promise<DetectionResult> {
  const formData = new FormData()
  formData.append("file", file)
  return apiRequest<DetectionResult>("/detect", {
    method: "POST",
    body: formData,
  })
}

export function listInvestigations(): Promise<Investigation[]> {
  return apiRequest<Investigation[]>("/investigations")
}

export function getInvestigationDetail(id: number): Promise<InvestigationDetail> {
  return apiRequest<InvestigationDetail>(`/investigations/${id}/detail`)
}
