import { TProfile } from "@/types/profile"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { notify } from "./useNotification"


export const useProfile = () => {
    const { data: session, status } = useSession()
    const [profile, setProfile] = useState<TProfile | null>(null)
    const [profileLoading, setProfileLoading] = useState(true)
    const [profileError, setProfileError] = useState<string | null>(null)

    const fetchProfile = async () => {
        if (!session?.user?.id) {
            setProfileLoading(false)
            return
        }
        try {
            setProfileLoading(true)
            setProfileError(null)

            const response = await fetch('/api/profile')

            if (!response.ok) {
                if (response.status === 401) {
                    notify.error('Профиль не найден')
                    throw new Error('Профиль не найден')

                } else if (response.status === 500) {
                    notify.error('Ошибка сервера')
                    throw new Error('Ошибка сервера')
                } else {
                    notify.error('Ошибка при получении профиля')
                    throw new Error('Ошибка при получении профиля')
                }
            }

            const data = await response.json()
            setProfile(data)
        } catch (err) {
            notify.error('Ошибка при получении профиля')
            setProfileError(err instanceof Error ? err.message : 'Ошибка при получении профиля')
        } finally {
            setProfileLoading(false)
        }
    }

    const updateProfile = async (updateData: Partial<TProfile>) => {
        try {
            setProfileError(null)

            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                if (response.status === 400) {
                    notify.error('Укажите все обязательные поля')
                    throw new Error('Укажите все обязательные поля')
                } else if (response.status === 401) {
                    notify.error('Не авторизован')
                    throw new Error('Не авторизован')
                } else {
                    notify.error(errorData.error || 'Ошибка при обновлении профиля')
                    throw new Error(errorData.error || 'Ошибка при обновлении профиля')
                }
            }

            const updatedProfile = await response.json()
            setProfile(updatedProfile)
            return updatedProfile
        } catch (err) {
            notify.error('Ошибка при обновлении профиля')
            setProfileError(err instanceof Error ? err.message : 'Ошибка при обновлении профиля')
            throw err
        }
    }

    useEffect(() => {
        if (status === 'loading') return
        if (session?.user?.id) {
            fetchProfile()
        } else {
            setProfileLoading(false)
        }
    }, [session?.user?.id, status])

    return {
        profile,
        profileLoading,
        profileError,
        updateProfile,
        refetch: fetchProfile
    }
}
