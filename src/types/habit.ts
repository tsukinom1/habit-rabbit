import { TProfile } from "./profile"

export type THabitEntry = {
    id: string
    habitId: string
    habit: THabit
    date: Date
    value: number
    note: string
    mood: 'TERRIBLE' | 'BAD' | 'NEUTRAL' | 'GOOD' | 'EXCELLENT'
    createdAt: Date
    updatedAt: Date
}

export type THabit = {
    id: string
    profileId: string
    profile: TProfile
    title: string
    description?: string
    icon?: string
    color?: string
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM'
    targetValue?: number
    unit?: string
    reminderTime?: string
    startDate: Date
    endDate?: Date
    isActive: boolean
    isArchived: boolean
    currentStreak: number
    longestStreak: number
    totalEntries: number
    entries: THabitEntry[]
    createdAt: Date
    updatedAt: Date
}

