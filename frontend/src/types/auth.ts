export interface User {
  id: number
  username: string
  email: string
  role: string
  is_active: boolean
  created_at: string
}

export interface LoginResponse {
  user: User
  message: string
}
