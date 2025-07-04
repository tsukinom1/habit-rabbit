import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

async function getUserProfile(userId: string) {
    return await prisma.profile.findFirst({
        where: { userId },
        select: { id: true, totalHabits: true }
    })
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
        }

        const profile = await getUserProfile(session.user.id)
        if (!profile) {
            return NextResponse.json({ error: "Профиль не найден" }, { status: 404 })
        }

        // ✅ Оптимизированный запрос с include
        const habits = await prisma.habit.findMany({
            where: {
                profileId: profile.id,
                isArchived: false // показываем только активные
            },
            orderBy: { createdAt: 'desc' },
            include: {
                entries: {
                    where: {
                        date: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Последние 30 дней
                        }
                    },
                    orderBy: { date: 'desc' }
                }
            }
        })

        return NextResponse.json(habits, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
        }

        const profile = await getUserProfile(session.user.id)
        if (!profile) {
            return NextResponse.json({ error: "Профиль не найден" }, { status: 404 })
        }

        // ✅ Проверка лимитов
        const MAX_HABITS = 50
        if (profile.totalHabits >= MAX_HABITS) {
            return NextResponse.json({
                error: `Максимум ${MAX_HABITS} привычек на пользователя`
            }, { status: 400 })
        }

        const body = await request.json()

        // ✅ БЕЗОПАСНОСТЬ: только разрешенные поля (NO MORE ...body!)
        const allowedFields = {
            title: body.title,
            description: body.description || null,
            icon: body.icon || '🎯',
            color: body.color && /^#[0-9A-F]{6}$/i.test(body.color) ? body.color : '#3B82F6',
            frequency: body.frequency,
            targetValue: body.targetValue ? Number(body.targetValue) : null,
            unit: body.unit || null,
            reminderTime: body.reminderTime || null,
            startDate: body.startDate ? new Date(body.startDate) : new Date(),
            endDate: body.endDate ? new Date(body.endDate) : null,
            isActive: body.isActive !== undefined ? Boolean(body.isActive) : true
        }

        if (!allowedFields.title || allowedFields.title.trim() === '') {
            return NextResponse.json({ error: "Название привычки обязательно" }, { status: 400 })
        }

        // ✅ Создание в транзакции
        const result = await prisma.$transaction(async (tx) => {
            const habit = await tx.habit.create({
                data: {
                    ...allowedFields,
                    profileId: profile.id
                },
                include: {
                    entries: true
                }
            })

            // Обновляем счетчик привычек
            await tx.profile.update({
                where: { id: profile.id },
                data: { totalHabits: { increment: 1 } }
            })

            return habit
        })

        return NextResponse.json(result, { status: 201 })

    } catch (error: any) {
        // ✅ Детальное логирование
        console.error('Ошибка создания привычки:', error)

        // Проверяем тип ошибки Prisma
        if (error?.code === 'P2002') {
            return NextResponse.json({
                error: "Привычка с таким названием уже существует"
            }, { status: 409 })
        }

        if (error?.code === 'P2025') {
            return NextResponse.json({
                error: "Связанная запись не найдена"
            }, { status: 404 })
        }

        // ✅ Правильный статус для server errors
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
    }
}