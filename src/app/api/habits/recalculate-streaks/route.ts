import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { calculateCurrentStreak, calculateLongestStreak } from '@/utils/habitHelpers'

async function getUserProfile(userId: string) {
    return await prisma.profile.findFirst({
        where: { userId },
        select: { id: true }
    })
}

// POST /api/habits/recalculate-streaks - пересчет streak для всех привычек пользователя
export async function POST() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
        }

        const profile = await getUserProfile(session.user.id)
        if (!profile) {
            return NextResponse.json({ error: "Профиль не найден" }, { status: 404 })
        }

        // Получаем все привычки пользователя
        const habits = await prisma.habit.findMany({
            where: { profileId: profile.id },
            include: {
                entries: {
                    orderBy: { date: 'desc' }
                }
            }
        })

        let updatedCount = 0

        // Пересчитываем streak для каждой привычки
        for (const habit of habits) {
            const newCurrentStreak = calculateCurrentStreak(habit.entries, habit.frequency)
            const newLongestStreak = calculateLongestStreak(habit.entries, habit.frequency)

            // Обновляем только если значения изменились
            if (newCurrentStreak !== habit.currentStreak || newLongestStreak !== habit.longestStreak) {
                await prisma.habit.update({
                    where: { id: habit.id },
                    data: {
                        currentStreak: newCurrentStreak,
                        longestStreak: Math.max(newLongestStreak, habit.longestStreak)
                    }
                })
                updatedCount++
            }
        }

        return NextResponse.json({
            message: `Пересчитаны streak для ${updatedCount} привычек`,
            updatedCount
        }, { status: 200 })

    } catch (error) {
        console.error('Ошибка пересчета streak:', error)
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
    }
} 