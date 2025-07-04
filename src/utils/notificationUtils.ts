import webpush from 'web-push'
import { prisma } from '@/lib/prisma'

// Настройка VAPID ключей
const vapidEmail = process.env.VAPID_EMAIL || 'dlyattnavern@gmail.com'
const formattedEmail = vapidEmail.startsWith('mailto:') ? vapidEmail : `mailto:${vapidEmail}`

webpush.setVapidDetails(
  formattedEmail,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
)

export type NotificationType = 
  | 'DAILY_GREETING'     // Ежедневное приветствие
  | 'HABIT_REMINDER'     // Напоминание о привычке
  | 'STREAK_WARNING'     // Предупреждение о streak
  | 'ACHIEVEMENT'        // Достижения
  | 'WEEKLY_SUMMARY'     // Еженедельная сводка

export interface NotificationPayload {
  title: string
  body: string
  type: NotificationType
  data?: {
    url?: string
    habitId?: string
    userId?: string
    [key: string]: any
  }
}

// Мотивирующие сообщения для ежедневных приветствий
const DAILY_GREETINGS = [
  {
    title: '🌅 Доброе утро!',
    body: 'Новый день — новые возможности! Время работать над своими привычками.'
  },
  {
    title: '☀️ Привет, чемпион!',
    body: 'Каждый день приближает тебя к цели. Начни с малого!'
  },
  {
    title: '💪 Время действовать!',
    body: 'Успех — это сумма маленьких усилий. Что сделаешь сегодня?'
  },
  {
    title: '🎯 Новый день, новые победы!',
    body: 'Привычки строят будущее. Какую привычку выполнишь первой?'
  },
  {
    title: '🚀 Поехали!',
    body: 'Твой путь к лучшей версии себя начинается прямо сейчас!'
  }
]

// Получение случайного приветствия
export function getRandomGreeting(): { title: string; body: string } {
  return DAILY_GREETINGS[Math.floor(Math.random() * DAILY_GREETINGS.length)]
}

