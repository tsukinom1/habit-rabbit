'use client'
import React from 'react'
import '@/styles/animations.css'
import MyButton from '../ui/MyButton'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function Hero() {
    const { data: session } = useSession()

    return (
        <div className="">
            <div className="container py-12 lg:py-20">
                <div className="grid grid-cols-1 xl:grid-cols-2 items-center gap-8 lg:gap-12">

                    {/* Left Content */}
                    <section className="space-y-2 text-center xl:text-left order-2 xl:order-1">
                        <div>
                            <h1 className='text-4xl  2xl:text-6xl font-bold leading-tight text-text'>
                                Превращай мечты в привычки вместе с{' '}
                                <span className='text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary'>
                                    Habit Rabbit
                                </span>
                            </h1>
                        </div>

                        <div className="space-y-4">
                            <h2 className='text-xl 2xl:text-3xl text-subtext leading-relaxed'>
                                Простой и милый трекер, который поможет построить полезные привычки и достичь поставленных целей
                            </h2>

                            <h3 className='text-lg 2xl:text-xl text-text/80'>
                                Создайте привычку, которая за{' '}
                                <span className="font-semibold text-secondary">21 день</span>{' '}
                                станет частью вашей жизни
                            </h3>
                        </div>


                        {/* CTA Buttons */}
                        <MyButton className='text-lg xl:text-xl border-primary bg-gradient-to-r from-primary to-secondary text-white border-none hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-semibold !px-6 !py-3'>
                            <Link href={session ? '/habits' : '/register'} className="flex items-center justify-center gap-2 ">
                                {session ? 'Мои привычки' : 'Начать бесплатно'} 🚀
                            </Link>
                        </MyButton>


                    </section>

                    {/* Right Visual */}
                    <section className="flex justify-center order-1 xl:order-2">
                        <div className="relative">
                            <img
                                src="/images/hero.png"
                                alt="Habit Rabbit - трекер привычек"
                                className="w-full max-w-[300px] md:max-w-[400px] xl:max-w-[600px] 3xl:max-w-[800px] h-auto drop-shadow-2xl"
                            />
                            {/* Floating elements for decoration */}
                            <div className="absolute -top-4 -right-4 bg-secondary/10 rounded-full p-2 animate-bounce">
                                <span className="text-2xl">🏆</span>
                            </div>
                            <div className="absolute -bottom-4 -left-4 bg-primary/10 rounded-full p-2 animate-pulse">
                                <span className="text-2xl">📈</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
