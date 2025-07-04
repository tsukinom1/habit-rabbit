import { THabit } from '@/types/habit'

/**
 * Преобразует частоту привычки в человекочитаемый текст
 */
export const getFrequencyText = (frequency: THabit['frequency']): string => {
    switch (frequency) {
        case 'DAILY':
            return 'Ежедневно'
        case 'WEEKLY':
            return 'Еженедельно'
        case 'MONTHLY':
            return 'Ежемесячно'
        default:
            return frequency
    }
}

export const getMoodText = (mood: string) => {
    switch (mood) {
        case 'TERRIBLE': return 'Ужасно'
        case 'BAD': return 'Плохо'
        case 'NEUTRAL': return 'Нейтрально'
        case 'GOOD': return 'Хорошо'
        case 'EXCELLENT': return 'Отлично'
        default: return 'Нейтрально'
    }
}

/**
 * Преобразует единицу измерения в человекочитаемый текст
 */
export const getUnitText = (unit: THabit['unit']): string => {
    if (!unit) return 'единиц'

    switch (unit) {
        case 'count':
            return 'раз'
        case 'minutes':
            return 'минут'
        case 'hours':
            return 'часов'
        case 'days':
            return 'дней'
        case 'months':
            return 'месяцев'
        case 'meters':
            return 'метров'
        case 'kilometers':
            return 'километров'
        case 'items':
            return 'штук'
        case 'percent':
            return 'процентов'
        case 'other':
            return 'другое'
        default:
            return unit
    }
}

/**
 * Преобразует статус активности привычки в человекочитаемый текст
 */
export const getActiveStatusText = (isActive: boolean): string => {
    return isActive ? 'Активная' : 'Неактивная'
}

/**
 * Форматирует дату для отображения
 */
export const formatDisplayDate = (date: string | Date | null | undefined): string => {
    if (!date) return 'Не указана'

    try {
        return new Date(date).toLocaleDateString('ru-RU')
    } catch {
        return 'Некорректная дата'
    }
}

/**
 * Создает строку с целью привычки
 */
export const getTargetText = (targetValue: THabit['targetValue'], unit: THabit['unit']): string => {
    if (!targetValue) return 'Цель не указана'
    return `${targetValue} ${getUnitText(unit)} `
}

/**
 * Создает полное описание периода привычки
 */
export const getPeriodText = (startDate: string | Date | null | undefined, endDate: string | Date | null | undefined): string => {
    const start = formatDisplayDate(startDate)
    const end = formatDisplayDate(endDate)
    
    if (start === 'Не указана' && end === 'Не указана') {
        return 'Период не указан'
    }
    
    return `${start === 'Не указана' ? 'Дата начала не указана' : start} - ${end === 'Не указана' ? 'Дата окончания не указана' : end}`
}

/**
 * Вычисляет процент выполнения записи относительно цели
 */
export const calculateProgress = (value: number, targetValue: number | undefined): number => {
    if (!targetValue || targetValue === 0) return 0
    return Math.min((value / targetValue) * 100, 100)
}

/**
 * Определяет, выполнена ли цель
 */
export const isGoalCompleted = (value: number, targetValue: number | undefined): boolean => {
    if (!targetValue) return false
    return value >= targetValue
}

/**
 * Получает цвет прогресса на основе процента выполнения
 */
export const getProgressColor = (progressPercentage: number): string => {
    if (progressPercentage >= 100) return 'text-green-600'
    if (progressPercentage >= 75) return 'text-lime-600'
    if (progressPercentage >= 50) return 'text-yellow-600'
    if (progressPercentage >= 25) return 'text-orange-600'
    return 'text-red-600'
}

/**
 * Получает CSS класс для цвета фона прогресса
 */
export const getProgressBgColor = (progressPercentage: number): string => {
    if (progressPercentage >= 100) return 'bg-green-100'
    if (progressPercentage >= 75) return 'bg-lime-100'
    if (progressPercentage >= 50) return 'bg-yellow-100'
    if (progressPercentage >= 25) return 'bg-orange-100'
    return 'bg-red-100'
}

/**
 * Создает текст статуса выполнения
 */
export const getCompletionStatusText = (isCompleted: boolean, progressPercentage: number): string => {
    if (isCompleted) return 'Выполнено'
    if (progressPercentage === 0) return 'Не начато'
    return 'В процессе'
}

/**
 * Форматирует отображение значения с единицами измерения
 */
export const formatValueWithUnit = (value: number, targetValue: number | undefined, unit: string | undefined): string => {
    const unitText = getUnitText(unit)
    const target = targetValue ? ` из ${targetValue}` : ''
    return `${value}${target} ${unitText}`
}

/**
 * Проверяет, является ли дата сегодняшней
 */
export const isToday = (date: string | Date): boolean => {
    const today = new Date()
    const checkDate = new Date(date)
    
    return (
        today.getFullYear() === checkDate.getFullYear() &&
        today.getMonth() === checkDate.getMonth() &&
        today.getDate() === checkDate.getDate()
    )
}

/**
 * Проверяет, была ли дата вчера
 */
export const isYesterday = (date: string | Date): boolean => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const checkDate = new Date(date)
    
    return (
        yesterday.getFullYear() === checkDate.getFullYear() &&
        yesterday.getMonth() === checkDate.getMonth() &&
        yesterday.getDate() === checkDate.getDate()
    )
}

/**
 * Получает разность в днях между двумя датами
 */
