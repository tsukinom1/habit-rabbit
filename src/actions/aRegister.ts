"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

type RegisterResult = {
    success: boolean
    message: string
    redirectTo?: string
}

export async function aRegister(formData: FormData): Promise<RegisterResult> {
    try {
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        if (!email || !password) {
            return {
                success: false,
                message: "Email и пароль обязательны"
            }
        }

        // Блокируем Gmail и другие OAuth провайдеры
        const blockedDomains = ['@gmail.com', '@googlemail.com']
        const emailLower = email.toLowerCase()
        
        for (const domain of blockedDomains) {
            if (emailLower.includes(domain)) {
                return {
                    success: false,
                    message: "Для Gmail используйте вход через Google"
                }
            }
        }

        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            return {
                success: false,
                message: "Пользователь с таким email уже существует"
            }
        }

        const hashed = await bcrypt.hash(password, 10)
        const user = await prisma.user.create({
            data: {
                email,
                password: hashed,
            }
        })

        return {
            success: true,
            message: "Регистрация успешна!",
            redirectTo: "/login"
        }
    } catch (error) {
        console.error("❌ Ошибка регистрации:", error)
        return {
            success: false,
            message: error instanceof Error ? error.message : "Неизвестная ошибка"
        }
    }
}