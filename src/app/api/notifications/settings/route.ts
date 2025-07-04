import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - получение настроек
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Получаем активную подписку пользователя с профилем
    const subscription = await prisma.pushSubscription.findFirst({
      where: {
        userId: session.user.id,
        isActive: true
      },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Подписка не найдена' }, { status: 404 })
    }

    // Возвращаем настройки 
    const settings = {
      dailyGreeting: true, // Всегда включено пока
      habitReminders: subscription.habitReminders,
      streakWarnings: subscription.streakBreaking,
      achievements: subscription.achievements,
      weeklySummary: subscription.weeklyReports,
      greetingTime: subscription.reminderTime || '10:00'
    }

    return NextResponse.json(settings)
    
  } catch (error) {
    console.error('Ошибка получения настроек:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

// PUT - обновление настроек
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const settings = await request.json()

    // Обновляем настройки в активной подписке
    const result = await prisma.pushSubscription.updateMany({
      where: {
        userId: session.user.id,
        isActive: true
      },
      data: {
        habitReminders: settings.habitReminders ?? true,
        streakBreaking: settings.streakWarnings ?? true,
        achievements: settings.achievements ?? true,
        weeklyReports: settings.weeklySummary ?? false,
        reminderTime: settings.greetingTime ?? '10:00'
      }
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'Подписка не найдена' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Ошибка обновления настроек:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
} 