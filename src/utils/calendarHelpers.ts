import { THabitEntry, TCalendarDay, TMonthStats, TCalendarConfig } from "@/types/habit"

/**
 * Безопасно преобразует дату в объект Date
 */
export function ensureDate(date: Date | string): Date {
    return typeof date === 'string' ? new Date(date) : date
}

/**
 * Генерирует календарную сетку для месяца (42 дня = 6 недель × 7 дней)
 */
export function generateCalendarGrid(year: number, month: number, startWeekOn: 'monday' | 'sunday' = 'monday'): Date[] {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // Определяем первый день недели (0 = воскресенье, 1 = понедельник)
    const firstDayOfWeek = startWeekOn === 'monday' ? 1 : 0
    
    // Находим первый день календарной сетки
    const startDate = new Date(firstDay)
    const dayOffset = (firstDay.getDay() - firstDayOfWeek + 7) % 7
    startDate.setDate(startDate.getDate() - dayOffset)
    
    // Генерируем 35 дня (6 недель)
    const calendarDays: Date[] = []
    for (let i = 0; i < 35; i++) {
        const day = new Date(startDate)
        day.setDate(startDate.getDate() + i)
        calendarDays.push(day)
    }
    
    return calendarDays
}

/**
 * Группирует записи привычек по датам
 */
export function groupEntriesByDate(entries: THabitEntry[]): Map<string, THabitEntry[]> {
    const grouped = new Map<string, THabitEntry[]>()
    
    entries.forEach(entry => {
        const dateKey = formatDateKey(entry.date)
        const existing = grouped.get(dateKey) || []
        grouped.set(dateKey, [...existing, entry])
    })
    
    return grouped
}

/**
 * Вычисляет данные для календарного дня
 */
export function calculateCalendarDay(
    date: Date, 
    entries: THabitEntry[], 
    targetValue?: number
): TCalendarDay {
    if (!entries || entries.length === 0) {
        return {
            date,
            entries: [],
            completionRate: 0,
            totalValue: 0,
            isCompleted: false,
            intensity: 0,
            streak: false
        }
    }
    
    // Нормализуем даты записей для корректного сравнения
    const normalizedEntries = entries.map(entry => ({
        ...entry,
        date: ensureDate(entry.date)
    }))
    
    // Вычисляем общие показатели
    const totalValue = normalizedEntries.reduce((sum, entry) => sum + (entry.value || 0), 0)
    const avgCompletionRate = normalizedEntries.reduce((sum, entry) => sum + entry.progressPercentage, 0) / normalizedEntries.length
    const isCompleted = normalizedEntries.every(entry => entry.isCompleted)
    
    // Вычисляем интенсивность для heat map (0-4)
    const intensity = calculateIntensity(avgCompletionRate, isCompleted)
    
    return {
        date,
        entries: normalizedEntries,
        completionRate: Math.round(avgCompletionRate),
        totalValue,
        isCompleted,
        intensity,
        streak: false // Будет вычислено отдельно в контексте всего календаря
    }
}

/**
 * Вычисляет интенсивность для heat map (0-4)
 */
export function calculateIntensity(completionRate: number, isCompleted: boolean): number {
    if (completionRate === 0) return 0 // Нет активности
    if (completionRate < 25) return 1 // Низкая активность
    if (completionRate < 50) return 2 // Средняя активность
    if (completionRate < 100) return 3 // Высокая активность
    return 4 // Максимальная активность (цель достигнута)
}

/**
 * Генерирует полный календарь с данными
 */
export function generateCalendarWithData(
    year: number,
    month: number,
    entries: THabitEntry[],
    config: TCalendarConfig = {
        showMood: false,
        colorScheme: 'green',
        showStreaks: true,
        startWeekOn: 'monday'
    }
): TCalendarDay[] {
    const calendarGrid = generateCalendarGrid(year, month, config.startWeekOn)
    const entriesByDate = groupEntriesByDate(entries)
    
    // Создаем календарные дни с данными
    const calendarDays = calendarGrid.map(date => {
        const dateKey = formatDateKey(date)
        const dayEntries = entriesByDate.get(dateKey) || []
        return calculateCalendarDay(date, dayEntries)
    })
    
    // Вычисляем streak для каждого дня
    if (config.showStreaks) {
        calculateStreaksForCalendar(calendarDays)
    }
    
    return calendarDays
}

/**
 * Вычисляет статистику за месяц
 */