// Отправка уведомления конкретному пользователю
export async function sendNotificationToUser(
  userId: string, 
  payload: NotificationPayload
): Promise<{ success: boolean; sent: number; failed: number }> {
  try {
    // Получаем активные подписки пользователя
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId: userId,
        isActive: true
      }
    })

    if (subscriptions.length === 0) {
      console.log(`No active subscriptions for user ${userId}`)
      return { success: false, sent: 0, failed: 0 }
    }

    // Отправляем уведомления
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        }

        return webpush.sendNotification(
          pushSubscription,
          JSON.stringify(payload)
        )
      })
    )

    const successful = results.filter(result => result.status === 'fulfilled').length
    const failed = results.filter(result => result.status === 'rejected').length

    // Логируем ошибки
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to send notification to subscription ${index}:`, result.reason)
      }
    })

    return { success: true, sent: successful, failed }
    
  } catch (error) {
    console.error('Error sending notification to user:', error)
    return { success: false, sent: 0, failed: 1 }
  }
}

// Отправка ежедневного приветствия
export async function sendDailyGreeting(userId: string) {
  const greeting = getRandomGreeting()
  
  const payload: NotificationPayload = {
    title: greeting.title,
    body: greeting.body,
    type: 'DAILY_GREETING',
    data: {
      url: '/habits',
      userId: userId,
      timestamp: new Date().toISOString()
    }
  }

  return sendNotificationToUser(userId, payload)
}

// Отправка напоминания о привычке
export async function sendHabitReminder(habitId: string, userId: string, habitTitle: string) {
  const payload: NotificationPayload = {
    title: `⏰ Время для "${habitTitle}"`,
    body: 'Не забудь выполнить свою привычку! Можешь отметить прямо здесь.',
    type: 'HABIT_REMINDER',
    data: {
      url: `/habits/${habitId}`,
      habitId: habitId,
      userId: userId
    }
  }

  return sendNotificationToUser(userId, payload)
}

// Отправка предупреждения о streak
export async function sendStreakWarning(userId: string, habitTitle: string, currentStreak: number) {
  const payload: NotificationPayload = {
    title: `🔥 Осторожно! Streak под угрозой`,
    body: `У тебя ${currentStreak} дней подряд с "${habitTitle}". Не прерывай серию!`,
    type: 'STREAK_WARNING',
    data: {
      url: '/habits',
      userId: userId,
      habitTitle: habitTitle,
      currentStreak: currentStreak
    }
  }

  return sendNotificationToUser(userId, payload)
}

// Отправка уведомления о достижении
export async function sendAchievementNotification(
  userId: string, 
  achievement: string, 
  description: string
) {
  const payload: NotificationPayload = {
    title: `🏆 ${achievement}`,
    body: description,
    type: 'ACHIEVEMENT',
    data: {
      url: '/habits',
      userId: userId,
      achievement: achievement
    }
  }

  return sendNotificationToUser(userId, payload)
}

// Получение всех пользователей с активными подписками
export async function getUsersWithActiveSubscriptions() {
  return prisma.pushSubscription.findMany({
    where: {
      isActive: true
    },
    include: {
      user: {
        include: {
          profile: {
            select: {
              timezone: true,
              habits: {
                where: {
                  isActive: true
                },
                select: {
                  id: true,
                  title: true,
                  reminderTime: true,
                  isActive: true,
                  currentStreak: true,
                  longestStreak: true
                }
              }
            }
          }
        }
      }
    }
  })
}

// Проверка времени для отправки уведомлений
export function shouldSendNotificationAtTime(targetTime: string): boolean {
  const now = new Date()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  return currentTime === targetTime
}

// Проверка является ли время подходящим для отправки (с учетом часового пояса)
export function isTimeToSend(targetTime: string, timezone: string = 'UTC', toleranceMinutes: number = 1): boolean {
  try {
    // Получаем текущее время в часовом поясе пользователя
    const now = new Date()
    const userTime = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    }).format(now)
    
    const [currentHour, currentMinute] = userTime.split(':').map(Number)
    const [targetHour, targetMinute] = targetTime.split(':').map(Number)
    
    // Проверяем валидность времени
    if (isNaN(targetHour) || isNaN(targetMinute) || targetHour < 0 || targetHour > 23 || targetMinute < 0 || targetMinute > 59) {
      console.warn(`Invalid time format: ${targetTime}`)
      return false
    }
    
    // Вычисляем разность в минутах
    const currentTotalMinutes = currentHour * 60 + currentMinute
    const targetTotalMinutes = targetHour * 60 + targetMinute
    
    const diffMinutes = Math.abs(currentTotalMinutes - targetTotalMinutes)
    
    // Учитываем переход через полночь (например, 23:59 и 00:01)
    const diffMinutesAcrossMidnight = Math.abs(diffMinutes - (24 * 60))
    
    const finalDiff = Math.min(diffMinutes, diffMinutesAcrossMidnight)
    
    console.log(`Time check (${timezone}): current=${currentHour}:${currentMinute.toString().padStart(2, '0')}, target=${targetTime}, diff=${finalDiff}min, tolerance=${toleranceMinutes}min`)
    
    return finalDiff <= toleranceMinutes
    
  } catch (error) {
    console.error(`Error checking time for timezone ${timezone}:`, error)
    // Fallback to server time
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const [targetHour, targetMinute] = targetTime.split(':').map(Number)
    
    if (isNaN(targetHour) || isNaN(targetMinute)) return false
    
    const currentTotalMinutes = currentHour * 60 + currentMinute
    const targetTotalMinutes = targetHour * 60 + targetMinute
    const diffMinutes = Math.abs(currentTotalMinutes - targetTotalMinutes)
    const finalDiff = Math.min(diffMinutes, Math.abs(diffMinutes - (24 * 60)))
    
    console.log(`Time check (fallback): current=${currentHour}:${currentMinute.toString().padStart(2, '0')}, target=${targetTime}, diff=${finalDiff}min`)
    
    return finalDiff <= toleranceMinutes
  }
} 