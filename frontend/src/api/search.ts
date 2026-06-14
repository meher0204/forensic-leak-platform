import { apiRequest } from "./client"

export interface SearchResultItem {
  type: "image" | "recipient" | "investigation" | "copy"
  id: number
  label: string
  subtitle: string
  url: string
}

export interface SearchResponse {
  results: SearchResultItem[]
}

export function search(q: string, signal?: AbortSignal): Promise<SearchResponse> {
  return apiRequest<SearchResponse>(
    `/search?q=${encodeURIComponent(q)}`,
    undefined,
    signal,
  )
}
