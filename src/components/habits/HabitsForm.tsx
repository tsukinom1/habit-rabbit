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

export default function HabitsForm({ setIsEdit }: { setIsEdit: (isEdit: boolean) => void }) {
    const { createHabit, habits } = useHabit()
    const { register, handleSubmit, reset, watch } = useForm()

    const onSubmit = (data: Partial<THabit>) => {
        createHabit(data)
        reset()
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='border p-4 rounded-lg shadow-lg'>
            <h1 className='text-4xl font-bold ml-2 text-center border-b border-gray-300 pb-2'>Habit Rabbit</h1>
            <div className='flex justify-between items-end'>
                <h1 className='text-2xl font-bold ml-2'>Редактирование привычки</h1>
                <FaTimes size={30} onClick={() => setIsEdit(false)} className='cursor-pointer' />
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


                <MyInput label='Время напоминания' type='time' placeholder='Время напоминания' {...register('reminderTime')} />
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
                <MyButton type='submit' className='py-2 bg-blue-500 text-white'>Сохранить</MyButton>
                <MyButton type='button' className='py-2 bg-red-500 text-white' onClick={() => setIsEdit(false)}>Отмена</MyButton>
            </div>
        </form>
    )
}
