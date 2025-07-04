'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

// Типы уведомлений
export type NotificationType = 
  | 'DAILY_GREETING'     // Ежедневное приветствие (10:00)
  | 'HABIT_REMINDER'     // Напоминание о привычке
  | 'STREAK_WARNING'     // Предупреждение о streak
  | 'ACHIEVEMENT'        // Достижения
  | 'WEEKLY_SUMMARY'     // Еженедельная сводка

export interface NotificationSettings {
  dailyGreeting: boolean
  habitReminders: boolean
  streakWarnings: boolean
  achievements: boolean
  weeklySummary: boolean
  greetingTime: string  // "10:00"
}

export const usePushNotifications = () => {
  const { data: session } = useSession()
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [settings, setSettings] = useState<NotificationSettings>({
    dailyGreeting: true,
    habitReminders: true,
    streakWarnings: true,
    achievements: true,
    weeklySummary: false,
    greetingTime: '10:00'
  })
  const [isLoading, setIsLoading] = useState(false)

  // Проверка поддержки push уведомлений
  useEffect(() => {
    const checkSupport = () => {
      if (typeof window !== 'undefined') {
        const supported = 'serviceWorker' in navigator && 'PushManager' in window
        setIsSupported(supported)
        
        if (supported) {
          checkSubscription()
        }
      }
    }
    
    checkSupport()
  }, [])

  // Загружаем настройки при изменении сессии
  useEffect(() => {
    if (session?.user?.id && isSubscribed) {
      loadSettings()
    }
  }, [session?.user?.id, isSubscribed])

  // Проверка текущей подписки
  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.getSubscription()
      
      if (sub) {
        setSubscription(sub)
        setIsSubscribed(true)
        // Загружаем настройки с сервера
        await loadSettings()
      }
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  // Загрузка настроек пользователя
  const loadSettings = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/notifications/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  // Подписка на уведомления
  const subscribe = async () => {
    if (!isSupported || !session?.user?.id) {
      throw new Error('Push notifications not supported or user not authenticated')
    }

    setIsLoading(true)
    
    try {
      // Запрос разрешения
      const permission = await Notification.requestPermission()
      
      if (permission !== 'granted') {
        throw new Error('Permission denied')
      }

      // Регистрация Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // Создание подписки
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      })

      // Отправка подписки на сервер
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: sub,
          settings: settings
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save subscription')
      }

      setSubscription(sub)
      setIsSubscribed(true)
      
      return sub
    } catch (error) {
      console.error('Error subscribing:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Отписка от уведомлений
  const unsubscribe = async () => {
    if (!subscription) return

    setIsLoading(true)
    
    try {
      await subscription.unsubscribe()
      
      // Удаление с сервера
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint
        }),
      })

      setSubscription(null)
      setIsSubscribed(false)
    } catch (error) {
      console.error('Error unsubscribing:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Обновление настроек
  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    if (!isSubscribed) return

    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)

    try {
      const response = await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSettings),
      })

      if (!response.ok) {
        throw new Error('Failed to update settings')
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      // Возвращаем старые настройки при ошибке
      setSettings(settings)
      throw error
    }
  }



  return {
    isSupported,
    isSubscribed,
    isLoading,
    settings,
    subscribe,
    unsubscribe,
    updateSettings,
  }
} 