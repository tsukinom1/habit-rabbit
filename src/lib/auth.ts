import { AuthOptions } from "next-auth";
import { prisma } from "./prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";

export const authOptions: AuthOptions = {
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
        updateAge: 24 * 60 * 60,
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials")
                }
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                })

                if (!user || !user.password) return null

                const isValid = await bcrypt.compare(credentials.password, user.password)
                if (!isValid) return null

                return {
                    id: user.id,
                    email: user.email,
                    role: user.role, // ← Добавляем роль
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                try {
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email! }
                    })

                    if (!existingUser) {
                        await prisma.user.create({
                            data: {
                                email: user.email!,
                                password: null,
                                role: 'USER',
                            }
                        })
                    }
                } catch (error) {
                    console.error("Error creating user:", error)
                    return false
                }
            }
            return true
        },
        async jwt({ token, user }) {
            if (user) {
                // Для OAuth провайдеров user.email уже есть
                if (user.email) {
                    const dbUser = await prisma.user.findUnique({
                        where: { email: user.email }
                    })
                    if (dbUser) {
                        token.id = dbUser.id
                        token.email = dbUser.email
                        token.role = dbUser.role // ← Добавляем роль в JWT
                    }
                }
            }
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string
                session.user.email = token.email as string
                session.user.role = token.role as string // ← Добавляем роль в сессию
            }
            return session
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
}