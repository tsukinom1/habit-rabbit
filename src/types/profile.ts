export type TProfile = {
    id: string
    userId: string
    firstName: string
    lastName: string
    avatar?: string
    bio: string
    gender?: string
    birthDate?: string
    phone?: string
    country?: string
    city?: string
    address?: string
    isPublic: boolean
    timezone?: string
    language?: string
    totalHabits: number
    completedHabits: number
    currentStreak: number
    longestStreak: number
    socials?: {
        id?: string
        platform?: string
        url?: string
        username?: string
        isPublic?: boolean
        createdAt?: Date
        updatedAt?: Date
    }[]
    user: {
        email: string
        role: string
        createdAt: string
    }
    createdAt: string
    updatedAt: string
}
