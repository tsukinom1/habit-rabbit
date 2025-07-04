import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const { habitId, snoozeMinutes = 60 } = await request.json()

    if (!habitId) {
      return NextResponse.json({ error: 'Habit ID обязателен' }, { status: 400 })
    }

    // Проверяем что привычка принадлежит пользователю
    const habit = await prisma.habit.findFirst({
      where: {
        id: habitId,
        profile: {
          userId: session.user.id
        }
      }
    })

    if (!habit) {
      return NextResponse.json({ error: 'Привычка не найдена' }, { status: 404 })
    }

    // Создаем отложенное напоминание
    const snoozeTime = new Date()
    snoozeTime.setMinutes(snoozeTime.getMinutes() + snoozeMinutes)

    // Сохраняем в scheduled notifications для будущей отправки
    await prisma.scheduledNotification.create({
      data: {
        userId: session.user.id,
        habitId: habitId,
        title: `⏰ Напоминание: "${habit.title}"`,
        body: 'Отложенное напоминание о выполнении привычки',
        type: 'HABIT_REMINDER',
        scheduledAt: snoozeTime,
        status: 'PENDING'
      }
    })

    console.log(`⏰ Snoozed habit ${habitId} for ${snoozeMinutes} minutes until ${snoozeTime.toISOString()}`)

    return NextResponse.json({
      success: true,
      message: `Напоминание отложено на ${snoozeMinutes} минут`,
      snoozeUntil: snoozeTime.toISOString()
    })
    
  } catch (error) {
    console.error('Error snoozing notification:', error)
    return NextResponse.json(
      { error: 'Ошибка при отложении напоминания' },
      { status: 500 }
    )
  }
} 