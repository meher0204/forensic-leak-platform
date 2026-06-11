import type { User, LoginResponse } from "../types/auth"
import { apiRequest } from "./client"

export function login(username: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  })
}

export function logout(): Promise<void> {
  return apiRequest<void>("/auth/logout", { method: "POST" })
}

export function getMe(): Promise<User | null> {
  return apiRequest<User | null>("/auth/me")
}
