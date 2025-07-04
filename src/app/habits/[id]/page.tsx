'use client'
import React, { useState, useEffect } from 'react'
import { FaCalendarAlt, FaCircle, FaClock, FaStickyNote, FaEdit, FaTrash } from 'react-icons/fa'
import { useParams, useRouter } from 'next/navigation'
import { useHabit } from '@/hooks/useHabit'
import Loader from '@/components/ui/Loader'
import Link from 'next/link'
import { getFrequencyText, getTargetText, getActiveStatusText, getPeriodText, formatDisplayDate, calculateProgress, isGoalCompleted, getProgressColor, getProgressBgColor, getCompletionStatusText, formatValueWithUnit, getUnitText, getMoodText, isHabitCompletedToday, isHabitFullyCompletedToday, getLastHabitEntry, getStreakStatus, getMotivationMessage } from '@/utils/habitHelpers'
import MyButton from '@/components/ui/MyButton'
import HabitEntryForm from '@/components/habits/HabitEntryForm'
import HabitCalendar from '@/components/habits/HabitCalendar'
import useHabitCalendar from '@/hooks/useHabitCalendar'
import useHabitEntry from '@/hooks/useHabitEntry'
import { TCalendarDay, THabitEntry } from '@/types/habit'

export default function HabitPage() {
    const { id } = useParams()
    const { currentHabit, currentHabitLoading, habitError, refreshCurrentHabit, recalculateStreaks } = useHabit(id as string)
    const router = useRouter()

    const [isCreateEntry, setIsCreateEntry] = useState(false)
    const [hasRecalculated, setHasRecalculated] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<{
        isOpen: boolean
        entry: THabitEntry | null
    }>({ isOpen: false, entry: null })

    // Календарный хук
    const {
        calendarData,
        monthStats,
        loading: calendarLoading,
        error: calendarError,
        config: calendarConfig,
        updateConfig: updateCalendarConfig,
        refreshCalendarData
    } = useHabitCalendar({
        habitId: id as string,
        autoLoad: true,
        config: {
            showMood: true,
            colorScheme: 'green',
            showStreaks: true,
            startWeekOn: 'monday'
        }
    })

    // Хук для работы с записями привычек
    const { deleteHabitEntry } = useHabitEntry(id as string)


    // Автоматический пересчет streak при первой загрузке
    useEffect(() => {
        if (currentHabit && !hasRecalculated) {
            recalculateStreaks()
            setHasRecalculated(true)
        }
    }, [currentHabit, hasRecalculated, recalculateStreaks])

    // Обработчик клика по дню календаря
    const handleCalendarDayClick = (day: TCalendarDay) => {
        setSelectedDate(day.date)
        setIsCreateEntry(true)
    }

    // Обновление календаря после создания/обновления записи
    const handleEntryUpdate = async () => {
        await refreshCurrentHabit()
        await refreshCalendarData()
        setIsCreateEntry(false)
        setSelectedDate(null)
    }

    // Обработчик удаления записи
    const handleDeleteEntry = (entry: THabitEntry) => {
        setDeleteConfirm({ isOpen: true, entry })
    }

    // Подтверждение удаления записи
    const confirmDeleteEntry = async () => {
        if (!deleteConfirm.entry || !currentHabit) return

        try {
            await deleteHabitEntry(currentHabit.id, deleteConfirm.entry.id)
            await refreshCurrentHabit()
            await refreshCalendarData()
            setDeleteConfirm({ isOpen: false, entry: null })
        } catch (error) {
            // Ошибка уже обработана в хуке
            console.error('Ошибка при удалении записи:', error)
        }
    }

    // Отмена удаления записи
    const cancelDeleteEntry = () => {
        setDeleteConfirm({ isOpen: false, entry: null })
    }
    // Функция для получения эмодзи настроения
    const getMoodEmoji = (mood: string) => {
        switch (mood) {
            case 'TERRIBLE': return '😞'
            case 'BAD': return '😕'
            case 'NEUTRAL': return '😐'
            case 'GOOD': return '😊'
            case 'EXCELLENT': return '😃'
            default: return '😐'
        }
    }

    // Функция для получения цвета настроения
    const getMoodColor = (mood: string) => {
        switch (mood) {
            case 'TERRIBLE': return 'text-red-600'
            case 'BAD': return 'text-orange-600'
            case 'NEUTRAL': return 'text-gray-600'
            case 'GOOD': return 'text-green-600'
            case 'EXCELLENT': return 'text-emerald-600'
            default: return 'text-gray-600'
        }
    }

    if (currentHabitLoading) {
        return (
            <div className="container py-4">
                <Loader />
            </div>
        )
    }

    if (habitError) {
        return (
            <div className="container py-4">
                <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                    {habitError}
                </div>
            </div>
        )
    }

    if (!currentHabit) {
        return (
            <div className="container py-4">
                <div className="p-4 bg-gray-100 text-gray-700 rounded-lg">
                    Привычка не найдена, вернитесь на <Link href="/habits">страницу привычек</Link>
                </div>
            </div>
        )
    }

    return (
        <div className='container py-4 space-y-4'>
            {/* Информация о привычке */}
            <div className='p-4 rounded-lg shadow-lg border'
                style={{ borderColor: currentHabit.color }}>
                <div className='space-y-3'>
                    <h1 className='text-2xl font-bold flex items-center'
                        style={{ color: currentHabit.color }}>
                        <span className='mr-2'>{currentHabit.icon}</span>
                        {currentHabit.title}
                    </h1>

                    {currentHabit.description && (
                        <p className='text-gray-600'>
                            {currentHabit.description}
                        </p>
                    )}

                    <div className='flex flex-wrap gap-4 text-sm text-gray-500'>
                        <div className='flex items-center'>
                            <FaCalendarAlt size={16} className='mr-2' />
                            <span className='font-medium'>
                                {getFrequencyText(currentHabit.frequency)}
                            </span>
                        </div>

                        <div className='flex items-center'>
                            <span className='font-medium'>
                                Цель: {getTargetText(currentHabit.targetValue, currentHabit.unit)}
                            </span>
                        </div>

                        <div className='flex items-center'>
                            <FaCircle
                                size={16}
                                className={`mr-2 ${currentHabit.isActive ? 'text-green-500' : 'text-red-500'}`}
                            />
                            <span className='font-medium'>
                                {getActiveStatusText(currentHabit.isActive)}
                            </span>
                        </div>
                    </div>

                    <div className='text-sm text-gray-500'>
                        <span className='font-medium'>
                            {getPeriodText(currentHabit.startDate, currentHabit.endDate)}
                        </span>
                    </div>

                    <div className='flex gap-2'>
                        <MyButton className='mt-2' onClick={() => router.push(`/habits/${currentHabit.id}/edit`)}>
                            Редактировать привычку
                        </MyButton>
                        <MyButton className='mt-2' onClick={() => setIsCreateEntry(true)}>
                            Добавить заметку
                        </MyButton>
                    </div>
                </div>
            </div>

            {/* Статистика и статус streak */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                {/* Общая статистика */}
                <div className='bg-white p-6 rounded-lg shadow-lg border'>
                    <h3 className='text-lg font-semibold mb-4 text-gray-800'>📊 Статистика</h3>
                    <div className='grid grid-cols-3 gap-4'>
                        <div className='text-center'>
                            <div className='text-2xl font-bold text-orange-600'>🔥</div>
                            <div className='text-xl font-semibold text-gray-800'>{currentHabit.currentStreak}</div>
                            <div className='text-xs text-gray-500'>Текущая серия</div>
                        </div>
                        <div className='text-center'>
                            <div className='text-2xl font-bold text-green-600'>👑</div>
                            <div className='text-xl font-semibold text-gray-800'>{currentHabit.longestStreak}</div>
                            <div className='text-xs text-gray-500'>Лучшая серия</div>
                        </div>
                        <div className='text-center'>
                            <div className='text-2xl font-bold text-blue-600'>📝</div>
                            <div className='text-xl font-semibold text-gray-800'>{currentHabit.totalEntries}</div>
                            <div className='text-xs text-gray-500'>Всего записей</div>
                        </div>
                    </div>
                </div>

                {/* Статус и мотивация */}
                <div className='bg-white p-6 rounded-lg shadow-lg border'>
                    <h3 className='text-lg font-semibold mb-4 text-gray-800'>🎯 Статус сегодня</h3>
                    <div className='space-y-3'>
                        {/* Статус выполнения */}
                        <div className='flex items-center justify-between'>
                            <span className='text-sm text-gray-600'>Статус сегодня:</span>
                            {(() => {
                                const isActive = isHabitCompletedToday(currentHabit.entries)
                                const isFullyCompleted = isHabitFullyCompletedToday(currentHabit.entries)

                                if (isFullyCompleted) {
                                    return (
                                        <span className='bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold'>
                                            🎉 Цель достигнута!
                                        </span>
                                    )
                                } else if (isActive) {
                                    return (
                                        <span className='bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold'>
                                            📈 В процессе
                                        </span>
                                    )
                                } else {
                                    return (
                                        <span className='bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold'>
                                            ⏰ Ожидает выполнения
                                        </span>
                                    )
                                }
                            })()}
                        </div>

                        {/* Streak статус */}
                        {(() => {
                            const lastEntry = getLastHabitEntry(currentHabit.entries)
                            const streakStatus = getStreakStatus(currentHabit.currentStreak, lastEntry)
                            return (
                                <div className={`${streakStatus.color} p-3 bg-gray-50 rounded-lg`}>
                                    <div className='flex items-center gap-2 font-semibold'>
                                        <span className='text-lg'>{streakStatus.icon}</span>
                                        <span>{streakStatus.text}</span>
                                    </div>
                                </div>
                            )
                        })()}

                        {/* Мотивационное сообщение */}
                        <div className='bg-blue-50 p-3 rounded-lg'>
                            <div className='text-blue-700 font-medium text-sm'>
                                💪 {getMotivationMessage(currentHabit.currentStreak)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Календарь привычки */}
            {!isCreateEntry && (
                < div className='space-y-4'>
                    <HabitCalendar
                        entries={currentHabit.entries}
                        habitTitle={currentHabit.title}
                        habitIcon={currentHabit.icon}
                        habitColor={currentHabit.color}
                        targetValue={currentHabit.targetValue}
                        unit={currentHabit.unit}
                        onDayClick={handleCalendarDayClick}
                        config={calendarConfig}
                        className="calendar-section"
                    />
                </div>)
            }

            {/* Форма создания записи */}
            {
                isCreateEntry && (
                    <div className='space-y-4'>
                        <HabitEntryForm
                            habitId={currentHabit.id}
                            mode='create'
                            onClose={() => {
                                setIsCreateEntry(false)
                                setSelectedDate(null)
                            }}
                            onEntryUpdate={handleEntryUpdate}
                            currentHabit={currentHabit}
                            selectedDate={selectedDate}
                        />
                    </div>
                )
            }

            {/* Записи привычки */}
            <div className='bg-white rounded-lg shadow-lg border'>
                <div className='p-4 border-b'>
                    <div className='flex justify-between items-center'>
                        <h2 className='text-lg font-semibold'>Записи привычки</h2>
                        <div className='text-sm text-gray-500'>
                            Записей показано: {currentHabit.entries.length} | Всего: {currentHabit.totalEntries}
                        </div>
                    </div>
                </div>

                <div className='p-4'>
                    {currentHabit.entries.length > 0 ? (
                        <div className='space-y-3'>
                            {currentHabit.entries.map((entry) => (
                                <div key={entry.id}
                                    className='p-4 border rounded-lg hover:shadow-md transition-shadow bg-gray-50'>
                                    <div className='flex justify-between items-start'>
                                        {/* Основная информация */}
                                        <div className='flex-1 space-y-2'>
                                            <div className='flex items-center gap-4'>
                                                <div className='flex items-center gap-2'>
                                                    <FaClock size={14} className='text-gray-400' />
                                                    <span className='font-medium text-gray-700'>
                                                        {formatDisplayDate(entry.date)}
                                                    </span>
                                                </div>

                                                <div className='flex items-center gap-3'>
                                                    <div className='flex items-center gap-2'>
                                                        <span className='font-semibold text-md' style={{ color: currentHabit.color }}>
                                                            {entry.value !== null && entry.value !== undefined ? entry.value : 0}
                                                        </span>
                                                        {currentHabit.targetValue && (
                                                            <span className='text-md '>
                                                                из {currentHabit.targetValue}
                                                            </span>
                                                        )}
                                                        <span className='text-sm text-gray-500'>
                                                            {getUnitText(currentHabit.unit)}
                                                        </span>
                                                    </div>

                                                    {/* Прогресс */}
                                                    {currentHabit.targetValue && currentHabit.targetValue > 0 && (
                                                        <div className='flex items-center gap-2'>
                                                            <div className='w-16 h-2 bg-gray-200 rounded-full overflow-hidden'>
                                                                <div
                                                                    className='h-full bg-current transition-all duration-300'
                                                                    style={{
                                                                        width: `${Math.min(((entry.value || 0) / currentHabit.targetValue) * 100, 100)}%`,
                                                                        color: currentHabit.color
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className={`text-xs font-medium ${(entry.value || 0) >= currentHabit.targetValue ? 'text-green-600' : 'text-gray-600'}`}>
                                                                {Math.round(((entry.value || 0) / currentHabit.targetValue) * 100)}%
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className='flex items-center gap-1'>
                                                    <span className={`text-lg ${getMoodColor(entry.mood)}`}>
                                                        {getMoodEmoji(entry.mood)}
                                                    </span>
                                                    <span className={`text-sm font-medium ${getMoodColor(entry.mood)}`}>
                                                        {getMoodText(entry.mood)}
                                                    </span>
                                                </div>
                                            </div>

                                            {entry.note && (
                                                <div className='flex items-start gap-2 mt-2'>
                                                    <FaStickyNote size={14} className='text-gray-400 mt-1' />
                                                    <p className='text-sm text-gray-600 leading-relaxed'>
                                                        {entry.note}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Кнопки действий */}
                                        <div className='flex gap-2 ml-4'>

                                            <MyButton onClick={() => handleDeleteEntry(entry)} className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'>
                                                <FaTrash size={14} />
                                            </MyButton>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='text-center py-8'>
                            <div className='text-gray-400 mb-2'>
                                <FaStickyNote size={48} className='mx-auto' />
                            </div>
                            <h3 className='text-lg font-medium text-gray-600 mb-2'>
                                Пока нет записей
                            </h3>
                            <p className='text-gray-500 mb-4'>
                                Начните отслеживать свою привычку, добавив первую запись
                            </p>
                            <MyButton onClick={() => setIsCreateEntry(true)}>
                                Добавить первую запись
                            </MyButton>
                        </div>
                    )}
                </div>
            </div>

            {/* Модальное окно подтверждения удаления */}
            {deleteConfirm.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Подтверждение удаления
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Вы уверены, что хотите удалить эту запись? Это действие нельзя отменить.
                        </p>
                        {deleteConfirm.entry && (
                            <div className="bg-gray-50 p-3 rounded-lg mb-6">
                                <div className="text-sm text-gray-600">
                                    Дата: <span className="font-medium">{formatDisplayDate(deleteConfirm.entry.date)}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    Значение: <span className="font-medium">{deleteConfirm.entry.value}</span>
                                </div>
                                {deleteConfirm.entry.note && (
                                    <div className="text-sm text-gray-600">
                                        Заметка: <span className="font-medium">{deleteConfirm.entry.note}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="flex justify-end gap-3">
                            <MyButton
                                onClick={cancelDeleteEntry}
                                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Отмена
                            </MyButton>
                            <MyButton
                                onClick={confirmDeleteEntry}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                                Удалить
                            </MyButton>
                        </div>
                    </div>
                </div>
            )}
        </div >
    )
}
