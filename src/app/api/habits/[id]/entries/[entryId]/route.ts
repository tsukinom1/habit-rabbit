import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { calculateCurrentStreak, calculateLongestStreak } from '@/utils/habitHelpers'

async function getUserProfile(userId: string) {
    return await prisma.profile.findFirst({
        where: { userId },
        select: { id: true }
    })
}

// Проверяем принадлежность записи пользователю
async function validateEntryOwnership(entryId: string, habitId: string, profileId: string) {
    const entry = await prisma.habitEntry.findFirst({
        where: { 
            id: entryId,
            habitId: habitId,
            habit: {
                profileId: profileId
            }
        },
        include: {
            habit: {
                select: {
                    id: true,
                    profileId: true
                }
            }
        }
    })
    return entry
}

// PUT /api/habits/[id]/entries/[entryId] - обновление записи
export async function PUT(
    request: Request,
    { params }: { params: { id: string; entryId: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
        }

        const profile = await getUserProfile(session.user.id)
        if (!profile) {
            return NextResponse.json({ error: "Профиль не найден" }, { status: 404 })
        }

        // Проверяем права доступа к записи
        const entry = await validateEntryOwnership(params.entryId, params.id, profile.id)
        if (!entry) {
            return NextResponse.json({ error: "Запись не найдена или нет доступа" }, { status: 404 })
        }

        const body = await request.json()

        // Безопасные поля для обновления
        const allowedFields: any = {}
        
        if (body.date !== undefined) {
            allowedFields.date = new Date(body.date)
        }
        
        if (body.value !== undefined) {
            allowedFields.value = body.value ? Number(body.value) : null
        }
        
        if (body.note !== undefined) {
            allowedFields.note = body.note?.trim() || null
        }
        
        if (body.mood !== undefined) {
            const validMoods = ['TERRIBLE', 'BAD', 'NEUTRAL', 'GOOD', 'EXCELLENT']
            if (body.mood && !validMoods.includes(body.mood)) {
                return NextResponse.json({ error: "Некорректное настроение" }, { status: 400 })
            }
            allowedFields.mood = body.mood
        }

        // Если изменяется дата, проверяем уникальность
        if (allowedFields.date) {
            const existingEntry = await prisma.habitEntry.findFirst({
                where: {
                    habitId: params.id,
                    date: allowedFields.date,
                    id: { not: params.entryId } // Исключаем текущую запись
                }
            })

            if (existingEntry) {
                return NextResponse.json({ 
                    error: "Запись на эту дату уже существует" 
                }, { status: 409 })
            }
        }

        // Получаем данные привычки для расчета прогресса
        const habit = await prisma.habit.findUnique({
            where: { id: params.id },
            select: { targetValue: true, frequency: true, currentStreak: true, longestStreak: true }
        })

        // Пересчитываем прогресс если изменяется значение
        if (allowedFields.value !== undefined && habit?.targetValue) {
            const progressPercentage = habit.targetValue > 0 
                ? Math.min((allowedFields.value / habit.targetValue) * 100, 100)
                : 0
            
            const isCompleted = allowedFields.value >= habit.targetValue
            
            allowedFields.progressPercentage = progressPercentage
            allowedFields.isCompleted = isCompleted
        }

        // Определяем, изменился ли статус выполнения для пересчета streak
        const needStreakRecalculation = allowedFields.isCompleted !== undefined || allowedFields.date !== undefined

        // Обновляем запись и пересчитываем streak если нужно
        const result = await prisma.$transaction(async (tx) => {
            const updatedEntry = await tx.habitEntry.update({
                where: { id: params.entryId },
                data: {
                    ...allowedFields,
                    updatedAt: new Date()
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
                            longestStreak: true
                        }
                    }
                }
            })

            // Пересчитываем streak если статус выполнения изменился
            if (needStreakRecalculation) {
                const allEntries = await tx.habitEntry.findMany({
                    where: { habitId: params.id },
                    orderBy: { date: 'desc' }
                })

                const newCurrentStreak = calculateCurrentStreak(allEntries, habit?.frequency || 'DAILY')
                const newLongestStreak = calculateLongestStreak(allEntries, habit?.frequency || 'DAILY')

                await tx.habit.update({
                    where: { id: params.id },
                    data: {
                        currentStreak: newCurrentStreak,
                        longestStreak: Math.max(newLongestStreak, habit?.longestStreak || 0)
                    }
                })

                // Обновляем возвращаемые данные
                updatedEntry.habit.currentStreak = newCurrentStreak
                updatedEntry.habit.longestStreak = Math.max(newLongestStreak, habit?.longestStreak || 0)
            }

            return updatedEntry
        })

        return NextResponse.json(result, { status: 200 })

    } catch (error: any) {
        console.error('Ошибка обновления записи:', error)
        
        if (error?.code === 'P2002') {
            return NextResponse.json({ 
                error: "Запись на эту дату уже существует" 
            }, { status: 409 })
        }
        
        if (error?.code === 'P2025') {
            return NextResponse.json({ 
                error: "Запись не найдена" 
            }, { status: 404 })
        }

        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
    }
}

