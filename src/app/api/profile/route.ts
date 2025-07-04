import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET - получить профиль текущего пользователя
export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
        }
        // Ищем профиль пользователя
        let profile = await prisma.profile.findUnique({
            where: { userId: session.user.id },
            include: {
                socials: true,
                user: {
                    select: {
                        email: true,
                        role: true,
                        createdAt: true,
                    }
                }
            }
        })

        // Если профиль не существует, создаем его с дефолтными значениями
        if (!profile) {
            profile = await prisma.profile.create({
                data: {
                    userId: session.user.id,
                    firstName: "Новый",
                    lastName: "Пользователь", 
                    bio: "Расскажите о себе..."
                },
                include: {
                    socials: true,
                    user: {
                        select: {
                            email: true,
                            role: true,
                            createdAt: true,
                        }
                    }
                }
            })
        }

        return NextResponse.json(profile)
    } catch (error) {
        return NextResponse.json({ error: "Ошибка при получении профиля " }, { status: 500 })
    }
}


export async function PUT(request: Request) {
    try {
        const body = await request.json()

        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
        }

        // Разделяем данные профиля и соцсетей
        const { socials, user, userId, id, createdAt, updatedAt, ...profileData } = body

        // Список допустимых полей профиля
        const allowedProfileFields = [
            'firstName', 'lastName', 'bio', 'phone', 'avatar', 'birthDate', 
            'gender', 'country', 'city', 'address', 'timezone', 'language', 
            'isPublic', 'totalHabits', 'completedHabits', 'currentStreak', 'longestStreak'
        ]

        // Фильтруем только допустимые поля
        const filteredProfileData: Record<string, any> = Object.keys(profileData)
            .filter(key => allowedProfileFields.includes(key))
            .reduce((obj: Record<string, any>, key) => {
                obj[key] = profileData[key]
                return obj
            }, {})

        // Обработка типов данных для профиля
        const processedData: Record<string, any> = {
            ...filteredProfileData,
            isPublic: filteredProfileData.isPublic === 'true' || filteredProfileData.isPublic === true,
        }

        // Специальная обработка для даты рождения
        if (filteredProfileData.birthDate && filteredProfileData.birthDate.trim() !== '') {
            try {
                // Если это строка в формате YYYY-MM-DD, создаем дату в UTC
                if (typeof filteredProfileData.birthDate === 'string') {
                    const dateStr = filteredProfileData.birthDate.trim()
                    // Проверяем формат YYYY-MM-DD
                    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                        processedData.birthDate = new Date(dateStr + 'T00:00:00.000Z')
                    } else {
                        // Пытаемся парсить как обычную дату
                        processedData.birthDate = new Date(dateStr)
                    }
                } else {
                    processedData.birthDate = new Date(filteredProfileData.birthDate)
                }
                
                // Проверяем, что дата валидна
                if (isNaN(processedData.birthDate.getTime())) {
                    console.log('Invalid birthDate:', filteredProfileData.birthDate)
                    delete processedData.birthDate
                }
            } catch (error) {
                console.log('Error parsing birthDate:', error)
                delete processedData.birthDate
            }
        }

        // Удаляем undefined и пустые поля
        Object.keys(processedData).forEach(key => {
            if (processedData[key] === undefined || processedData[key] === '') {
                delete processedData[key]
            }
        })

        console.log('Processed profile data:', processedData)

        // Обновляем профиль
        const profile = await prisma.profile.upsert({
            where: { userId: session.user.id },
            update: processedData,
            create: { 
                ...processedData, 
                userId: session.user.id,
                firstName: processedData.firstName || "Новый",
                lastName: processedData.lastName || "Пользователь", 
                bio: processedData.bio || "Расскажите о себе..."
            }
        })

        // Обрабатываем соцсети отдельно
        if (socials && Array.isArray(socials)) {
            // Удаляем старые соцсети
            await prisma.social.deleteMany({
                where: { profileId: profile.id }
            })

            // Создаем новые соцсети
            const validSocials = socials.filter((social: any) => 
                social.platform && 
                social.url && 
                social.platform.trim() !== '' && 
                social.url.trim() !== ''
            )

            if (validSocials.length > 0) {
                await prisma.social.createMany({
                    data: validSocials.map((social: any) => ({
                        platform: social.platform,
                        url: social.url,
                        username: social.username || null,
                        profileId: profile.id
                    }))
                })
            }
        }

        // Возвращаем обновленный профиль с соцсетями
        const updatedProfile = await prisma.profile.findUnique({
            where: { id: profile.id },
            include: {
                socials: true,
                user: {
                    select: {
                        email: true,
                        role: true,
                        createdAt: true,
                    }
                }
            }
        })

        return NextResponse.json(updatedProfile)
    } catch (error: any) {
        console.error('Profile update error:', error)
        return NextResponse.json({ 
            error: "Ошибка при обновлении профиля", 
            details: error?.message || 'Unknown error'
        }, { status: 500 })
    }
}