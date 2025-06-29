'use client'
import React from 'react'
import Image from 'next/image'
import { FaTelegram, FaTiktok, FaCode, FaHeart } from 'react-icons/fa'

const socialChannels = [
    {
        platform: "TikTok",
        icon: <FaTiktok />,
        handle: "@night.build",
        description: "Короткие видео о процессе разработки",
        link: "https://www.tiktok.com/@night.build?_t=ZN-8xcB4q2OrWY",
        color: "from-pink-500 to-red-500",
        bgColor: "bg-pink-50"
    },
    {
        platform: "Telegram",
        icon: <FaTelegram />,
        handle: "@nightbuild",
        description: "Подробные посты о разработке и планах",
        link: "https://t.me/nightbuild",
        color: "from-blue-500 to-cyan-500",
        bgColor: "bg-blue-50"
    }
]

export default function AboutMe() {
    return (
        <section className="">
            <div className="container">
                {/* Header */}
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-3xl lg:text-5xl font-bold text-text mb-4">
                        Привет! Я создатель Habit Rabbit
                    </h2>
                    <p className="text-lg lg:text-xl text-subtext max-w-2xl mx-auto">
                        Меня зовут <b>"Ночной билд"</b>, и я делюсь всем процессом создания этого приложения в реальном времени
                    </p>
                </div>

                <div className="mx-auto">
                    {/* Main Content */}
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">

                        {/* Left: Photo & Story */}
                        <div className="text-center lg:text-left space-y-6">
                            {/* Avatar */}
                            <div className="flex justify-center lg:justify-start mb-6">
                                <div className="relative">
                                    <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-gradient-to-r from-primary to-secondary p-1">
                                        <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                            {/* Placeholder - замените на ваше фото */}
                                            <Image
                                                src="/icons/default-avatar.png"
                                                alt="Создатель Habit Rabbit"
                                                width={150}
                                                height={150}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                    {/* Coding badge */}
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-secondary rounded-full flex items-center justify-center shadow-lg">
                                        <FaCode className="text-white text-lg" />
                                    </div>
                                </div>
                            </div>

                            {/* Story */}
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-text">
                                    Как родился Habit Rabbit 🐰
                                </h3>

                                <div className="space-y-4 text-subtext leading-relaxed">
                                    <p>
                                        Всё началось в университете, когда нужно было придумать идею для проекта.
                                        Сидел, думал над концепцией, и внезапно осознал — а ведь у меня самого проблемы с привычками!
                                    </p>

                                    <p>
                                        Когда начал размышлять о трекере привычек, название
                                        <span className="font-semibold text-primary"> Habit Rabbit</span> пришло само собой.
                                        Habit — привычка, Rabbit — кролик. Просто и запоминается!
                                    </p>

                                    <p>
                                        А потом появилась идея с <span className="font-semibold text-text">виртуальным кроликом</span> —
                                        милым спутником, который сделает процесс формирования привычек веселее и мотивирующее.
                                        В будущем планирую добавить ИИ, чтобы кролик стал ещё умнее!
                                    </p>
                                </div>

                                {/* Stats */}
                                {/* <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-primary">200+</div>
                                        <div className="text-sm text-subtext">часов разработки</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-secondary">50+</div>
                                        <div className="text-sm text-subtext">видео о процессе</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-accent">∞</div>
                                        <div className="text-sm text-subtext">любви к коду</div>
                                    </div>
                                </div> */}
                            </div>
                        </div>

                        {/* Right: Development Journey */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg">
                            <div className="flex items-center gap-3 mb-6">
                                <FaHeart className="text-primary text-2xl" />
                                <h3 className="text-2xl font-bold text-text">Открытая разработка</h3>
                            </div>

                            <p className="text-subtext mb-6 leading-relaxed">
                                Я верю в прозрачность разработки. Весь процесс создания Habit Rabbit —
                                от первых строчек кода до релиза — документируется и публикуется в реальном времени.
                            </p>

                            {/* What I share */}
                            <div className="space-y-3 mb-6">
                                <h4 className="font-semibold text-text mb-3">Чем я делюсь:</h4>

                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    <span className="text-subtext">Процесс проектирования</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                                    <span className="text-subtext">Результаты и объяснения</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                                    <span className="text-subtext">Ошибки и как их исправляю</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    <span className="text-subtext">Планы развития продукта</span>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4">
                                <p className="text-md text-text font-medium">
                                    💡 Хотите увидеть, как создается современное приложение?
                                    Подписывайтесь на мои каналы!
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 max-w-2xl mx-auto">
                            <h3 className="text-2xl font-bold text-text mb-4">
                                Присоединяйтесь к путешествию! 🚀
                            </h3>
                            <p className="text-subtext mb-6">
                                Следите за процессом создания, задавайте вопросы, предлагайте идеи.
                                Вместе мы создаем лучший трекер привычек!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href="https://t.me/nightbuild"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold px-6 py-3 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <FaTelegram />
                                    Telegram канал
                                </a>
                                <a
                                    href="https://www.tiktok.com/@night.build?_t=ZN-8xcB4q2OrWY"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold px-6 py-3 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <FaTiktok />
                                    TikTok профиль
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
} 