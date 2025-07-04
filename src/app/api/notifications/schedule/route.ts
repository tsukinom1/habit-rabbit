import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { 
  sendDailyGreeting, 
  sendHabitReminder, 
  sendStreakWarning,
  sendAchievementNotification,
  getUsersWithActiveSubscriptions,
  isTimeToSend 
} from '@/utils/notificationUtils'

export async function POST(request: NextRequest) {
  try {
    console.log('🕐 Notification scheduler started at', new Date().toISOString())
    
    // Получаем всех пользователей с активными подписками
    const subscriptions = await getUsersWithActiveSubscriptions()
    console.log(`📋 Found ${subscriptions.length} users with active subscriptions`)

    let totalSent = 0
    let totalFailed = 0

    for (const subscription of subscriptions) {
      const user = subscription.user
      if (!user?.profile) continue

      const userId = user.id
      const profile = user.profile
      
      console.log(`👤 Processing user ${userId}`)

      // 1. ЕЖЕДНЕВНЫЕ ПРИВЕТСТВИЯ
      if (subscription.isActive) {
        const greetingTime = subscription.reminderTime || '10:00'
        const userTimezone = profile.timezone || 'UTC'
        
        if (isTimeToSend(greetingTime, userTimezone, 2)) { // 2 минуты толеранс
          console.log(`🌅 Sending daily greeting to user ${userId} at ${greetingTime}`)
          
          const result = await sendDailyGreeting(userId)
          totalSent += result.sent
          totalFailed += result.failed
          
          // Пауза между отправками
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      // 2. НАПОМИНАНИЯ О ПРИВЫЧКАХ
      if (subscription.habitReminders && profile.habits) {
        for (const habit of profile.habits) {
          if (!habit.reminderTime || !habit.isActive) continue
          
          if (isTimeToSend(habit.reminderTime, profile.timezone || 'UTC', 2)) {
            console.log(`⏰ Sending habit reminder for "${habit.title}" to user ${userId}`)
            
            const result = await sendHabitReminder(habit.id, userId, habit.title)
            totalSent += result.sent
            totalFailed += result.failed
            
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        }
      }

      // 3. STREAK ПРЕДУПРЕЖДЕНИЯ
      if (subscription.streakBreaking && profile.habits) {
        for (const habit of profile.habits) {
          if (!habit.isActive) continue
          
          // Проверяем была ли выполнена привычка сегодня
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          const todayEntry = await prisma.habitEntry.findFirst({
            where: {
              habitId: habit.id,
              date: {
                gte: today,
                lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
              }
            }
          })

          // Если привычка не выполнена и есть streak больше 3 дней
          if (!todayEntry && habit.currentStreak >= 3) {
            const currentHour = new Date().getHours()
            
            // Отправляем предупреждения вечером (18:00-22:00)
            if (currentHour >= 18 && currentHour <= 22) {
              console.log(`🔥 Sending streak warning for "${habit.title}" (${habit.currentStreak} days) to user ${userId}`)
              
              const result = await sendStreakWarning(userId, habit.title, habit.currentStreak)
              totalSent += result.sent
              totalFailed += result.failed
              
              await new Promise(resolve => setTimeout(resolve, 100))
            }
          }
        }
      }

      // 4. ПРОВЕРКА ДОСТИЖЕНИЙ
      if (subscription.achievements && profile.habits) {
        for (const habit of profile.habits) {
          if (!habit.isActive) continue
          
          // Проверяем milestone достижения
          const { currentStreak, longestStreak } = habit
          
          // Достижения за streak
          if (currentStreak > 0 && shouldCelebrateStreak(currentStreak)) {
            console.log(`🏆 Sending achievement notification for ${currentStreak} day streak to user ${userId}`)
            
            const achievement = getStreakAchievementMessage(currentStreak)
            const result = await sendAchievementNotification(
              userId, 
              achievement.title, 
              achievement.description
            )
            totalSent += result.sent
            totalFailed += result.failed
            
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        }
      }
    }

    console.log(`✅ Scheduler completed. Sent: ${totalSent}, Failed: ${totalFailed}`)

    return NextResponse.json({
      success: true,
      processed: subscriptions.length,
      sent: totalSent,
      failed: totalFailed,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error in notification scheduler:', error)
    return NextResponse.json(
      { error: 'Scheduler failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Проверяем нужно ли поздравить с streak
function shouldCelebrateStreak(streak: number): boolean {
  // Поздравляем на важных milestone
  const milestones = [3, 7, 14, 21, 30, 50, 100, 365]
  return milestones.includes(streak)
}

// Получаем сообщение о достижении
function getStreakAchievementMessage(streak: number): { title: string; description: string } {
  if (streak === 3) {
    return {
      title: 'Первые шаги! 🎯',
      description: '3 дня подряд! Отличное начало, продолжай в том же духе!'
    }
  } else if (streak === 7) {
    return {
      title: 'Неделя успеха! 📅',
      description: 'Целая неделя выполнения привычки! Ты на правильном пути.'
    }
  } else if (streak === 14) {
    return {
      title: 'Две недели силы! 💪',
      description: '14 дней подряд! Привычка начинает становиться частью тебя.'
    }
  } else if (streak === 21) {
    return {
      title: 'Привычка сформирована! 🏗️',
      description: '21 день — научно доказанный срок формирования привычки!'
    }
  } else if (streak === 30) {
    return {
      title: 'Месяц победы! 🌟',
      description: 'Целый месяц! Ты доказал, что можешь всё что угодно!'
    }
  } else if (streak === 50) {
    return {
      title: 'Полувековой рубеж! 🎊',
      description: '50 дней подряд! Невероятная самодисциплина!'
    }
  } else if (streak === 100) {
    return {
      title: 'Сотня дней! 💯',
      description: '100 дней подряд! Ты легенда самодисциплины!'
    }
  } else if (streak === 365) {
    return {
      title: 'ЦЕЛЫЙ ГОД! 🎆',
      description: '365 дней подряд! Ты изменил свою жизнь навсегда!'
    }
  }
  
  return {
    title: `${streak} дней подряд! 🔥`,
    description: 'Потрясающий результат! Продолжай двигаться к цели!'
  }
} 