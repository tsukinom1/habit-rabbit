import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { THabitEntry, TCalendarConfig, TCalendarDay, TMonthStats, TCalendarData } from '@/types/habit'
import { 
    generateCalendarWithData, 
    calculateMonthStats, 
    formatDateKey,
    ensureDate
} from '@/utils/calendarHelpers'
import { notify } from './useNotification'

interface CalendarCache {
    [key: string]: {
        entries: THabitEntry[]
        timestamp: number
        stats: TMonthStats
    }
}

interface UseHabitCalendarOptions {
    habitId?: string
    autoLoad?: boolean
    cacheTimeout?: number // минуты
    config?: Partial<TCalendarConfig>
}

interface UseHabitCalendarReturn {
    // Данные
    calendarData: TCalendarDay[]
    monthStats: TMonthStats
    entries: THabitEntry[]
    
    // Состояние
    loading: boolean
    error: string | null
    
    // Навигация
    currentMonth: number
    currentYear: number
    navigateToMonth: (month: number, year: number) => void
    navigateMonth: (direction: 'prev' | 'next') => void
    goToToday: () => void
    
    // Конфигурация
    config: TCalendarConfig
    updateConfig: (newConfig: Partial<TCalendarConfig>) => void
    
    // Методы
    loadCalendarData: (habitId: string, month?: number, year?: number) => Promise<void>
    refreshCalendarData: () => Promise<void>
    clearCache: () => void
    
    // Утилиты
    getDayData: (date: Date) => TCalendarDay | null
    isDataLoaded: boolean
}

