'use client'
import HabitsForm from '@/components/habits/HabitsForm'
import { useHabit } from '@/hooks/useHabit'
import { useEffect, useState } from 'react'
import { FaCalendarAlt, FaCircle } from 'react-icons/fa'
import MyButton from '@/components/ui/MyButton'
import { THabit } from '@/types/habit'
import MySelect from '@/components/ui/MySelect'
import { useRouter } from 'next/navigation'
import { getFrequencyText, getTargetText, getActiveStatusText, formatDisplayDate, getPeriodText, isHabitCompletedToday, isHabitFullyCompletedToday, getLastHabitEntry, getStreakStatus, getMotivationMessage } from '@/utils/habitHelpers'


export default function HabitsPage() {
    const router = useRouter()
    const [expandedHabits, setExpandedHabits] = useState<Set<string>>(new Set())
    const { habits, updateHabit, deleteHabit } = useHabit()
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'archived'>('all')

    const filteredHabits = habits.filter(habit => {
        if (filter === 'all') return true
        if (filter === 'active') return habit.isActive
        if (filter === 'inactive') return !habit.isActive
        if (filter === 'archived') return habit.isArchived
        return false
    })

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



    return (
        <div className='container py-4 space-y-4'>
            {/* Фильтры */}
            <div className='flex justify-between items-center gap-2'>
                <h1 className='text-2xl font-bold'>Привычки</h1>
                <MyButton onClick={() => router.push('/habits/create')}>
                    Добавить привычку
                </MyButton>
                <MySelect
                    className='w-40'
                    options={[
                        { value: 'all', label: 'Все' },
                        { value: 'active', label: 'Активные' },
                        { value: 'inactive', label: 'Неактивные' },
                        { value: 'archived', label: 'Архивные' }]}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'inactive' | 'archived')}
                />
            </div>


            <div className='space-y-4'>
                {filteredHabits.map((habit, index) => (
                    <div key={habit.id} className='p-4 rounded-lg shadow-lg border cursor-pointer'
                        style={{ borderColor: habit.color }}
                        onClick={() => handleToggleExpand(habit.id)}>

                        {/* Краткая информация */}
                        <div className='space-y-2'>
                            <h2 className='text-lg font-bold flex items-center justify-between'
                                style={{ color: habit.color }}
                            >
                                <span className='text-subtext mr-1'>{habits.length - index}.
                                    {habit.icon} {habit.title}
                                </span>
                                <div className='flex items-center gap-2'>
                                    {/* Статус выполнения сегодня */}
                                    {(() => {
                                        const isActive = isHabitCompletedToday(habit.entries)
                                        const isFullyCompleted = isHabitFullyCompletedToday(habit.entries)
                                        
                                        if (isFullyCompleted) {
                                            return (
                                                <span className='text-emerald-600 text-sm font-semibold bg-emerald-100 px-2 py-1 rounded-full'>
                                                    🎉 Цель достигнута!
                                                </span>
                                            )
                                        } else if (isActive) {
                                            return (
                                                <span className='text-blue-600 text-sm font-semibold bg-blue-100 px-2 py-1 rounded-full'>
                                                    📈 В процессе
                                                </span>
                                            )
                                        } else {
                                            return (
                                                <span className='text-orange-600 text-sm font-semibold bg-orange-100 px-2 py-1 rounded-full'>
                                                    ⏰ Ожидает выполнения
                                                </span>
                                            )
                                        }
                                    })()}
                                    <span className='cursor-pointer text-sm' onClick={() => handleToggleExpand(habit.id)}>
                                        {expandedHabits.has(habit.id) ? 'свернуть 🔽' : 'развернуть ▶️'}
                                    </span>
                                </div>
                            </h2>
                            
                            {/* Информация о streak */}
                            {(() => {
                                const lastEntry = getLastHabitEntry(habit.entries)
                                const streakStatus = getStreakStatus(habit.currentStreak, lastEntry)
                                return (
                                    <div className={`text-sm font-semibold ${streakStatus.color} flex items-center gap-1`}>
                                        <span>{streakStatus.icon}</span>
                                        <span>{streakStatus.text}</span>
                                    </div>
                                )
                            })()}
                            
                            <p className='text-md text-gray-500 flex items-center '>
                                <FaCalendarAlt size={20} className='inline-block mr-2' />
                                <span className='font-bold'>{getFrequencyText(habit.frequency)}</span>
                                <span className='font-bold ml-1'>({getTargetText(habit.targetValue, habit.unit)})</span>
                            </p>
                            
                            <p className='text-md text-gray-500 flex items-center'>
                                <FaCircle size={20} className={`${habit.isActive ? 'text-success' : 'text-error'} inline-block mr-2`} />
                                <span className='font-bold'>{getPeriodText(habit.startDate, habit.endDate)}</span>
                            </p>
                            
                            {/* Мотивационное сообщение */}
                            <div className='text-sm text-blue-600 italic'>
                                {getMotivationMessage(habit.currentStreak)}
                            </div>
                        </div>

                        {/* Дополнительная информация */}
                        {expandedHabits.has(habit.id) && (
                            <div className='mt-4 py-2 border-t'
                                style={{ borderColor: habit.color }}
                            >

                                <h1 className='flex items-center justify-between'>
                                    <p className='text-lg font-bold'>Дополнительная информация</p>
                                    <p className='font-semibold underline text-blue-700 cursor-pointer' onClick={() => router.push(`/habits/${habit.id}`)}>подробнее</p>
                                </h1>
                                <p className='text-md'><b>Описание:</b> {habit.description || 'Описание не указано'}</p>
                                <p className='text-md'><b>Время напоминания:</b> {habit.reminderTime || 'Время напоминания не указано'}</p>
                                <p className='text-md'><b>Дата создания:</b> {formatDisplayDate(habit.createdAt)}</p>
                                <p className='text-md'><b>Дата обновления:</b> {formatDisplayDate(habit.updatedAt)}</p>
                                <p className='text-md'><b>Статус:</b> {getActiveStatusText(habit.isActive)}</p>
                                <p className='text-md'><b>Архивная:</b> {habit.isArchived ? 'Да' : 'Нет'}</p>
                                
                                {/* Красивая статистика */}
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 my-4'>
                                    <div className='bg-orange-50 p-3 rounded-lg border border-orange-200'>
                                        <div className='text-orange-600 text-2xl font-bold'>🔥 {habit.currentStreak}</div>
                                        <div className='text-sm text-orange-700'>Текущая серия дней</div>
                                    </div>
                                    <div className='bg-green-50 p-3 rounded-lg border border-green-200'>
                                        <div className='text-green-600 text-2xl font-bold'>👑 {habit.longestStreak}</div>
                                        <div className='text-sm text-green-700'>Лучшая серия дней</div>
                                    </div>
                                    <div className='bg-blue-50 p-3 rounded-lg border border-blue-200'>
                                        <div className='text-blue-600 text-2xl font-bold'>📝 {habit.totalEntries}</div>
                                        <div className='text-sm text-blue-700'>Всего записей</div>
                                    </div>
                                </div>
                                <div className='flex gap-2'>

                                    <MyButton className='mt-2' onClick={() => deleteHabit(habit.id)}>
                                        Удалить привычку
                                    </MyButton>
                                    <MyButton className='mt-2' onClick={() => updateHabit(habit.id, { isActive: !habit.isActive })}>
                                        {habit.isActive ? 'Деактивировать' : 'Активировать'}
                                    </MyButton>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

        </div >
    )
}