export const getDaysDifference = (date1: string | Date, date2: string | Date): number => {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    
    // Сбрасываем время для корректного сравнения дат
    d1.setHours(0, 0, 0, 0)
    d2.setHours(0, 0, 0, 0)
    
    const diffTime = Math.abs(d2.getTime() - d1.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Проверяет, выполнена ли привычка сегодня (хотя бы частично)
 */
export const isHabitCompletedToday = (entries: any[]): boolean => {
    return entries.some(entry => 
        isToday(entry.date) && entry.value && entry.value > 0
    )
}

/**
 * Проверяет, полностью ли выполнена цель привычки сегодня
 */
export const isHabitFullyCompletedToday = (entries: any[]): boolean => {
    return entries.some(entry => 
        isToday(entry.date) && entry.isCompleted
    )
}

/**
 * Получает последнюю запись привычки
 */
export const getLastHabitEntry = (entries: any[]): any | null => {
    if (!entries || entries.length === 0) return null
    
    return entries.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0]
}

/**
 * Вычисляет текущий streak для привычки
 * @param entries - отсортированные записи привычки (по дате убыванию)
 * @param frequency - частота выполнения привычки
 */
export const calculateCurrentStreak = (entries: any[], frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM' = 'DAILY'): number => {
    if (!entries || entries.length === 0) return 0
    
    // Сортируем записи по дате (новые первые)
    // ✅ ИЗМЕНЕНО: Считаем streak от любой активности (value > 0), а не только от полного выполнения
    const sortedEntries = entries
        .filter(entry => entry.value && entry.value > 0) // Любая активность считается
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    if (sortedEntries.length === 0) return 0
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let streak = 0
    let expectedDate = new Date(today)
    
    // Для ежедневных привычек
    if (frequency === 'DAILY') {
        for (const entry of sortedEntries) {
            const entryDate = new Date(entry.date)
            entryDate.setHours(0, 0, 0, 0)
            
            // Если запись на ожидаемую дату или вчера (для сегодняшнего дня)
            if (entryDate.getTime() === expectedDate.getTime() || 
                (streak === 0 && isYesterday(entryDate))) {
                streak++
                expectedDate.setDate(expectedDate.getDate() - 1)
            } else {
                break // Прерываем streak
            }
        }
    }
    
    // TODO: Добавить логику для WEEKLY и MONTHLY
    
    return streak
}

/**
 * Вычисляет самый длинный streak для привычки
 */
export const calculateLongestStreak = (entries: any[], frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM' = 'DAILY'): number => {
    if (!entries || entries.length === 0) return 0
    
    // ✅ ИЗМЕНЕНО: Считаем streak от любой активности (value > 0), а не только от полного выполнения
    const activeEntries = entries
        .filter(entry => entry.value && entry.value > 0)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Сортируем по возрастанию
    
    if (activeEntries.length === 0) return 0
    
    let maxStreak = 0
    let currentStreak = 0
    let lastDate: Date | null = null
    
    for (const entry of activeEntries) {
        const entryDate = new Date(entry.date)
        entryDate.setHours(0, 0, 0, 0)
        
        if (lastDate === null) {
            // Первая запись
            currentStreak = 1
        } else {
            const expectedDate = new Date(lastDate)
            expectedDate.setDate(expectedDate.getDate() + 1)
            
            if (entryDate.getTime() === expectedDate.getTime()) {
                // Следующий день подряд
                currentStreak++
            } else {
                // Streak прерван
                maxStreak = Math.max(maxStreak, currentStreak)
                currentStreak = 1
            }
        }
        
        lastDate = entryDate
    }
    
    return Math.max(maxStreak, currentStreak)
}

/**
 * Получает статус streak для отображения
 */
export const getStreakStatus = (currentStreak: number, lastEntry: any): { 
    text: string
    color: string
    icon: string 
} => {
    if (currentStreak === 0) {
        return {
            text: 'Начните серию!',
            color: 'text-gray-600',
            icon: '🎯'
        }
    }
    
    // ✅ ИЗМЕНЕНО: Проверяем активность (value > 0), а не только полное выполнение
    const isActiveToday = lastEntry && isToday(lastEntry.date) && lastEntry.value && lastEntry.value > 0
    
    if (isActiveToday) {
        return {
            text: `🔥 ${currentStreak} дней подряд!`,
            color: 'text-orange-600',
            icon: '🔥'
        }
    }
    
    // ✅ ИЗМЕНЕНО: Проверяем активность вчера
    if (lastEntry && isYesterday(lastEntry.date) && lastEntry.value && lastEntry.value > 0) {
        return {
            text: `⚡ ${currentStreak} дней. Продолжайте сегодня!`,
            color: 'text-blue-600',
            icon: '⚡'
        }
    }
    
    return {
        text: `💪 Лучший результат: ${currentStreak} дней`,
        color: 'text-green-600',
        icon: '💪'
    }
}

/**
 * Получает сообщение мотивации на основе streak
 */
export const getMotivationMessage = (currentStreak: number): string => {
    if (currentStreak === 0) return "Начните свой путь к успеху!"
    if (currentStreak === 1) return "Отличное начало! 🌱"
    if (currentStreak < 7) return "Набираете обороты! 💪"
    if (currentStreak < 14) return "Первая неделя позади! 🎉"
    if (currentStreak < 21) return "Вы на пути к формированию привычки! 🌟"
    if (currentStreak < 30) return "Привычка почти сформирована! 🔥"
    if (currentStreak < 100) return "Вы - мастер постоянства! 👑"
    return "Легенда самодисциплины! 🏆"
} 