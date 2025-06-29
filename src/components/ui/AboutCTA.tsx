'use client'
import React from 'react'
import Link from 'next/link'
import { FaArrowRight, FaUser, FaCode } from 'react-icons/fa'

interface AboutCTAProps {
    variant?: 'banner' | 'card' | 'floating'
    className?: string
}

export default function AboutCTA({ variant = 'banner', className = '' }: AboutCTAProps) {
    
    if (variant === 'floating') {
        return (
            <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
                <Link href="/about">
                    <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group">
                        <div className="flex items-center gap-2">
                            <FaUser className="text-lg" />
                            <span className="hidden md:inline font-medium">О создателе</span>
                            <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </Link>
            </div>
        )
    }

    if (variant === 'card') {
        return (
            <div className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}>
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        <FaCode className="text-white text-xl" />
                    </div>
                    
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-text mb-2">
                            Познакомься с создателем! 👋
                        </h3>
                        <p className="text-subtext text-sm mb-4">
                            Узнай историю создания проекта и следи за процессом разработки
                        </p>
                        
                        <Link href="/about">
                            <button className="bg-gradient-to-r from-primary to-secondary text-white font-semibold px-4 py-2 rounded-lg hover:shadow-md transform hover:scale-105 transition-all duration-300 flex items-center gap-2 text-sm">
                                Узнать больше
                                <FaArrowRight className="text-xs" />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // Default banner variant
    return (
        <div className={`bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 text-center ${className}`}>
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                        <FaUser className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-text">
                        Хочешь узнать больше о проекте? 
                    </h3>
                </div>
                
                <p className="text-subtext mb-4">
                    Познакомься с создателем, узнай историю Habit Rabbit и следи за процессом разработки в реальном времени!
                </p>
                
                <Link href="/about">
                    <button className="bg-gradient-to-r from-primary to-secondary text-white font-semibold px-6 py-3 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-2">
                        О создателе проекта
                        <FaArrowRight className="text-sm" />
                    </button>
                </Link>
            </div>
        </div>
    )
} 