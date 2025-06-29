import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      role: string // ← Добавляем роль
      name?: string | null
      image?: string | null
    }
  }

  interface JWT {
    id: string
    role: string // ← Добавляем роль в JWT
  }
  
  interface User {
    role?: string // ← Добавляем роль в User
  }
} 