import type { User, LoginResponse, UserResponse } from "../types/auth"
import { apiRequest } from "./client"

export function register(data: {
  username: string
  email: string
  password: string
}): Promise<UserResponse> {
  return apiRequest<UserResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

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
