'use client'
import HabitsForm from '@/components/habits/HabitsForm'
import { useHabit } from '@/hooks/useHabit'
import { useEffect, useState } from 'react'
import { FaCalendarAlt, FaCircle } from 'react-icons/fa'

export default function HabitsPage() {
    const [isEdit, setIsEdit] = useState<boolean>(false)
    const [expandedHabits, setExpandedHabits] = useState<Set<string>>(new Set())
    const { habits, refetch } = useHabit()

    const handleToggleExpand = (habitId: string) => {
        setExpandedHabits(prev => {
            const newSet = new Set(prev)
            if (newSet.has(habitId)) {
                newSet.delete(habitId)
            } else {
                newSet.add(habitId)
            }
            return newSet
        })
    }


    useEffect(() => {
        refetch()
    }, [isEdit])

    return (
        <div className='container py-4 space-y-4'>
            <h1 className='text-2xl font-bold' onClick={() => setIsEdit(true)}>Привычки</h1>
            {isEdit && <HabitsForm setIsEdit={setIsEdit} />}

            <div className='space-y-4'>
                {habits.map((habit, index) => (
                    <div key={habit.id} className='p-4 rounded-lg shadow-lg border cursor-pointer'
                        style={{ borderColor: habit.color }}
                        onClick={() => handleToggleExpand(habit.id)}>
                        <div className='space-y-1'>
                            <h2 className='text-lg font-bold flex items-center justify-between'
                                style={{ color: habit.color }}
                            >
                                <span className='text-subtext mr-1'>{habits.length - index}.
                                    {habit.icon} {habit.title}
                                </span>
                                <span className='text-sm hidden sm:block'>
                                    {expandedHabits.has(habit.id) ? 'свернуть 🔽' : 'развернуть ▶️'}
                                </span>
                            </h2>
                            <p className='text-md text-gray-500 flex items-center '>
                                <FaCalendarAlt size={20} className='inline-block mr-2' />
                                <span className='font-bold'> {habit.frequency === 'DAILY' ? 'Ежедневно' : habit.frequency === 'WEEKLY' ? 'Еженедельно' : habit.frequency === 'MONTHLY' ? 'Ежемесячно' : habit.frequency}</span>
                                <span className='font-bold ml-1'>({habit.targetValue} {habit.unit === 'count' ? 'раз' : habit.unit === 'minutes' ? 'минут' : habit.unit === 'hours' ? 'часов' : habit.unit === 'days' ? 'дней' : habit.unit === 'months' ? 'месяцев' : habit.unit === 'meters' ? 'метров' : habit.unit === 'kilometers' ? 'километров' : habit.unit === 'items' ? 'штук' : habit.unit === 'percent' ? 'процентов' : habit.unit === 'other' ? 'другое' : habit.unit})</span>
                            </p>
                            <p className='text-md text-gray-500 flex items-center'>
                                <FaCircle size={20} className={`${habit.isActive ? 'text-success' : 'text-error'} inline-block mr-2`} />
                                <span className='font-bold'>{String(habit?.startDate || 'Дата начала не указана').split('T')[0]} - </span>
                                <span className='font-bold ml-1'>{String(habit?.endDate || 'Дата финиша не указана').split('T')[0]}</span>
                            </p>
                        </div>

                        {expandedHabits.has(habit.id) && (
                            <div className='mt-4 p-3 border-t'
                                style={{ borderColor: habit.color }}
                            >
                                <h1 className='text-lg font-bold'>Подробная информация</h1>
                                <p className='text-md'><b>Описание:</b> {habit.description || 'Описание не указано'}</p>
                                <p className='text-md'><b>Время напоминания:</b> {habit.reminderTime || 'Время напоминания не указано'}</p>
                                <p className='text-md'><b>Дата создания:</b> {String(habit?.createdAt || 'Дата создания не указана').split('T')[0]}</p>
                                <p className='text-md'><b>Дата обновления:</b> {String(habit?.updatedAt || 'Дата обновления не указана').split('T')[0]}</p>
                                <p className='text-md'><b>Статус:</b> {habit.isActive ? 'Активная' : 'Неактивная'}</p>
                                <p className='text-md'><b>Архивная:</b> {habit.isArchived ? 'Да' : 'Нет'}</p>
                                <p className='text-md'><b>Текущая серия:</b> {habit.currentStreak || '0'}</p>
                                <p className='text-md'><b>Лучшая серия:</b> {habit.longestStreak || '0'}</p>
                                <p className='text-md'><b>Заметки:</b> {habit.entries.length || 'Записей о привычке нет'}</p>
                                {habit.entries.length > 0 && (
                                    <p className='text-md'><b>Всего заметок о привычке:</b> {habit.totalEntries || 'Записей о привычке еще нет'}</p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

        </div >
    )
}
