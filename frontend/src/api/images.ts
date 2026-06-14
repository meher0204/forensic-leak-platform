import type { Image } from "../types/image"
import type { WatermarkedCopy } from "../types/recipient"
import { apiRequest } from "./client"

export function uploadImage(file: File): Promise<Image> {
  const formData = new FormData()
  formData.append("file", file)
  return apiRequest<Image>("/images/upload", {
    method: "POST",
    body: formData,
  })
}

export function listImages(): Promise<Image[]> {
  return apiRequest<Image[]>("/images")
}

export function generateWatermarks(
  imageId: number,
  recipientIds: number[],
): Promise<WatermarkedCopy[]> {
  return apiRequest<WatermarkedCopy[]>(`/images/${imageId}/watermark`, {
    method: "POST",
    body: JSON.stringify({ recipient_ids: recipientIds }),
  })
}

export function listCopies(imageId: number): Promise<WatermarkedCopy[]> {
  return apiRequest<WatermarkedCopy[]>(`/images/${imageId}/copies`)
}

export function deleteImage(id: number): Promise<void> {
  return apiRequest<void>(`/images/${id}`, { method: "DELETE" })
}
