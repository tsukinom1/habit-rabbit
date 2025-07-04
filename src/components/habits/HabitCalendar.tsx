'use client'
import React, { useState, useMemo } from 'react'
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaCog } from 'react-icons/fa'
import { THabitEntry, TCalendarConfig, TCalendarDay, TMonthStats } from '@/types/habit'
import {
    generateCalendarWithData,
    calculateMonthStats,
    getMonthName,
    getWeekDayNames,
    formatCalendarDate,
    isToday,
    isCurrentMonth
} from '@/utils/calendarHelpers'

interface HabitCalendarProps {
    entries: THabitEntry[]
    habitTitle?: string
    habitIcon?: string
    habitColor?: string
    targetValue?: number
    unit?: string
    onDayClick?: (day: TCalendarDay) => void
    config?: Partial<TCalendarConfig>
    className?: string
}

interface CalendarTooltipProps {
    day: TCalendarDay
    targetValue?: number
    unit?: string
    position: { x: number; y: number }
    isVisible: boolean
}

const CalendarTooltip: React.FC<CalendarTooltipProps> = ({
    day,
    targetValue,
    unit,
    position,
    isVisible
}) => {
    if (!isVisible) return null

    const hasData = day.entries.length > 0

    return (
        <div
            className="fixed z-50 bg-gray-900 text-white text-sm rounded-lg p-3 shadow-lg pointer-events-none"
            style={{
                left: position.x,
                top: position.y,
                transform: 'translate(-50%, -100%)',
                marginTop: '-8px'
            }}
        >
            <div className="font-medium mb-1">
                {formatCalendarDate(day.date, 'long')}
            </div>

            {hasData ? (
                <div className="space-y-1">
                    <div className="text-gray-300">
                        Выполнено: {day.completionRate}%
                    </div>
                    {day.totalValue > 0 && (
                        <div className="text-gray-300">
                            Значение: {day.totalValue} {unit || ''}
                        </div>
                    )}
                    {day.entries.length > 0 && day.entries[0].note && (
                        <div className="text-gray-300 text-xs mt-2 max-w-48">
                            📝 {day.entries[0].note}
                        </div>
                    )}
                    {day.streak && (
                        <div className="text-orange-400 text-xs">
                            🔥 Streak день
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-gray-400">
                    Нет записей
                </div>
            )}
        </div>
    )
}

const CalendarStatsPanel: React.FC<{ stats: TMonthStats }> = ({
    stats,
}) => (
    <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3"> Активных дней за месяц: {stats.activeDays} </h3>
    </div>
)

const HabitCalendar: React.FC<HabitCalendarProps> = ({
    entries,
    habitTitle,
    habitIcon,
    habitColor = '#3B82F6',
    targetValue,
    unit,
    onDayClick,
    config: configOverrides = {},
    className = ''
}) => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [showSettings, setShowSettings] = useState(false)
    const [tooltip, setTooltip] = useState<{
        day: TCalendarDay | null
        position: { x: number; y: number }
        isVisible: boolean
    }>({
        day: null,
        position: { x: 0, y: 0 },
        isVisible: false
    })

    // Конфигурация по умолчанию
    const defaultConfig: TCalendarConfig = {
        showMood: false,
        colorScheme: 'green',
        showStreaks: true,
        startWeekOn: 'monday'
    }

    const config = { ...defaultConfig, ...configOverrides }
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    // Генерируем календарные данные
    const calendarData = useMemo(() => {
        return generateCalendarWithData(currentYear, currentMonth, entries, config)
    }, [currentYear, currentMonth, entries, config])

    // Вычисляем статистику
    const monthStats = useMemo(() => {
        return calculateMonthStats(calendarData, currentMonth)
    }, [calendarData, currentMonth])

    // Получаем названия дней недели
    const weekDayNames = getWeekDayNames(config.startWeekOn)

    // Навигация по месяцам
    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev)
            if (direction === 'prev') {
                newDate.setMonth(prev.getMonth() - 1)
            } else {
                newDate.setMonth(prev.getMonth() + 1)
            }
            return newDate
        })
    }

    const goToToday = () => {
        setCurrentDate(new Date())
    }

    // Обработчики мыши для tooltip
    const handleMouseEnter = (day: TCalendarDay, event: React.MouseEvent) => {
        const rect = event.currentTarget.getBoundingClientRect()
        setTooltip({
            day,
            position: {
                x: rect.left + rect.width / 2,
                y: rect.top
            },
            isVisible: true
        })
    }

    const handleMouseLeave = () => {
        setTooltip(prev => ({ ...prev, isVisible: false }))
    }

    // Обработчик клика по дню
    const handleDayClick = (day: TCalendarDay) => {
        if (onDayClick) {
            onDayClick(day)
        }
    }

    // CSS стили для интенсивности
    const getIntensityStyles = (intensity: number) => {
        const alpha = intensity * 0.15 + 0.05 // 0.05 to 0.65
        return {
            backgroundColor: intensity > 0 ? `${habitColor}${Math.round(alpha * 255).toString(16).padStart(2, '0')}` : '#f3f4f6',
            border: intensity > 0 ? `1px solid ${habitColor}40` : '1px solid #e5e7eb'
        }
    }

    return (
        <div className={`habit-calendar ${className}`}>
            {/* Заголовок и навигация */}
            <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {habitIcon && (
                                <span className="text-2xl">{habitIcon}</span>
                            )}
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {habitTitle ? `Календарь: ${habitTitle}` : 'Календарь привычки'}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Heat map активности по дням. Нажмите на день для редактирования записи.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Навигация по месяцам */}
                    <div className="flex items-center justify-between mt-4">
                        <button
                            onClick={() => navigateMonth('prev')}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <FaChevronLeft className="w-4 h-4" />
                        </button>

                        <h3 className="text-xl font-semibold">
                            {getMonthName(currentMonth)} {currentYear}
                        </h3>

                        <button
                            onClick={() => navigateMonth('next')}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <FaChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Статистика */}
                <div className="p-4 border-b">
                    <CalendarStatsPanel stats={monthStats} />
                </div>

                {/* Календарная сетка */}
                <div className="p-4">
                    {/* Заголовки дней недели */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDayNames.map(dayName => (
                            <div
                                key={dayName}
                                className="text-center text-xs font-medium text-gray-500 py-2"
                            >
                                {dayName}
                            </div>
                        ))}
                    </div>

                    {/* Дни календаря */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarData.map((day, index) => {
                            const isCurrentMonthDay = isCurrentMonth(day.date, currentMonth)
                            const isTodayDay = isToday(day.date)

                            return (
                                <div
                                    key={index}
                                    className={`
                                        relative aspect-square min-h-[32px] rounded cursor-pointer
                                        transition-all duration-200 
                                        ${isTodayDay ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                                        ${isCurrentMonthDay ? 'hover:shadow-md hover:scale-105' : 'opacity-40'}
                                    `}
                                    style={getIntensityStyles(day.intensity)}
                                    onMouseEnter={(e) => handleMouseEnter(day, e)}
                                    onMouseLeave={handleMouseLeave}
                                    onClick={() => handleDayClick(day)}
                                    title={`${formatCalendarDate(day.date)} - ${day.completionRate}%`}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className={`
                                            text-xs font-medium
                                            ${day.intensity > 2 ? 'text-white' : 'text-gray-700'}
                                            ${!isCurrentMonthDay ? 'text-gray-400' : ''}
                                        `}>
                                            {day.date.getDate()}
                                        </span>
                                    </div>

                                    {/* Индикатор streak */}
                                    {day.streak && config.showStreaks && (
                                        <div className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full"></div>
                                    )}

                                    {/* Индикатор настроения */}
                                    {config.showMood && day.entries.length > 0 && day.entries[0].mood && (
                                        <div className="absolute bottom-0 left-0 text-xs">
                                            {day.entries[0].mood === 'EXCELLENT' ? '😃' :
                                                day.entries[0].mood === 'GOOD' ? '🙂' :
                                                    day.entries[0].mood === 'NEUTRAL' ? '😐' :
                                                        day.entries[0].mood === 'BAD' ? '😔' : '😞'}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Легенда интенсивности */}
                    <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
                        <span>Меньше</span>
                        <div className="flex gap-1">
                            {[0, 1, 2, 3, 4].map(intensity => (
                                <div
                                    key={intensity}
                                    className="w-3 h-3 rounded-sm"
                                    style={getIntensityStyles(intensity)}
                                />
                            ))}
                        </div>
                        <span>Больше</span>
                    </div>
                </div>
            </div>

            {/* Tooltip */}
            {tooltip.day && (
                <CalendarTooltip
                    day={tooltip.day}
                    targetValue={targetValue}
                    unit={unit}
                    position={tooltip.position}
                    isVisible={tooltip.isVisible}
                />
            )}
        </div>
    )
}

export default HabitCalendar

