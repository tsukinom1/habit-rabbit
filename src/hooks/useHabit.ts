import { TProfile } from "@/types/profile"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { notify } from "./useNotification"
import { THabit } from "@/types/habit"

export const useHabit = () => {
    const { data: session, status } = useSession()
    const [habits, setHabits] = useState<THabit[]>([])
    const [habitLoading, setHabitLoading] = useState<boolean>(true)
    const [habitError, setHabitError] = useState<string | null>(null)

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

    useEffect(() => {
        if (status === 'loading') return
        if (session?.user?.id) {
            fetchHabit()
        } else {
            setHabitLoading(false)
            setHabits([])
        }
    }, [session?.user?.id, status])

    return {
        habits,
        habitLoading,
        habitError,
        createHabit,
        refetch: fetchHabit
    }
}
