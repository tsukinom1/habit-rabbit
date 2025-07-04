import { useSession } from "next-auth/react"
import { useState } from "react"
import { THabitEntry } from "@/types/habit"
import { notify } from "./useNotification"

interface HabitEntriesResponse {
    entries: THabitEntry[]
    pagination: {
        total: number
        limit: number
        offset: number
        hasMore: boolean
    }
}

interface CreateEntryData {
    date: string
    value?: number
    note?: string
    mood?: 'TERRIBLE' | 'BAD' | 'NEUTRAL' | 'GOOD' | 'EXCELLENT'
}

interface UpdateEntryData extends Partial<CreateEntryData> {}

const useHabitEntry = (habitId?: string) => {
    const { data: session } = useSession()
    const [habitEntries, setHabitEntries] = useState<THabitEntry[]>([])
    const [habitEntryLoading, setHabitEntryLoading] = useState<boolean>(false)
    const [habitEntryError, setHabitEntryError] = useState<string | null>(null)
    const [pagination, setPagination] = useState({
        total: 0,
        limit: 30,
        offset: 0,
        hasMore: false
    })

    // Получение записей привычки
    const fetchHabitEntries = async (
        targetHabitId?: string,
        options: {
            limit?: number
            offset?: number
            startDate?: string
            endDate?: string
            reset?: boolean
        } = {}
    ) => {
        const effectiveHabitId = targetHabitId || habitId
        if (!session?.user?.id || !effectiveHabitId) {
            setHabitEntryLoading(false)
            return
        }

        try {
            setHabitEntryLoading(true)
            setHabitEntryError(null)

            const searchParams = new URLSearchParams()
            if (options.limit) searchParams.set('limit', options.limit.toString())
            if (options.offset) searchParams.set('offset', options.offset.toString())
            if (options.startDate) searchParams.set('startDate', options.startDate)
            if (options.endDate) searchParams.set('endDate', options.endDate)

            const response = await fetch(`/api/habits/${effectiveHabitId}/entries?${searchParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                const errorData = await response.json()
                let errorMessage = 'Ошибка при получении записей привычки'
                
                if (response.status === 401) {
                    errorMessage = 'Необходимо войти в систему'
                } else if (response.status === 404) {
                    errorMessage = 'Привычка не найдена'
                } else {
                    errorMessage = errorData.error || errorMessage
                }
                
                throw new Error(errorMessage)
            }

            const data: HabitEntriesResponse = await response.json()
            
            if (options.reset || options.offset === 0) {
                setHabitEntries(data.entries)
            } else {
                setHabitEntries(prev => [...prev, ...data.entries])
            }
            
            setPagination(data.pagination)
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка при получении записей привычки'
            setHabitEntryError(errorMessage)
            notify.error(errorMessage)
        } finally {
            setHabitEntryLoading(false)
        }
    }

    // Создание новой записи
    const createHabitEntry = async (targetHabitId: string, entryData: CreateEntryData) => {
        try {
            setHabitEntryError(null)

            const response = await fetch(`/api/habits/${targetHabitId}/entries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(entryData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                let errorMessage = 'Ошибка при создании записи'
                
                if (response.status === 400) {
                    errorMessage = errorData.error || 'Некорректные данные'
                } else if (response.status === 401) {
                    errorMessage = 'Необходимо войти в систему'
                } else if (response.status === 409) {
                    errorMessage = 'Запись на эту дату уже существует'
                } else {
                    errorMessage = errorData.error || errorMessage
                }
                
                throw new Error(errorMessage)
            }

            const newEntry = await response.json()
            
            // Добавляем новую запись в начало списка
            setHabitEntries(prev => [newEntry, ...prev])
            setPagination(prev => ({ ...prev, total: prev.total + 1 }))
            
            notify.success('Запись успешно создана!')
            return newEntry
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка при создании записи'
            setHabitEntryError(errorMessage)
            notify.error(errorMessage)
            throw err
        }
    }

    // Обновление записи
    const updateHabitEntry = async (
        targetHabitId: string, 
        entryId: string, 
        entryData: UpdateEntryData
    ) => {
        try {
            setHabitEntryError(null)

            const response = await fetch(`/api/habits/${targetHabitId}/entries/${entryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(entryData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                let errorMessage = 'Ошибка при обновлении записи'
                
                if (response.status === 400) {
                    errorMessage = errorData.error || 'Некорректные данные'
                } else if (response.status === 401) {
                    errorMessage = 'Необходимо войти в систему'
                } else if (response.status === 404) {
                    errorMessage = 'Запись не найдена'
                } else if (response.status === 409) {
                    errorMessage = 'Запись на эту дату уже существует'
                } else {
                    errorMessage = errorData.error || errorMessage
                }
                
                throw new Error(errorMessage)
            }

            const updatedEntry = await response.json()
            
            // Обновляем запись в списке
            setHabitEntries(prev => 
                prev.map(entry => entry.id === entryId ? updatedEntry : entry)
            )
            
            notify.success('Запись успешно обновлена!')
            return updatedEntry
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка при обновлении записи'
            setHabitEntryError(errorMessage)
            notify.error(errorMessage)
            throw err
        }
    }

    // Удаление записи
    const deleteHabitEntry = async (targetHabitId: string, entryId: string) => {
        try {
            setHabitEntryError(null)

            const response = await fetch(`/api/habits/${targetHabitId}/entries/${entryId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                const errorData = await response.json()
                let errorMessage = 'Ошибка при удалении записи'
                
                if (response.status === 401) {
                    errorMessage = 'Необходимо войти в систему'
                } else if (response.status === 404) {
                    errorMessage = 'Запись не найдена'
                } else {
                    errorMessage = errorData.error || errorMessage
                }
                
                throw new Error(errorMessage)
            }

            // Удаляем запись из списка
            setHabitEntries(prev => prev.filter(entry => entry.id !== entryId))
            setPagination(prev => ({ ...prev, total: prev.total - 1 }))
            
            notify.success('Запись успешно удалена!')
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка при удалении записи'
            setHabitEntryError(errorMessage)
            notify.error(errorMessage)
            throw err
        }
    }

    // Получение конкретной записи
    const getHabitEntry = async (targetHabitId: string, entryId: string) => {
        try {
            setHabitEntryError(null)

            const response = await fetch(`/api/habits/${targetHabitId}/entries/${entryId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Ошибка при получении записи')
            }

            return await response.json()
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка при получении записи'
            setHabitEntryError(errorMessage)
            notify.error(errorMessage)
            throw err
        }
    }

    // Загрузка следующей страницы (для бесконечной прокрутки)
    const loadMoreEntries = async (targetHabitId?: string) => {
        if (!pagination.hasMore || habitEntryLoading) return
        
        await fetchHabitEntries(targetHabitId, {
            offset: pagination.offset + pagination.limit,
            limit: pagination.limit
        })
    }

    // Обновление списка записей
    const refreshEntries = async (targetHabitId?: string) => {
        await fetchHabitEntries(targetHabitId, { reset: true })
    }

    return {
        // Состояние
        habitEntries,
        habitEntryLoading,
        habitEntryError,
        pagination,
        
        // Методы
        fetchHabitEntries,
        createHabitEntry,
        updateHabitEntry,
        deleteHabitEntry,
        getHabitEntry,
        loadMoreEntries,
        refreshEntries,
        
        // Утилиты
        clearError: () => setHabitEntryError(null),
        clearEntries: () => setHabitEntries([])
    }
}

export default useHabitEntry