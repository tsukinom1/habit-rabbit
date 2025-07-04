import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { calculateCurrentStreak, calculateLongestStreak } from '@/utils/habitHelpers'


async function getUserProfile(userId: string) {
    return await prisma.profile.findFirst({
        where: { userId },
        select: { id: true }
    })
}

// Проверяем принадлежность привычки пользователю
async function validateHabitOwnership(habitId: string, profileId: string) {
    const habit = await prisma.habit.findFirst({
        where: {
            id: habitId,
            profileId: profileId
        }
    })
    return habit
}

// GET /api/habits/[id]/entries - получение записей привычки
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
        }

        const profile = await getUserProfile(session.user.id)
        if (!profile) {
            return NextResponse.json({ error: "Профиль не найден" }, { status: 404 })
        }

        // Проверяем права доступа к привычке
        const habit = await validateHabitOwnership(id, profile.id)
        if (!habit) {
            return NextResponse.json({ error: "Привычка не найдена или нет доступа" }, { status: 404 })
        }

        // Получаем параметры запроса для пагинации и фильтрации
        const url = new URL(request.url)
        const limit = parseInt(url.searchParams.get('limit') || '30')
        const offset = parseInt(url.searchParams.get('offset') || '0')
        const startDate = url.searchParams.get('startDate')
        const endDate = url.searchParams.get('endDate')

        // Строим условия фильтрации
        const whereConditions: any = {
            habitId: id
        }

        if (startDate || endDate) {
            whereConditions.date = {}
            if (startDate) whereConditions.date.gte = new Date(startDate)
            if (endDate) whereConditions.date.lte = new Date(endDate)
        }

        // Получаем записи с пагинацией
        const entries = await prisma.habitEntry.findMany({
            where: whereConditions,
            orderBy: { date: 'desc' },
            take: Math.min(limit, 100), // Ограничиваем максимум 100 записей за раз
            skip: offset,
            include: {
                habit: {
                    select: {
                        id: true,
                        title: true,
                        icon: true,
                        unit: true
                    }
                }
            }
        })

        // Получаем общее количество для пагинации
        const total = await prisma.habitEntry.count({
            where: whereConditions
        })

        return NextResponse.json({
            entries,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total
            }
        }, { status: 200 })

    } catch (error) {
        console.error('Ошибка получения записей:', error)
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
    }
}

// POST /api/habits/[id]/entries - создание новой записи
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
        }

        const profile = await getUserProfile(session.user.id)
        if (!profile) {
            return NextResponse.json({ error: "Профиль не найден" }, { status: 404 })
        }

        // Проверяем права доступа к привычке
        const habit = await validateHabitOwnership(id, profile.id)
        if (!habit) {
            return NextResponse.json({ error: "Привычка не найдена или нет доступа" }, { status: 404 })
        }

        const body = await request.json()

        // Валидация обязательных полей
        if (!body.date) {
            return NextResponse.json({ error: "Дата обязательна" }, { status: 400 })
        }

        // Безопасные поля для создания записи
        const allowedFields = {
            date: new Date(body.date),
            value: body.value ? Number(body.value) : null,
            note: body.note?.trim() || null,
            mood: body.mood || null
        }

        // Проверяем валидность настроения
        const validMoods = ['TERRIBLE', 'BAD', 'NEUTRAL', 'GOOD', 'EXCELLENT']
        if (allowedFields.mood && !validMoods.includes(allowedFields.mood)) {
            return NextResponse.json({ error: "Некорректное настроение" }, { status: 400 })
        }

        // Проверяем, что запись на эту дату еще не существует
        const existingEntry = await prisma.habitEntry.findUnique({
            where: {
                habitId_date: {
                    habitId: id,
                    date: allowedFields.date
                }
            }
        })

        if (existingEntry) {
            return NextResponse.json({
                error: "Запись на эту дату уже существует"
            }, { status: 409 })
        }

        // Вычисляем прогресс выполнения
        const progressPercentage = habit.targetValue && habit.targetValue > 0 && allowedFields.value
            ? Math.min((allowedFields.value / habit.targetValue) * 100, 100)
            : 0

        const isCompleted = habit.targetValue && allowedFields.value
            ? allowedFields.value >= habit.targetValue
            : false

        // Создаем запись в транзакции
        const result = await prisma.$transaction(async (tx) => {
            const entry = await tx.habitEntry.create({
                data: {
                    ...allowedFields,
                    habitId: id,
                    progressPercentage,
                    isCompleted
                },
                include: {
                    habit: {
                        select: {
                            id: true,
                            title: true,
                            icon: true,
                            unit: true,
                            targetValue: true,
                            currentStreak: true,
                            longestStreak: true,
                            totalEntries: true,
                            frequency: true
                        }
                    }
                }
            })

            // Получаем все записи привычки для пересчета streak
            const allEntries = await tx.habitEntry.findMany({
                where: { habitId: id },
                orderBy: { date: 'desc' }
            })

            // Вычисляем новые значения streak
            const newCurrentStreak = calculateCurrentStreak(allEntries, habit.frequency)
            const newLongestStreak = calculateLongestStreak(allEntries, habit.frequency)

            // Обновляем статистику привычки
            const updatedHabit = await tx.habit.update({
                where: { id: id },
                data: {
                    totalEntries: { increment: 1 },
                    currentStreak: newCurrentStreak,
                    longestStreak: Math.max(newLongestStreak, habit.longestStreak)
                }
            })

            return { ...entry, habit: { ...entry.habit, currentStreak: newCurrentStreak, longestStreak: updatedHabit.longestStreak } }
        })

        return NextResponse.json(result, { status: 201 })

    } catch (error: any) {
        console.error('Ошибка создания записи:', error)

        // Обработка ошибок Prisma
        if (error?.code === 'P2002') {
            return NextResponse.json({
                error: "Запись на эту дату уже существует"
            }, { status: 409 })
        }

        if (error?.code === 'P2025') {
            return NextResponse.json({
                error: "Привычка не найдена"
            }, { status: 404 })
        }

        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
    }
}