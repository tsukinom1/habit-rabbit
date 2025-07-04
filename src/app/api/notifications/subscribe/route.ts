import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import webpush from 'web-push'

// Настройка VAPID ключей
const vapidEmail = process.env.VAPID_EMAIL || 'dlyattnavern@gmail.com'
const formattedEmail = vapidEmail.startsWith('mailto:') ? vapidEmail : `mailto:${vapidEmail}`

webpush.setVapidDetails(
  formattedEmail,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const { subscription, settings, timezone } = await request.json()
    
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Неверные данные подписки' }, { status: 400 })
    }

    // Сохраняем или обновляем подписку
    const existingSubscription = await prisma.pushSubscription.findFirst({
      where: {
        userId: session.user.id,
        endpoint: subscription.endpoint
      }
    })

    let pushSubscription
    
    if (existingSubscription) {
      // Обновляем существующую подписку
      pushSubscription = await prisma.pushSubscription.update({
        where: { id: existingSubscription.id },
        data: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          isActive: true,
          // Настройки уведомлений
          habitReminders: settings?.habitReminders ?? true,
          streakBreaking: settings?.streakWarnings ?? true,
          achievements: settings?.achievements ?? true,
          weeklyReports: settings?.weeklySummary ?? false,
          reminderTime: settings?.greetingTime ?? '10:00'
        }
      })
    } else {
      // Создаем новую подписку
      pushSubscription = await prisma.pushSubscription.create({
        data: {
          userId: session.user.id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          isActive: true,
          // Настройки уведомлений  
          habitReminders: settings?.habitReminders ?? true,
          streakBreaking: settings?.streakWarnings ?? true,
          achievements: settings?.achievements ?? true,
          weeklyReports: settings?.weeklySummary ?? false,
          reminderTime: settings?.greetingTime ?? '10:00'
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      subscriptionId: pushSubscription.id 
    })
    
  } catch (error) {
    console.error('Ошибка сохранения уведомеления:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера. Попробуйте позже' },
      { status: 500 }
    )
  }
} 