export function calculateMonthStats(calendarDays: TCalendarDay[], targetMonth: number): TMonthStats {
    // Фильтруем только дни текущего месяца
    const monthDays = calendarDays.filter(day => {
        const dateObj = ensureDate(day.date)
        return dateObj.getMonth() === targetMonth
    })
    
    const activeDays = monthDays.filter(day => day.entries.length > 0).length
    const completedDays = monthDays.filter(day => day.isCompleted).length
    
    const avgCompletion = monthDays.length > 0 
        ? monthDays.reduce((sum, day) => sum + day.completionRate, 0) / monthDays.length 
        : 0
    
    // Вычисляем streak в рамках месяца
    const currentStreak = calculateCurrentStreakInMonth(monthDays)
    const longestStreakInMonth = calculateLongestStreakInMonth(monthDays)
    
    return {
        totalDays: monthDays.length,
        activeDays,
        completedDays,
        averageCompletion: Math.round(avgCompletion),
        currentStreak,
        longestStreakInMonth
    }
}

/**
 * Вычисляет streak для всех дней календаря
 */
function calculateStreaksForCalendar(calendarDays: TCalendarDay[]): void {
    let currentStreak = 0
    
    // Проходим по дням в хронологическом порядке
    const sortedDays = [...calendarDays].sort((a, b) => {
        const dateA = ensureDate(a.date)
        const dateB = ensureDate(b.date)
        return dateA.getTime() - dateB.getTime()
    })
    
    for (const day of sortedDays) {
        if (day.completionRate > 0) {
            currentStreak++
            day.streak = true
        } else {
            currentStreak = 0
            day.streak = false
        }
    }
}

/**
 * Вычисляет текущий streak в месяце (с конца месяца)
 */
function calculateCurrentStreakInMonth(monthDays: TCalendarDay[]): number {
    const sortedDays = [...monthDays]
        .sort((a, b) => {
            const dateA = ensureDate(a.date)
            const dateB = ensureDate(b.date)
            return dateB.getTime() - dateA.getTime() // От новых к старым
        })
    
    let streak = 0
    for (const day of sortedDays) {
        if (day.completionRate > 0) {
            streak++
        } else {
            break
        }
    }
    
    return streak
}

/**
 * Вычисляет самый длинный streak в месяце
 */
function calculateLongestStreakInMonth(monthDays: TCalendarDay[]): number {
    const sortedDays = [...monthDays]
        .sort((a, b) => {
            const dateA = ensureDate(a.date)
            const dateB = ensureDate(b.date)
            return dateA.getTime() - dateB.getTime() // От старых к новым
        })
    
    let maxStreak = 0
    let currentStreak = 0
    
    for (const day of sortedDays) {
        if (day.completionRate > 0) {
            currentStreak++
            maxStreak = Math.max(maxStreak, currentStreak)
        } else {
            currentStreak = 0
        }
    }
    
    return maxStreak
}

/**
 * Форматирует дату в ключ для группировки (YYYY-MM-DD)
 */
export function formatDateKey(date: Date | string): string {
    const dateObj = ensureDate(date)
    return dateObj.toISOString().split('T')[0]
}

/**
 * Получает CSS класс для интенсивности heat map
 */
export function getIntensityClass(intensity: number, colorScheme: TCalendarConfig['colorScheme'] = 'green'): string {
    const baseClass = `calendar-intensity-${intensity}`
    const colorClass = `calendar-${colorScheme}`
    return `${baseClass} ${colorClass}`
}

/**
 * Проверяет, является ли дата сегодняшним днем
 */
export function isToday(date: Date | string): boolean {
    const today = new Date()
    const dateObj = ensureDate(date)
    return formatDateKey(dateObj) === formatDateKey(today)
}

/**
 * Проверяет, принадлежит ли дата текущему месяцу
 */
export function isCurrentMonth(date: Date | string, targetMonth: number): boolean {
    const dateObj = ensureDate(date)
    return dateObj.getMonth() === targetMonth
}

/**
 * Форматирует дату для отображения
 */
export function formatCalendarDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
    const dateObj = ensureDate(date)
    
    if (format === 'long') {
        return dateObj.toLocaleDateString('ru-RU', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })
    }
    
    return dateObj.toLocaleDateString('ru-RU', { 
        day: 'numeric',
        month: 'short'
    })
}

/**
 * Получает название месяца
 */
export function getMonthName(month: number): string {
    const months = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ]
    return months[month]
}

/**
 * Получает названия дней недели
 */
export function getWeekDayNames(startWeekOn: 'monday' | 'sunday' = 'monday'): string[] {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
    
    if (startWeekOn === 'monday') {
        return [...days.slice(1), days[0]] // Начинаем с понедельника
    }
    
    return days // Начинаем с воскресенья
}