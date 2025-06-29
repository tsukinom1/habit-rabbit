'use client'
import React from 'react'
import MyButton from '../ui/MyButton'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

const appFeatures = [
    {
        title: "Простое создание привычек",
        description: "Добавляйте новые привычки за несколько секунд. Выберите категорию, установите цель и частоту.",
        highlights: ["Быстрое добавление", "Категории привычек", "Гибкие настройки"]
    },
    {
        title: "Красивый трекинг прогресса",
        description: "Отмечайте выполнение привычек одним тапом. Визуализация прогресса мотивирует продолжать.",
        highlights: ["Один клик", "Визуальный прогресс", "Календарь привычек"]
    },
    {
        title: "Подробная статистика",
        description: "Анализируйте свой прогресс с помощью графиков, стриков и достижений.",
        highlights: ["Графики прогресса", "Стрики и награды", "Детальная аналитика"]
    }
]

export default function AppShowcase() {
    const { data: session } = useSession()
    return (
        <section className="py-16 lg:py-24">
            <div className="container">
                {/* Header */}
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-3xl lg:text-5xl font-bold text-text mb-4">
                        Удобный интерфейс для ваших привычек
                    </h2>
                    <p className="text-lg lg:text-xl text-subtext max-w-2xl mx-auto">
                        Простой и интуитивный интерфейс, который делает отслеживание привычек легким и приятным
                    </p>
                </div>

                {/* Features with Mockups */}
                <div className="max-w-5xl mx-auto space-y-16 lg:space-y-24">
                    {appFeatures.map((feature, index) => (
                        <div
                            key={index}
                            className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                                }`}
                        >
                            {/* Content */}
                            <div className="lg:w-1/2 space-y-6 text-center lg:text-left">
                                <h3 className="text-2xl lg:text-3xl font-bold text-text">
                                    {feature.title}
                                </h3>

                                <p className="text-lg text-subtext leading-relaxed">
                                    {feature.description}
                                </p>

                                {/* Feature Highlights */}
                                <div className="space-y-3">
                                    {feature.highlights.map((highlight, idx) => (
                                        <div key={idx} className="flex items-center justify-center lg:justify-start gap-3">
                                            <div className="w-2 h-2 bg-secondary rounded-full"></div>
                                            <span className="text-text font-medium">{highlight}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Mockup */}
                            <div className="lg:w-1/2 flex justify-center">
                                <div className="relative group">
                                    {/* Phone Frame */}
                                    <div className="relative bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
                                        <div className="bg-white rounded-[2rem] overflow-hidden">
                                            {/* Placeholder mockup */}
                                            <div className="w-64 h-[480px] bg-gradient-to-b from-background to-white flex flex-col items-center justify-center relative overflow-hidden">
                                                {/* Header */}
                                                <div className="absolute top-0 left-0 right-0 h-16 bg-white shadow-sm flex items-center justify-center">
                                                    <h4 className="font-bold text-text">Habit Rabbit</h4>
                                                </div>

                                                {/* Content based on feature type */}
                                                <div className="flex-1 flex flex-col items-center justify-center space-y-4 px-6 pt-16">
                                                    {index === 0 && (
                                                        <>
                                                            <div className="w-full h-12 bg-primary/20 rounded-lg flex items-center px-4">
                                                                <span className="text-sm text-subtext">Введите название привычки...</span>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center">
                                                                    <span className="text-2xl">💧</span>
                                                                </div>
                                                                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                                                                    <span className="text-2xl">🏃</span>
                                                                </div>
                                                                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
                                                                    <span className="text-2xl">📚</span>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}

                                                    {index === 1 && (
                                                        <>
                                                            <div className="w-full space-y-3">
                                                                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                                                                    <span className="text-sm">Выпить воду</span>
                                                                    <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                                                                        <span className="text-white text-xs">✓</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                                                                    <span className="text-sm">Зарядка</span>
                                                                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}

                                                    {index === 2 && (
                                                        <>
                                                            <div className="w-full h-24 bg-white rounded-lg shadow-sm flex items-center justify-center">
                                                                <div className="text-center">
                                                                    <div className="text-2xl font-bold text-primary">7</div>
                                                                    <div className="text-xs text-subtext">дней подряд</div>
                                                                </div>
                                                            </div>
                                                            <div className="w-full h-16 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                                                                <span className="text-sm font-medium">📊 Статистика</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Glow effect */}
                                    <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-[3rem] blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-16 lg:mt-24">
                    <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
                        <h3 className="text-2xl font-bold text-text mb-4">
                            Готовы попробовать сами?
                        </h3>
                        <p className="text-subtext mb-6">
                            Скорее зарегистрируйтесь и начните формировать полезные привычки уже сегодня
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <MyButton className="bg-gradient-to-r from-primary to-secondary text-white font-semibold px-8 py-4 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                                <Link href={session ? '/habits' : '/register'} className="flex items-center justify-center gap-2 ">
                                    Начать бесплатно
                                </Link>
                            </MyButton>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    )
} 