const useHabitCalendar = (options: UseHabitCalendarOptions = {}): UseHabitCalendarReturn => {
    const { 
        habitId, 
        autoLoad = true, 
        cacheTimeout = 30, // 30 минут 
        config: initialConfig = {} 
    } = options
    
    const { data: session } = useSession()
    
    // Состояние
    const [entries, setEntries] = useState<THabitEntry[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [cache, setCache] = useState<CalendarCache>({})
    const [currentDate, setCurrentDate] = useState(new Date())
    
    // Конфигурация по умолчанию
    const defaultConfig: TCalendarConfig = {
        showMood: false,
        colorScheme: 'green',
        showStreaks: true,
        startWeekOn: 'monday'
    }
    
    const [config, setConfig] = useState<TCalendarConfig>({
        ...defaultConfig,
        ...initialConfig
    })
    
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    
    // Генерация календарных данных
    const calendarData = useMemo(() => {
        if (!entries.length) return []
        
        // Нормализуем даты перед передачей в календарь
        const normalizedEntries = entries.map(entry => ({
            ...entry,
            date: ensureDate(entry.date),
            createdAt: ensureDate(entry.createdAt),
            updatedAt: ensureDate(entry.updatedAt)
        }))
        
        return generateCalendarWithData(currentYear, currentMonth, normalizedEntries, config)
    }, [entries, currentYear, currentMonth, config])
    
    // Вычисление статистики
    const monthStats = useMemo(() => {
        if (!calendarData.length) {
            return {
                totalDays: 0,
                activeDays: 0,
                completedDays: 0,
                averageCompletion: 0,
                currentStreak: 0,
                longestStreakInMonth: 0
            }
        }
        return calculateMonthStats(calendarData, currentMonth)
    }, [calendarData, currentMonth])
    
    // Ключ для кэша
    const getCacheKey = useCallback((habitId: string, month: number, year: number) => {
        return `${habitId}-${year}-${month}`
    }, [])
    
    // Проверка валидности кэша
    const isCacheValid = useCallback((cacheEntry: CalendarCache[string]) => {
        const now = Date.now()
        const cacheAge = (now - cacheEntry.timestamp) / (1000 * 60) // минуты
        return cacheAge < cacheTimeout
    }, [cacheTimeout])
    
    // Загрузка данных календаря
    const loadCalendarData = useCallback(async (
        targetHabitId: string, 
        targetMonth?: number, 
        targetYear?: number
    ) => {
        if (!session?.user?.id) {
            setError('Необходимо войти в систему')
            return
        }
        
        const month = targetMonth ?? currentMonth
        const year = targetYear ?? currentYear
        const cacheKey = getCacheKey(targetHabitId, month, year)
        
        // Проверяем кэш
        const cachedData = cache[cacheKey]
        if (cachedData && isCacheValid(cachedData)) {
            setEntries(cachedData.entries)
            setError(null)
            return
        }
        
        try {
            setLoading(true)
            setError(null)
            
            // Определяем диапазон дат для месяца
            const startDate = new Date(year, month, 1)
            const endDate = new Date(year, month + 1, 0) // Последний день месяца
            
            // Расширяем диапазон для полного календаря (42 дня)
            const calendarStart = new Date(startDate)
            calendarStart.setDate(startDate.getDate() - startDate.getDay())
            
            const calendarEnd = new Date(endDate)
            calendarEnd.setDate(endDate.getDate() + (6 - endDate.getDay()))
            
            const searchParams = new URLSearchParams({
                startDate: calendarStart.toISOString().split('T')[0],
                endDate: calendarEnd.toISOString().split('T')[0],
                limit: '200' // Достаточно для месяца
            })
            
            const response = await fetch(`/api/habits/${targetHabitId}/entries?${searchParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Ошибка при загрузке данных календаря')
            }
            
            const data = await response.json()
            const entriesData = data.entries || []
            
            // Кэшируем данные
            const cacheEntry = {
                entries: entriesData,
                timestamp: Date.now(),
                stats: calculateMonthStats(
                    generateCalendarWithData(year, month, entriesData, config), 
                    month
                )
            }
            
            setCache(prev => ({
                ...prev,
                [cacheKey]: cacheEntry
            }))
            
            setEntries(entriesData)
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка при загрузке календаря'
            setError(errorMessage)
            notify.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }, [session?.user?.id, currentMonth, currentYear, cache, getCacheKey, isCacheValid, config])
    
    // Обновление данных
    const refreshCalendarData = useCallback(async () => {
        if (!habitId) return
        
        // Очищаем кэш для текущего месяца
        const cacheKey = getCacheKey(habitId, currentMonth, currentYear)
        setCache(prev => {
            const newCache = { ...prev }
            delete newCache[cacheKey]
            return newCache
        })
        
        await loadCalendarData(habitId, currentMonth, currentYear)
    }, [habitId, currentMonth, currentYear, getCacheKey, loadCalendarData])
    
    // Навигация
    const navigateToMonth = useCallback((month: number, year: number) => {
        setCurrentDate(new Date(year, month, 1))
    }, [])
    
    const navigateMonth = useCallback((direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev)
            if (direction === 'prev') {
                newDate.setMonth(prev.getMonth() - 1)
            } else {
                newDate.setMonth(prev.getMonth() + 1)
            }
            return newDate
        })
    }, [])
    
    const goToToday = useCallback(() => {
        setCurrentDate(new Date())
    }, [])
    
    // Обновление конфигурации
    const updateConfig = useCallback((newConfig: Partial<TCalendarConfig>) => {
        setConfig(prev => ({ ...prev, ...newConfig }))
    }, [])
    
    // Очистка кэша
    const clearCache = useCallback(() => {
        setCache({})
    }, [])
    
    // Получение данных для конкретного дня
    const getDayData = useCallback((date: Date): TCalendarDay | null => {
        return calendarData.find(day => 
            formatDateKey(day.date) === formatDateKey(date)
        ) || null
    }, [calendarData])
    
    // Автозагрузка при изменении habitId или месяца
    useEffect(() => {
        if (autoLoad && habitId && session?.user?.id) {
            loadCalendarData(habitId, currentMonth, currentYear)
        }
    }, [autoLoad, habitId, session?.user?.id, currentMonth, currentYear, loadCalendarData])
    
    // Очистка кэша при размонтировании компонента
    useEffect(() => {
        return () => {
            // Очищаем старые записи кэша (старше 1 часа)
            const now = Date.now()
            setCache(prev => {
                const newCache: CalendarCache = {}
                Object.entries(prev).forEach(([key, value]) => {
                    const cacheAge = (now - value.timestamp) / (1000 * 60) // минуты
                    if (cacheAge < 60) { // Сохраняем записи младше 1 часа
                        newCache[key] = value
                    }
                })
                return newCache
            })
        }
    }, [])
    
    return {
        // Данные
        calendarData,
        monthStats,
        entries,
        
        // Состояние
        loading,
        error,
        
        // Навигация
        currentMonth,
        currentYear,
        navigateToMonth,
        navigateMonth,
        goToToday,
        
        // Конфигурация
        config,
        updateConfig,
        
        // Методы
        loadCalendarData,
        refreshCalendarData,
        clearCache,
        
        // Утилиты
        getDayData,
        isDataLoaded: entries.length > 0
    }
}

export default useHabitCalendar 