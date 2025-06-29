'use client'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import Loader from '../ui/Loader'
import { FaCheck, FaHome, FaInfo, FaSignOutAlt, FaTasks, FaTrophy, FaUser } from 'react-icons/fa'
import { FaChartLine } from 'react-icons/fa6'
import { FaLock } from 'react-icons/fa6'
import { FaGear } from 'react-icons/fa6'
import Image from 'next/image'
import { useProfile } from '@/hooks/useProfile'
import { MdMenu, MdClose } from 'react-icons/md'

const links = [
    {
        name: 'Главная',
        href: '/',
        icon: <FaHome />
    },
    {
        name: 'О нас',
        href: '/about',
        icon: <FaInfo />
    },
    {
        name: 'Профиль',
        href: '/profile',
        icon: <FaUser />
    },
    {
        name: 'Привычки',
        href: '/habits',
        icon: <FaCheck />
    },
    {
        name: 'Достижения',
        href: '/achievements',
        icon: <FaTrophy />
    },
    {
        name: 'Задачи',
        href: '/tasks',
        icon: <FaTasks />
    },
    {
        name: 'Статистика',
        href: '/statistics',
        icon: <FaChartLine />
    },
    {
        name: 'Настройки',
        href: '/settings',
        icon: <FaGear />
    },
    {
        name: 'Безопасность',
        href: '/security',
        icon: <FaLock />
    },
    {
        name: 'Выйти',
        href: '/logout',
        icon: <FaSignOutAlt />
    }
]

export default function Header() {
    const { data: session, status } = useSession()
    const { profile } = useProfile()
    const router = useRouter()
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)

    if (status === 'loading') {
        return <Loader />
    }

    // ✅ Простой хедер для незалогиненных пользователей
    if (!session) {
        return (
            <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="container flex items-center justify-between px-4 py-3 ">
                    {/* Логотип */}
                    <Link href="/" className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-gray-800">Habit Rabbit</h1>
                    </Link>

                    {/* Кнопки авторизации */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link href="/about">
                            <span className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors">
                                О нас
                            </span>
                        </Link>
                        <Link
                            href="/login"
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                        >
                            Войти
                        </Link>
                        <Link
                            href="/register"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                        >
                            Регистрация
                        </Link>
                    </div>
                    <div className="md:hidden flex items-center gap-8">
                        <Link href="/about">
                            <FaInfo size={24} />
                        </Link>
                        <Link href="/login">
                            <Image
                                src={profile?.avatar || '/icons/default-avatar.png'}
                                alt="avatar"
                                width={36}
                                height={36}
                                className="rounded-full border-2 border-gray-200"
                            />
                        </Link>
                    </div>
                </div>
            </header>
        )
    }

    // ✅ Сложный хедер с сайдбаром для залогиненных пользователей
    return (
        <>
            {/* Мобильный хедер для залогиненных */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="container flex items-center justify-between px-4 py-3">
                    {/* Логотип */}
                    <Link href="/" className="text-xl font-bold text-gray-800">
                        Habit Rabbit
                    </Link>

                    {/* Правая часть - аватар и бургер */}
                    <div className="flex items-center gap-3">
                        {!isMenuOpen && (
                            <Link href="/profile">
                                <Image
                                    src={profile?.avatar || '/icons/default-avatar.png'}
                                    alt="avatar"
                                    width={36}
                                    height={36}
                                    className="rounded-full border-2 border-gray-200"
                                />
                            </Link>
                        )}

                        {/* Бургер кнопка */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {isMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* ✅ Сайдбар */}
            <aside className={`
                fixed left-0 w-full md:w-64 h-screen bg-white border-r border-gray-200 transition-transform duration-300
                ${isMenuOpen ? 'top-16 translate-x-0 z-40' : 'top-0 -translate-x-full z-10'}
                md:top-0 md:translate-x-0 md:z-10
            `}>
                <div className="flex flex-col h-full p-4">
                    {/* Десктопный логотип */}
                    <Link href="/" className="mb-6 hidden md:block text-2xl font-bold text-gray-800">
                        Habit Rabbit
                    </Link>

                    {/* Мобильная шапка сайдбара */}
                    <div className="md:hidden mb-6">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Image
                                src={profile?.avatar || '/icons/default-avatar.png'}
                                alt="avatar"
                                width={40}
                                height={40}
                                className="rounded-full"
                            />
                            <div>
                                <p className="font-semibold text-gray-800 text-sm">
                                    {profile?.firstName} {profile?.lastName}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {profile?.user.role.toLowerCase() === 'admin' ? 'Администратор' : 'Пользователь'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Десктопный профиль */}
                    <div className="hidden md:flex flex-col items-center mb-6 p-4 bg-gray-50 rounded-lg">
                        <Image
                            src={profile?.avatar || '/icons/default-avatar.png'}
                            alt="avatar"
                            width={60}
                            height={60}
                            className="rounded-full mb-2"
                        />
                        <div className="text-center">
                            <p className="font-semibold text-gray-800">
                                {profile?.firstName} {profile?.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                                {profile?.user.role.toLowerCase() === 'admin' ? 'Администратор' : 'Пользователь'}
                            </p>
                        </div>
                    </div>

                    {/* Навигация */}
                    <nav className="flex-1">
                        <ul className="space-y-2">
                            {links.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className={`
                                            flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                                            ${link.href === '/logout'
                                                ? 'text-red-600 hover:bg-red-50'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }
                                        `}
                                        onClick={(e) => {
                                            if (link.href === '/logout') {
                                                e.preventDefault()
                                                signOut({ callbackUrl: '/login' })
                                            }
                                            setIsMenuOpen(false)
                                        }}
                                    >
                                        <span className="text-lg">{link.icon}</span>
                                        <span className="font-medium">{link.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </aside>
        </>
    )
}
