import { Mood } from "@prisma/client"
import { TProfile } from "./profile"

export type THabitEntry = {
    id: string
    habitId: string
    habit: THabit
    date: Date | string // Даты могут приходить как строки из API
    value: number // Фактическое выполненное значение (связано с targetValue привычки)
    note?: string
    mood: Mood
    isCompleted: boolean // Выполнена ли цель полностью (value >= targetValue)
    progressPercentage: number // Процент выполнения (value / targetValue * 100)
    createdAt: Date | string
    updatedAt: Date | string
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
    startDate: Date | string
    endDate?: Date | string
    isActive: boolean
    isArchived: boolean
    currentStreak: number
    longestStreak: number
    totalEntries: number
    entries: THabitEntry[]
    createdAt: Date | string
    updatedAt: Date | string
}

// Календарные типы
export type TCalendarDay = {
    date: Date // В календаре всегда используем объекты Date
    entries: THabitEntry[]
    completionRate: number // 0-100% - средний процент выполнения за день
    totalValue: number // Суммарное значение выполнения
    isCompleted: boolean // Полностью ли выполнена цель
    intensity: number // 0-4 для heat map (0 = нет данных, 4 = максимум)
    streak: boolean // Является ли частью текущего streak
}

export type TMonthStats = {
    totalDays: number
    activeDays: number // Дни с записями
    completedDays: number // Дни с полным выполнением
    averageCompletion: number // Средний процент выполнения
    currentStreak: number
    longestStreakInMonth: number
}

export type TCalendarConfig = {
    showMood: boolean
    colorScheme: 'green' | 'blue' | 'purple' | 'orange'
    showStreaks: boolean
    startWeekOn: 'monday' | 'sunday'
}

export type TCalendarData = {
    days: TCalendarDay[]
    stats: TMonthStats
    currentMonth: number
    currentYear: number
    config: TCalendarConfig
}

