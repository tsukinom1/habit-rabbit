import Link from 'next/link'
import React from 'react'
import { FaEnvelope, FaTelegram, FaTiktok } from 'react-icons/fa'
import { useSession } from 'next-auth/react'

export default function Footer() {
    const { data: session } = useSession()
    return (
        <footer className='py-4 bg-gray-100 space-y-2'>
            <ul className='container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                <li>
                    <Link href='/'>
                        <h1 className='text-2xl font-bold mb-2 border-b border-gray-500 w-fit'>Habit Rabbit</h1>
                    </Link>
                    <p className='text-md'>Habit Rabbit - это увлекательное приложение для отслеживания своих привычек и достижений.    </p>
                </li>
                <li>
                    <h2 className='text-xl font-bold mb-2 border-b border-gray-500 w-fit'>Контакты</h2>
                    <ul className='space-y-2'>
                        <li>
                            <Link href='https://t.me/nightbuild' target='_blank' className='flex items-center gap-2 text-lg'>
                                <FaTelegram size={24} /> Telegram
                            </Link>
                        </li>
                        <li>
                            <Link href='https://www.tiktok.com/@night.build?_t=ZN-8xcB4q2OrWY' target='_blank' className='flex items-center gap-2 text-lg'>
                                <FaTiktok size={24} /> Tiktok
                            </Link>
                        </li>
                        <li>
                            <Link href='mailto:reactdevtt@outlook.com' target='_blank' className='flex items-center gap-2 text-lg'>
                                <FaEnvelope size={24} /> Email
                            </Link>
                        </li>
                    </ul>
                </li>
                <li>
                    <h2 className='text-xl font-bold mb-2 border-b border-gray-500 w-fit'>Ссылки</h2>
                    <ul>
                        <li>
                            {
                                <Link href={`${session ? '/profile' : '/login'}`}>
                                    Профиль
                                </Link>
                            }
                        </li>
                        <li>
                            <Link href='/'>
                                Привычки
                            </Link>
                        </li>
                    </ul>
                </li>
            </ul>
            <p className='container text-center text-sm border-t border-gray-300 pt-2'>
                &copy; {new Date().getFullYear()} Logo. Все права защищены.
            </p>
        </footer>
    )
}
