import type { Recipient } from "../types/recipient"
import { apiRequest } from "./client"

export function listRecipients(): Promise<Recipient[]> {
  return apiRequest<Recipient[]>("/recipients")
}

export function createRecipient(data: {
  name: string
  email: string
  notes?: string
}): Promise<Recipient> {
  return apiRequest<Recipient>("/recipients", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function updateRecipient(
  id: number,
  data: { name?: string; email?: string; notes?: string },
): Promise<Recipient> {
  return apiRequest<Recipient>(`/recipients/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export function deleteRecipient(id: number): Promise<void> {
  return apiRequest<void>(`/recipients/${id}`, { method: "DELETE" })
}
