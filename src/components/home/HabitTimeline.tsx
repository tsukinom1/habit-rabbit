'use client'
import React from 'react'
import '@/styles/animations.css'

const timelineSteps = [
    {
        day: "1-7 дней",
        title: "Начинаем",
        description: "Требуется сознательное усилие, легко забыть",
        icon: "🌱",
        color: "from-red-400 to-orange-400",
        bgColor: "bg-red-50",
        progress: 25
    },
    {
        day: "8-14 дней",
        title: "Привыкаем",
        description: "Становится проще, но все еще нужна дисциплина",
        icon: "🌿",
        color: "from-orange-400 to-yellow-400",
        bgColor: "bg-orange-50",
        progress: 50
    },
    {
        day: "15-21 день",
        title: "Закрепляем",
        description: "Действие становится автоматическим",
        icon: "🌳",
        color: "from-yellow-400 to-green-400",
        bgColor: "bg-yellow-50",
        progress: 75
    },
    {
        day: "21+ дней",
        title: "Привычка сформирована!",
        description: "Теперь это часть вашей жизни",
        icon: "🎯",
        color: "from-green-400 to-emerald-500",
        bgColor: "bg-green-50",
        progress: 100
    },
    {
        day: "29.06.2025",
        title: "Первый релиз",
        description: "Общий доступ к Habit Rabbit",
        icon: "🚀",
        color: "from-blue-400 to-cyan-400",
        bgColor: "bg-blue-50",
        progress: 100
    }
]

export default function HabitTimeline() {
    return (
        <section className="py-16 lg:py-24">
            <div className="container">
                {/* Header */}
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-3xl lg:text-5xl font-bold text-text mb-4">
                        Наука формирования привычек
                    </h2>
                    <p className="text-lg lg:text-xl text-subtext max-w-2xl mx-auto">
                        Исследования показывают, что для формирования новой привычки требуется в среднем
                        <span className="font-semibold text-secondary"> 21 день</span> постоянного повторения
                    </p>
                </div>

                {/* Timeline */}
                <div className="relative max-w-4xl mx-auto">
                    {/* Progress Line */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gray-200 rounded-full hidden lg:block">
                        <div className="w-full bg-gradient-to-b from-primary to-secondary h-3/4 rounded-full animate-fill-height"></div>
                    </div>

                    {/* Timeline Items */}
                    <div className="space-y-8 lg:space-y-12">
                        {timelineSteps.map((step, index) => (
                            <div
                                key={index}
                                className={` flex flex-col lg:flex-row items-center gap-6 lg:gap-8 animate-fade-in-up`}
                                style={{ animationDelay: `${index * 0.2}s` }}
                            >
                                {/* Left Content (Desktop) */}
                                <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:text-right lg:order-1' : 'lg:text-left lg:order-2'} text-center lg:text-inherit`}>
                                    <div className={`${step.bgColor} w-[400px] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                                        <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                                            <span className="text-3xl">{step.icon}</span>
                                            <span className="text-sm font-semibold  bg-white px-3 py-1 rounded-full">
                                                {step.day}
                                            </span>
                                        </div>
                                        <h3 className="text-xl lg:text-2xl font-bold text-text mb-2">
                                            {step.title}
                                        </h3>
                                        <p className=" leading-relaxed">
                                            {step.description}
                                        </p>

                                        {/* Progress Bar */}
                                        <div className="mt-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium text-text">Прогресс формирования</span>
                                                <span className="text-sm font-bold text-secondary">{step.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className={`bg-gradient-to-r ${step.color} h-3 rounded-full transition-all duration-1000 animate-fill-progress`}
                                                    style={{ width: `${step.progress}%`, animationDelay: `${index * 0.3 + 0.5}s` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Center Icon (Desktop) */}
                                <div className="hidden lg:flex w-16 h-16 rounded-full bg-white shadow-lg items-center justify-center relative z-10 order-2">
                                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold text-lg`}>
                                        {index + 1}
                                    </div>
                                </div>

                                {/* Right Content Spacer (Desktop) */}
                                <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'} hidden lg:block`}></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center mt-12 lg:mt-16">
                    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 max-w-2xl mx-auto">
                        <h3 className="text-2xl font-bold text-text mb-4">
                            Готовы начать свой 21-дневный путь?
                        </h3>
                        <p className="text-subtext mb-6">
                            Присоединяйтесь к нам и начни менять свою жизнь
                        </p>
                        <button className="bg-gradient-to-r from-primary to-secondary text-white font-semibold px-8 py-4 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                            Создать первую привычку 🚀
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
} 