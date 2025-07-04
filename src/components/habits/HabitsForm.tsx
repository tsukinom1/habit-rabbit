'use client'
import { useForm } from 'react-hook-form'
import MyInput from '../ui/MyInput'
import MySelect from '../ui/MySelect'
import MyToggle from '../ui/MyToggle'
import MyButton from '../ui/MyButton'
import { THabit } from '@/types/habit'
import { useHabit } from '@/hooks/useHabit'
import MyTextarea from '../ui/MyTextarea'
import { FaTimes } from 'react-icons/fa'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface HabitsFormProps {
    editingHabit?: THabit | null
    mode?: 'create' | 'edit'
}

export default function HabitsForm({ editingHabit, mode = 'create' }: HabitsFormProps) {
    const router = useRouter()
    const { createHabit, updateHabit } = useHabit()
    const { register, handleSubmit, reset, setValue, watch } = useForm()

    // Маппинг иконок
    const iconMapping = {
        '🏋️': 'fitness',
        '💧': 'nutrition',
        '🍎': 'fruit',
        '🥗': 'healthy-food',
        '💊': 'vitamins',
        '✅': 'task',
        '🎯': 'focus',
        '⏰': 'time',
        '📋': 'plan',
        '📚': 'book',
        '📖': 'study',
        '🗣️': 'language',
        '✍️': 'write',
        '😴': 'sleep',
        '🧘‍♀️': 'meditation',
        '🌳': 'nature',
        '😊': 'smile',
        '🎨': 'art',
        '🎵': 'music',
        '📸': 'photo',
        '👨‍👩‍👧‍👦': 'family',
        '👥': 'friends',
        '📞': 'call',
        '💰': 'save',
        '📊': 'budget',
        '🧹': 'clean',
        '🍳': 'cook'
    }

    const reverseIconMapping = Object.fromEntries(
        Object.entries(iconMapping).map(([emoji, value]) => [value, emoji])
    )

    // Маппинг цветов
    const colorMapping = {
        '#22c55e': 'green',
        '#3b82f6': 'blue',
        '#eab308': 'yellow',
        '#a855f7': 'purple',
        '#f97316': 'orange',
        '#ec4899': 'pink'
    }

    const reverseColorMapping = {
        'green': '#22c55e',
        'blue': '#3b82f6',
        'yellow': '#eab308',
        'purple': '#a855f7',
        'orange': '#f97316',
        'pink': '#ec4899'
    }

    // Helper функция для преобразования привычки в данные формы
    const habitToFormData = (habit: THabit) => ({
        title: habit.title,
        description: habit.description || '',
        icon: iconMapping[habit.icon as keyof typeof iconMapping] || 'focus',
        color: colorMapping[habit.color as keyof typeof colorMapping] || 'blue',
        frequency: habit.frequency,
        targetValue: habit.targetValue,
        unit: habit.unit || '',
        reminderTime: habit.reminderTime || '',
        startDate: habit.startDate ? new Date(habit.startDate).toISOString().split('T')[0] : '',
        endDate: habit.endDate ? new Date(habit.endDate).toISOString().split('T')[0] : '',
        isActive: habit.isActive,
        isArchived: habit.isArchived
    })

    // Helper функция для преобразования данных формы в данные привычки
    const formDataToHabit = (data: any) => ({
        ...data,
        icon: reverseIconMapping[data.icon as keyof typeof reverseIconMapping] || '🎯',
        color: reverseColorMapping[data.color as keyof typeof reverseColorMapping] || '#3b82f6'
    })


    // Автоматическое заполнение формы данными при редактировании
    useEffect(() => {
        if (mode === 'edit' && editingHabit) {
            reset(habitToFormData(editingHabit))
        }
    }, [mode, editingHabit, reset])

    const onSubmit = async (data: Partial<THabit>) => {
        try {
            const processedData = formDataToHabit(data)

            if (mode === 'edit' && editingHabit) {
                await updateHabit(editingHabit.id, processedData)
                router.push(`/habits/${editingHabit.id}`)
            } else {
                const newHabit = await createHabit(processedData)
                router.push(`/habits/${newHabit.id}`)
            }
            reset()
        } catch (error) {
            console.error('Ошибка при сохранении привычки:', error)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='border p-4 rounded-lg shadow-lg'>
            <h1 className='text-4xl font-bold ml-2 text-center border-b border-gray-300 pb-2'>Habit Rabbit</h1>
            <div className='flex justify-between items-end my-4'>
                <h1 className='text-2xl font-bold ml-2'>
                    {mode === 'edit' ? 'Редактирование привычки' : 'Создание привычки'}
                </h1>
                <FaTimes
                    size={30}
                    onClick={() => router.back()}
                    className='cursor-pointer'
                />
            </div>

            <div className='grid md:grid-cols-2 gap-2'>
                <div className='space-y-2'>
                    <MyInput label='Название' type='text' placeholder='Название'
                        {...register('title',
                            {
                                required: {
                                    value: true,
                                    message: 'Название обязательно'
                                },
                                maxLength: {
                                    value: 30,
                                    message: 'Название должно быть не более 30 символов'
                                }
                            }
                        )} />

                    <MySelect label='Иконка' placeholder='Иконка'
                        options={[
                            { value: 'fitness', label: '🏋️ Спортзал' },

                            { value: 'nutrition', label: '💧 Вода' },
                            { value: 'fruit', label: '🍎 Фрукты' },
                            { value: 'healthy-food', label: '🥗 Здоровое питание' },
                            { value: 'vitamins', label: '💊 Витамины' },

                            // Продуктивность
                            { value: 'task', label: '✅ Задачи' },
                            { value: 'focus', label: '🎯 Фокус' },
                            { value: 'time', label: '⏰ Время' },
                            { value: 'plan', label: '📋 Планирование' },

                            // Обучение
                            { value: 'book', label: '📚 Чтение' },
                            { value: 'study', label: '📖 Изучение' },
                            { value: 'language', label: '🗣️ Языки' },
                            { value: 'write', label: '✍️ Письмо' },

                            // Здоровье
                            { value: 'sleep', label: '😴 Сон' },
                            { value: 'meditation', label: '🧘‍♀️ Медитация' },
                            { value: 'nature', label: '🌳 Природа' },
                            { value: 'smile', label: '😊 Позитив' },

                            // Творчество
                            { value: 'art', label: '🎨 Рисование' },
                            { value: 'music', label: '🎵 Музыка' },
                            { value: 'photo', label: '📸 Фото' },

                            // Социальные
                            { value: 'family', label: '👨‍👩‍👧‍👦 Семья' },
                            { value: 'friends', label: '👥 Друзья' },
                            { value: 'call', label: '📞 Звонки' },

                            // Финансы
                            { value: 'save', label: '💰 Сбережения' },
                            { value: 'budget', label: '📊 Бюджет' },

                            // Дом
                            { value: 'clean', label: '🧹 Уборка' },
                            { value: 'cook', label: '🍳 Готовка' },
                        ]}
                        {...register('icon')}
                    />
                </div>

                <MyTextarea label='Описание' placeholder='Описание' rows={4} {...register('description', {
                    maxLength: {
                        value: 250,
                        message: 'Описание должно быть не более 250 символов'
                    }
                })} />

                <MySelect label='Цвет' placeholder='Цвет'
                    options={[
                        { value: 'green', label: 'Зелёный' },
                        { value: 'blue', label: 'Синий' },
                        { value: 'yellow', label: 'Жёлтый' },
                        { value: 'purple', label: 'Фиолетовый' },
                        { value: 'orange', label: 'Оранжевый' },
                        { value: 'pink', label: 'Розовый' },
                    ]}
                    {...register('color')}
                />

                <MySelect label='Частота' placeholder='Частота'
                    options={[
                        { value: 'DAILY', label: 'Ежедневно' },
                        { value: 'WEEKLY', label: 'Еженедельно' },
                        { value: 'MONTHLY', label: 'Ежемесячно' },
                        { value: 'CUSTOM', label: 'Другое' }]}
                    {...register('frequency', {
                        required: {
                            value: true,
                            message: 'Частота обязательна'
                        }
                    })} />

                <MyInput label='Целевое значение' type='number' placeholder='Целевое значение' {...register('targetValue', {
                    required: {
                        value: true,
                        message: 'Укажите значение в цифрах'
                    }
                })} />


                <MySelect label='Единица измерения' placeholder='Единица измерения'
                    options={[
                        { value: 'count', label: 'Количество' },
                        { value: 'minutes', label: 'Минуты' },
                        { value: 'hours', label: 'Часы' },
                        { value: 'days', label: 'Дни' },
                        { value: 'months', label: 'Месяцы' },
                        { value: 'meters', label: 'Метры' },
                        { value: 'kilometers', label: 'Километры' },
                        { value: 'items', label: 'Штуки' },
                        { value: 'percent', label: 'Проценты' },
                        { value: 'other', label: 'Другое' },
                    ]}

                    {...register('unit', {
                    })}
                />


                <MyInput 
                    label='Время напоминания' 
                    type='time' 
                    placeholder='HH:MM' 
                    {...register('reminderTime')} 
                />

                <MyInput label='Дата начала' type='date' placeholder='Дата начала' {...register('startDate', {
                    required: {
                        value: true,
                        message: 'Дата начала обязательна'
                    }
                })} />
                <MyInput label='Дата окончания' type='date' placeholder='Дата окончания' {...register('endDate')} />

                <div className='flex'>

                    <MyToggle
                        label='Активная'
                        {...register('isActive')}
                    />
                    <MyToggle
                        label='Архивная'
                        {...register('isArchived')}
                    />
                </div>
            </div>

            <div className='flex justify-center items-center my-4 gap-4'>
                <MyButton type='submit' className='py-2 bg-blue-500 text-white'>
                    {mode === 'edit' ? 'Обновить' : 'Создать'}
                </MyButton>
                <MyButton
                    type='button'
                    className='py-2 bg-red-500 text-white'
                    onClick={() => router.back()}
                >
                    Отмена
                </MyButton>
            </div>
        </form>
    )
}
