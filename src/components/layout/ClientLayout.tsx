'use client'
import React from 'react'
import Header from './Header'
import Footer from './Footer'
import { usePathname } from 'next/navigation'
import { SessionProvider, useSession } from 'next-auth/react'
import NotificationContainer from '../ui/NotificationContainer'

function LayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const { data: session } = useSession()

    // Страницы где не показываем Header/Footer
    const isAuthPage = pathname === '/login' || pathname === '/register'

    return (
        <div className='flex min-h-screen'>
            {!isAuthPage && <Header />}

            {/* ✅ Основной контент с правильными отступами */}
            <main className={`
                flex-1 min-h-screen flex flex-col
                ${!isAuthPage && session ? 'md:ml-64 pt-16 md:pt-0' : ''}
                ${!isAuthPage && !session ? 'pt-16' : ''}
            `}>
                <div className='flex-grow p-4'>
                    {children}
                </div>

                {!isAuthPage && <Footer />}
            </main>
        </div>
    )
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <LayoutContent>{children}</LayoutContent>
            {/* Уведомления доступны везде в приложении */}
            <NotificationContainer />
        </SessionProvider>
    )
}
