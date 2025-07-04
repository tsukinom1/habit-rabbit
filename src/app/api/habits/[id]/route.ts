import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

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

// GET /api/habits/[id] - получение конкретной привычки
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

        const habit = await prisma.habit.findFirst({
            where: {
                id: id,
                profileId: profile.id
            },
            include: {
                entries: {
                    orderBy: { date: 'desc' }
                    // Убираем лимит - загружаем все записи
                }
            }
        })

        if (!habit) {
            return NextResponse.json({ error: "Привычка не найдена" }, { status: 404 })
        }

        return NextResponse.json(habit, { status: 200 })

    } catch (error) {
        console.error('Ошибка получения привычки:', error)
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
    }
}

// PUT /api/habits/[id] - обновление привычки
export async function PUT(
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

        // Безопасные поля для обновления
        const allowedFields: any = {}

        if (body.title !== undefined) {
            if (!body.title || body.title.trim() === '') {
                return NextResponse.json({ error: "Название привычки обязательно" }, { status: 400 })
            }
            allowedFields.title = body.title.trim()
        }

        if (body.description !== undefined) {
            allowedFields.description = body.description?.trim() || null
        }

        if (body.icon !== undefined) {
            allowedFields.icon = body.icon || '🎯'
        }

        if (body.color !== undefined) {
            allowedFields.color = body.color && /^#[0-9A-F]{6}$/i.test(body.color) ? body.color : '#3B82F6'
        }

        if (body.frequency !== undefined) {
            const validFrequencies = ['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM']
            if (!validFrequencies.includes(body.frequency)) {
                return NextResponse.json({ error: "Некорректная частота" }, { status: 400 })
            }
            allowedFields.frequency = body.frequency
        }

        if (body.targetValue !== undefined) {
            allowedFields.targetValue = body.targetValue ? Number(body.targetValue) : null
        }

        if (body.unit !== undefined) {
            allowedFields.unit = body.unit || null
        }

        if (body.reminderTime !== undefined) {
            allowedFields.reminderTime = body.reminderTime || null
        }

        if (body.startDate !== undefined) {
            allowedFields.startDate = new Date(body.startDate)
        }

        if (body.endDate !== undefined) {
            allowedFields.endDate = body.endDate ? new Date(body.endDate) : null
        }

        if (body.isActive !== undefined) {
            allowedFields.isActive = Boolean(body.isActive)
        }

        if (body.isArchived !== undefined) {
            allowedFields.isArchived = Boolean(body.isArchived)
        }

        // Обновляем привычку
        const updatedHabit = await prisma.habit.update({
            where: { id: id },
            data: {
                ...allowedFields,
                updatedAt: new Date()
            },
            include: {
                entries: {
                    orderBy: { date: 'desc' }
                    // Загружаем все записи для корректной статистики
                }
            }
        })

        return NextResponse.json(updatedHabit, { status: 200 })

    } catch (error: any) {
        console.error('Ошибка обновления привычки:', error)

        if (error?.code === 'P2025') {
            return NextResponse.json({
                error: "Привычка не найдена"
            }, { status: 404 })
        }

        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
    }
}

// DELETE /api/habits/[id] - удаление привычки
export async function DELETE(
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

        // Удаляем привычку в транзакции (все записи удалятся автоматически по cascade)
        await prisma.$transaction(async (tx) => {
            // Сначала получаем количество записей для корректировки статистики
            const entriesCount = await tx.habitEntry.count({
                where: { habitId: id }
            })

            // Удаляем привычку (записи удалятся автоматически)
            await tx.habit.delete({
                where: { id: id }
            })

            // Обновляем статистику профиля
            await tx.profile.update({
                where: { id: profile.id },
                data: {
                    totalHabits: { decrement: 1 }
                }
            })
        })

        return NextResponse.json({ message: "Привычка успешно удалена" }, { status: 200 })

    } catch (error: any) {
        console.error('Ошибка удаления привычки:', error)

        if (error?.code === 'P2025') {
            return NextResponse.json({
                error: "Привычка не найдена"
            }, { status: 404 })
        }

        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
    }
}