// DELETE /api/habits/[id]/entries/[entryId] - удаление записи
export async function DELETE(
    request: Request,
    { params }: { params: { id: string; entryId: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
        }

        const profile = await getUserProfile(session.user.id)
        if (!profile) {
            return NextResponse.json({ error: "Профиль не найден" }, { status: 404 })
        }

        // Проверяем права доступа к записи
        const entry = await validateEntryOwnership(params.entryId, params.id, profile.id)
        if (!entry) {
            return NextResponse.json({ error: "Запись не найдена или нет доступа" }, { status: 404 })
        }

        // Получаем данные привычки для пересчета streak
        const habit = await prisma.habit.findUnique({
            where: { id: params.id },
            select: { frequency: true, currentStreak: true, longestStreak: true }
        })

        // Удаляем запись в транзакции
        await prisma.$transaction(async (tx) => {
            await tx.habitEntry.delete({
                where: { id: params.entryId }
            })

            // Получаем оставшиеся записи для пересчета streak
            const remainingEntries = await tx.habitEntry.findMany({
                where: { habitId: params.id },
                orderBy: { date: 'desc' }
            })

            // Пересчитываем streak
            const newCurrentStreak = calculateCurrentStreak(remainingEntries, habit?.frequency || 'DAILY')
            const newLongestStreak = calculateLongestStreak(remainingEntries, habit?.frequency || 'DAILY')

            // Обновляем статистику привычки
            await tx.habit.update({
                where: { id: params.id },
                data: {
                    totalEntries: { decrement: 1 },
                    currentStreak: newCurrentStreak,
                    longestStreak: newLongestStreak
                }
            })
        })

        return NextResponse.json({ message: "Запись успешно удалена" }, { status: 200 })

    } catch (error: any) {
        console.error('Ошибка удаления записи:', error)
        
        if (error?.code === 'P2025') {
            return NextResponse.json({ 
                error: "Запись не найдена" 
            }, { status: 404 })
        }

        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
    }
}

// GET /api/habits/[id]/entries/[entryId] - получение конкретной записи
export async function GET(
    request: Request,
    { params }: { params: { id: string; entryId: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
        }

        const profile = await getUserProfile(session.user.id)
        if (!profile) {
            return NextResponse.json({ error: "Профиль не найден" }, { status: 404 })
        }

        // Получаем запись с проверкой прав доступа
        const entry = await validateEntryOwnership(params.entryId, params.id, profile.id)
        if (!entry) {
            return NextResponse.json({ error: "Запись не найдена или нет доступа" }, { status: 404 })
        }

        return NextResponse.json(entry, { status: 200 })

    } catch (error) {
        console.error('Ошибка получения записи:', error)
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
    }
} 