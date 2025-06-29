'use client'
import React from 'react'
import { FaTelegram, FaUsers, FaHandshake, FaLightbulb, FaHeart } from 'react-icons/fa'

const helpTypes = [
    {
        title: "💡 Идеи и предложения",
        description: "Поделитесь идеями по улучшению приложения",
        examples: ["Новые функции", "Улучшения UX", "Фишки для мотивации"]
    },
    {
        title: "🎨 Креатив и дизайн", 
        description: "Помогите сделать приложение красивее",
        examples: ["Иконки и иллюстрации", "UI элементы", "Анимации"]
    },
    {
        title: "💻 Разработка",
        description: "Советы, идеи, обсуждения",
        examples: ["Frontend/Backend", "Тестирование", "DevOps"]
    },
    {
        title: "📢 Продвижение",
        description: "Помощь в развитии проекта",
        examples: ["Контент для соцсетей", "Обратная связь", "Рассказы друзьям"]
    }
]

export default function Collaboration() {
    return (
        <section className="my-16 lg:my-24 border-t border-gray-200 pt-16">
            <div className="container">
                {/* Header */}
                <div className="text-center mb-12 lg:mb-16">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <FaUsers className="text-4xl text-primary" />
                        <h2 className="text-3xl lg:text-5xl font-bold text-text">
                            Помоги проекту расти! 🌱
                        </h2>
                    </div>
                    <p className="text-lg lg:text-xl text-subtext max-w-3xl mx-auto">
                        Habit Rabbit создается с любовью и открытостью. Любая помощь важна — 
                        от простой идеи до серьезного вклада в продвижение. 
                        <span className="font-semibold text-primary"> Каждый может внести свою лепту!</span>
                    </p>
                </div>

                {/* Main CTA */}
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-8 mb-12 lg:mb-16 text-white text-center">
                    <div className="max-w-2xl mx-auto">
                        <FaTelegram className="text-5xl mx-auto mb-4 opacity-90" />
                        <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                            Присоединяйся к нашему Telegram! 
                        </h3>
                        <p className="text-lg opacity-90 mb-6">
                            Обсуждаем идеи, делимся прогрессом, помогаем друг другу. 
                            Пиши любые мысли — они все ценны!
                        </p>
                        <a 
                            href="https://t.me/nightbuild"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white text-blue-600 font-bold px-8 py-4 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-3 text-lg"
                        >
                            <FaTelegram />
                            Написать в Telegram
                        </a>
                    </div>
                </div>

                {/* How You Can Help */}
                <div className="mb-12 lg:mb-16">
                    <h3 className="text-2xl lg:text-3xl font-bold text-text text-center mb-8">
                        Как ты можешь помочь
                    </h3>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {helpTypes.map((type, index) => (
                            <div 
                                key={index} 
                                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100"
                            >
                                <h4 className="text-lg font-bold text-text mb-3">
                                    {type.title}
                                </h4>
                                
                                <p className="text-sm text-subtext mb-4 leading-relaxed">
                                    {type.description}
                                </p>
                                
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-text uppercase tracking-wide opacity-70">Примеры:</p>
                                    {type.examples.map((example, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                            <span className="text-xs text-subtext">{example}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Why Your Help Matters */}
                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 mb-12">
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <h3 className="text-2xl lg:text-3xl font-bold text-text mb-6">
                                Почему твоя помощь важна?
                            </h3>
                            <div className="space-y-4 text-subtext">
                                <div className="flex items-start gap-3">
                                    <FaLightbulb className="text-accent text-xl mt-1 flex-shrink-0" />
                                    <div>
                                        <strong className="text-text">Свежий взгляд</strong>
                                        <p>Новые идеи часто приходят от людей со стороны</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <FaHandshake className="text-secondary text-xl mt-1 flex-shrink-0" />
                                    <div>
                                        <strong className="text-text">Комьюнити</strong>
                                        <p>Вместе мы создаем продукт, который нужен пользователям</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <FaHeart className="text-primary text-xl mt-1 flex-shrink-0" />
                                    <div>
                                        <strong className="text-text">Твой вклад будет виден</strong>
                                        <p>Каждый помощник получит благодарность в приложении</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-center">
                            <div className="relative inline-block">
                                <div className="text-6xl lg:text-8xl">🚀</div>
                                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center animate-bounce text-white font-bold">
                                    ❤️
                                </div>
                            </div>
                            <p className="text-subtext mt-4 font-medium">
                                Совместное творчество — это магия!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Final CTA */}
                <div className="text-center">
                    <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
                        <h3 className="text-2xl font-bold text-text mb-4">
                            Не стесняйся — пиши! 💬
                        </h3>
                        <p className="text-subtext mb-6 leading-relaxed">
                            Есть идея? Видишь баг? Хочешь помочь? Или просто хочешь поболтать о проекте? 
                            <strong className="text-text"> Любое сообщение приветствуется!</strong>
                        </p>
                        
                        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4 mb-6">
                            <p className="text-md text-text">
                                ✨ <strong>Совет:</strong> Не думай, что твоя идея "слишком простая" или "очевидная". 
                                Часто самые простые идеи оказываются самыми ценными!
                            </p>
                        </div>

                        <a 
                            href="https://t.me/nightbuild"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold px-8 py-4 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-3 text-lg"
                        >
                            <FaTelegram />
                            Открыть Telegram чат
                        </a>
                        
                        <p className="text-xs text-subtext mt-4">
                            Нажимая на кнопку, ты переходишь в наш дружелюбный чат 🤗
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
} 