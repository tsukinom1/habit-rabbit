import { TProfile } from "@/types/profile"
import { useSession } from "next-auth/react"
import { useState, useEffect, useCallback } from "react"
import { notify } from "./useNotification"
import { THabit } from "@/types/habit"

/**
 * Универсальный хук для работы с привычками
 * 
 * Поддерживает два режима:
 * 1. Без параметров - работа со списком всех привычек пользователя
 * 2. С habitId - дополнительно загружает и отслеживает конкретную привычку
 * 
 * @param habitId - опциональный ID привычки для отслеживания
 * 
 * Примеры использования:
 * 
 * // Для списка привычек
 * const { habits, habitLoading, createHabit } = useHabit()
 * 
 * // Для конкретной привычки
 * const { currentHabit, currentHabitLoading, updateHabit } = useHabit('habit-123')
 * 
 * // Универсальное использование
 * const { habits, currentHabit, getHabitSmart } = useHabit()
 */


export const useHabit = (habitId?: string) => {
    const { data: session, status } = useSession()
    const [habits, setHabits] = useState<THabit[]>([])
    const [habitLoading, setHabitLoading] = useState<boolean>(true)
    const [habitError, setHabitError] = useState<string | null>(null)

    // Состояние для отдельной привычки
    const [currentHabit, setCurrentHabit] = useState<THabit | null>(null)
    const [currentHabitLoading, setCurrentHabitLoading] = useState<boolean>(false)


    const fetchHabit = async () => {
        if (!session?.user?.id) {
            setHabitLoading(false)
            return
        }

        try {
            setHabitLoading(true)
            setHabitError(null)

            const response = await fetch('/api/habits', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                const errorData = await response.json()
                let errorMessage = 'Ошибка при получении привычек'

                if (response.status === 401) {
                    errorMessage = 'Необходимо войти в систему'
                } else if (response.status === 404) {
                    errorMessage = 'Профиль не найден'
                } else if (response.status === 500) {
                    errorMessage = 'Ошибка сервера'
                } else {
                    errorMessage = errorData.error || errorMessage
                }

                throw new Error(errorMessage)
            }

            const data = await response.json()
            setHabits(Array.isArray(data) ? data : [])

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка при получении привычек'
            setHabitError(errorMessage)
            notify.error(errorMessage)
        } finally {
            setHabitLoading(false)
        }
    }

    const createHabit = async (habitData: Partial<THabit>) => {
        try {
            setHabitError(null)

            const response = await fetch('/api/habits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(habitData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                let errorMessage = 'Ошибка при создании привычки'

                if (response.status === 400) {
                    errorMessage = errorData.error || 'Некорректные данные'
                } else if (response.status === 401) {
                    errorMessage = 'Необходимо войти в систему'
                } else {
                    errorMessage = errorData.error || errorMessage
                }

                throw new Error(errorMessage)
            }

            const newHabit = await response.json()
            setHabits(prev => [newHabit, ...prev])
            notify.success('Привычка успешно создана!')
            return newHabit

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка при создании привычки'
            setHabitError(errorMessage)
            notify.error(errorMessage)
            throw err
        }
    }

    const updateHabit = async (habitId: string, habitData: Partial<THabit>) => {
        try {
            setHabitError(null)

            const response = await fetch(`/api/habits/${habitId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(habitData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                let errorMessage = 'Ошибка при обновлении привычки'

                if (response.status === 400) {
                    errorMessage = errorData.error || 'Некорректные данные'
                } else if (response.status === 401) {
                    errorMessage = 'Необходимо войти в систему'
                } else if (response.status === 404) {
                    errorMessage = 'Привычка не найдена'
                } else {
                    errorMessage = errorData.error || errorMessage
                }

                throw new Error(errorMessage)
            }

            const updatedHabit = await response.json()

            // Обновляем привычку в списке
            setHabits(prev => prev.map(habit =>
                habit.id === habitId ? updatedHabit : habit
            ))

            // Обновляем текущую привычку если это она
            if (currentHabit?.id === habitId) {
                setCurrentHabit(updatedHabit)
            }

            notify.success('Привычка успешно обновлена!')
            return updatedHabit

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка при обновлении привычки'
            setHabitError(errorMessage)
            notify.error(errorMessage)
            throw err
        }
    }

    const deleteHabit = async (habitId: string) => {
        try {
            setHabitError(null)
            const response = await fetch(`/api/habits/${habitId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            setHabitLoading(true)

            if (!response.ok) {
                const errorData = await response.json()
                let errorMessage = 'Ошибка при удалении привычки'

                if (response.status === 401) {
                    errorMessage = 'Необходимо войти в систему'
                } else if (response.status === 404) {
                    errorMessage = 'Привычка не найдена'
                } else {
                    errorMessage = errorData.error || errorMessage
                }

                throw new Error(errorMessage)
            }

            // Удаляем привычку из списка
            setHabits(prev => prev.filter(habit => habit.id !== habitId))

            // Очищаем текущую привычку если это была она
            if (currentHabit?.id === habitId) {
                setCurrentHabit(null)
            }

            notify.success('Привычка успешно удалена!')

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка при удалении привычки'
            setHabitError(errorMessage)
            notify.error(errorMessage)
            throw err
        }
    }

    const getHabit = useCallback(async (habitId: string) => {
        try {
            setHabitError(null)

            const response = await fetch(`/api/habits/${habitId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Ошибка при получении привычки')
            }

            return await response.json()

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка при получении привычки'
            setHabitError(errorMessage)
            notify.error(errorMessage)
            throw err
        }
    }, [])

    // Умная функция для получения привычки с полными данными
    const getHabitSmart = useCallback(async (id: string) => {
        try {
            setHabitError(null)
            setCurrentHabitLoading(true)

            // ВСЕГДА загружаем полные данные с сервера для отдельной страницы
            // Это нужно для получения всех записей, а не только ограниченного количества
            const habit = await getHabit(id)
            setCurrentHabit(habit)

            // Обновляем список привычек если он уже загружен
            // Но не заменяем полную версию на урезанную
            if (habits.length > 0) {
                setHabits(prev => {
                    const exists = prev.find(h => h.id === id)
                    if (!exists) {
                        // Добавляем новую привычку, но с ограниченными записями для списка
                        const habitForList = {
                            ...habit,
                            entries: habit.entries.slice(0, 5) // Только последние 5 для списка
                        }
                        return [habitForList, ...prev]
                    }
                    // Не заменяем существующую в списке, оставляем как есть
                    return prev
                })
            }
            return habit

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка при получении привычки'
            setHabitError(errorMessage)
            notify.error(errorMessage)
            throw err
        } finally {
            setCurrentHabitLoading(false)
        }
    }, [getHabit])

    // Автозагрузка конкретной привычки при передаче habitId
    useEffect(() => {
        if (habitId && session?.user?.id && status === 'authenticated') {
            getHabitSmart(habitId)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [habitId, session?.user?.id, status])

    useEffect(() => {
        if (status === 'loading') return
        if (session?.user?.id) {
            fetchHabit()
        } else {
            setHabitLoading(false)
            setHabits([])
            setCurrentHabit(null)
        }
    }, [session?.user?.id, status])

    // Функция для перезагрузки текущей привычки
    const refreshCurrentHabit = useCallback(async () => {
        if (habitId) {
            await getHabitSmart(habitId)
        }
    }, [habitId, getHabitSmart])

    // Пересчет streak для всех привычек
    const recalculateStreaks = async () => {
        try {
            setHabitError(null)
            const response = await fetch('/api/habits/recalculate-streaks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Ошибка пересчета streak')
            }

            const result = await response.json()
            console.log('Streak пересчитаны:', result)
            
            // Обновляем список привычек после пересчета
            await fetchHabit()
            
            // Обновляем текущую привычку если она есть
            if (habitId) {
                await getHabitSmart(habitId)
            }
            
            notify.success(`Пересчитаны streak для ${result.updatedCount} привычек`)
            
            return result

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка пересчета streak'
            setHabitError(errorMessage)
            notify.error(errorMessage)
            throw err
        }
    }

    return {
        // Список привычек
        habits,
        habitLoading,
        habitError,

        // Текущая привычка (при передаче habitId)
        currentHabit,
        currentHabitLoading,

        // Методы работы с привычками
        createHabit,
        updateHabit,
        deleteHabit,
        getHabit,
        getHabitSmart,

        // Утилиты
        refetch: fetchHabit,
        refreshCurrentHabit,
        recalculateStreaks,
        clearError: () => setHabitError(null),
        clearCurrentHabit: () => setCurrentHabit(null)
    }
}
