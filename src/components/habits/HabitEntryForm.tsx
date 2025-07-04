'use client'
import { useForm, useWatch } from 'react-hook-form'
import MyInput from '../ui/MyInput'
import MySelect from '../ui/MySelect'
import MyButton from '../ui/MyButton'
import MyTextarea from '../ui/MyTextarea'
import { THabitEntry, THabit } from '@/types/habit'
import useHabitEntry from '@/hooks/useHabitEntry'
import { FaTimes } from 'react-icons/fa'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { notify } from '@/hooks/useNotification'
import { getUnitText, formatValueWithUnit } from '@/utils/habitHelpers'

interface HabitEntryFormProps {
    habitId: string
    editingEntry?: THabitEntry | null
    mode?: 'create' | 'edit'
    onClose?: () => void
    onEntryUpdate?: () => Promise<void> // Callback для обновления данных привычки
    currentHabit?: THabit // Передаем данные привычки как проп
    selectedDate?: Date | null // Предварительно выбранная дата из календаря
}

export default function HabitEntryForm({
    habitId,
    editingEntry,
    mode = 'create',
    onClose,
    onEntryUpdate,
    currentHabit,
    selectedDate = null
}: HabitEntryFormProps) {
    const router = useRouter()
    const { createHabitEntry, updateHabitEntry } = useHabitEntry(habitId)

    const { register, handleSubmit, reset, control, formState: { isSubmitting } } = useForm({
        defaultValues: {
            date: new Date().toISOString().split('T')[0], // Сегодняшняя дата по умолчанию
            value: currentHabit?.targetValue || 1,
            note: '',
            mood: 'NEUTRAL'
        }
    })

    // Отслеживаем изменения в поле value для real-time прогресса
    const watchedValue = useWatch({ control, name: 'value' })

    // Маппинг настроений для отображения
    const moodOptions = [
        { value: 'TERRIBLE', label: '😞 Ужасно' },
        { value: 'BAD', label: '😕 Плохо' },
        { value: 'NEUTRAL', label: '😐 Нейтрально' },
        { value: 'GOOD', label: '😊 Хорошо' },
        { value: 'EXCELLENT', label: '😃 Отлично' }
    ]

    // Обновляем дефолтное значение когда привычка загрузится или изменится выбранная дата
    useEffect(() => {
        if (currentHabit && mode === 'create') {
            const dateToUse = selectedDate 
                ? selectedDate.toISOString().split('T')[0] 
                : new Date().toISOString().split('T')[0]
                
            reset({
                date: dateToUse,
                value: currentHabit.targetValue || 1,
                note: '',
                mood: 'NEUTRAL'
            })
        }
    }, [currentHabit, mode, reset, selectedDate])

    // Автоматическое заполнение формы при редактировании
    useEffect(() => {
        if (mode === 'edit' && editingEntry) {
            reset({
                date: new Date(editingEntry.date).toISOString().split('T')[0],
                value: editingEntry.value,
                note: editingEntry.note || '',
                mood: editingEntry.mood
            })
        }
    }, [mode, editingEntry, reset])

    const onSubmit = async (data: any) => {
        try {
            const entryData = {
                date: data.date, // Отправляем как строку для API
                value: Number(data.value),
                note: data.note,
                mood: data.mood
            }

            if (mode === 'edit' && editingEntry) {
                await updateHabitEntry(habitId, editingEntry.id, entryData)
            } else {
                await createHabitEntry(habitId, entryData)
            }

            // Обновляем данные привычки чтобы показать новую запись
            if (onEntryUpdate) {
                await onEntryUpdate()
            }

            reset()

            // Закрываем форму или возвращаемся назад
            if (onClose) {
                onClose()
            } else {
                router.back()
            }
        } catch (error) {
            notify.error('Ошибка при сохранении записи')
        }
    }

    const handleCancel = () => {
        if (onClose) {
            onClose()
        } else {
            router.back()
        }
    }

    return (
        <div className='border p-4 rounded-lg shadow-lg bg-white'>
            <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-bold'>
                    {mode === 'edit' ? 'Редактирование записи' : 'Новая запись привычки'}
                </h2>
                <FaTimes
                    size={24}
                    onClick={handleCancel}
                    className='cursor-pointer text-gray-500 hover:text-gray-700'
                />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                <div className='grid md:grid-cols-2 gap-4'>
                    {/* Дата */}
                    <MyInput
                        label='Дата'
                        type='date'
                        placeholder='Выберите дату'
                        {...register('date', {
                            required: {
                                value: true,
                                message: 'Дата обязательна'
                            }
                        })}
                    />

                    {/* Значение с контекстом */}
                    <div>
                        <MyInput
                            label={currentHabit ? 
                                `Значение (${getUnitText(currentHabit.unit)})` + 
                                (currentHabit.targetValue ? ` — цель: ${currentHabit.targetValue}` : '') 
                                : 'Значение'
                            }
                            type='number'
                            min='0'
                            step='0.1'
                            placeholder={currentHabit?.targetValue ? 
                                `Введите от 0 до ${currentHabit.targetValue}` : 
                                'Введите значение'
                            }
                            {...register('value', {
                                required: {
                                    value: true,
                                    message: 'Значение обязательно'
                                },
                                min: {
                                    value: 0,
                                    message: 'Значение не может быть отрицательным'
                                }
                            })}
                        />
                        
                        {/* Real-time прогресс */}
                        {currentHabit?.targetValue && currentHabit.targetValue > 0 && watchedValue && (
                            <div className='mt-2 space-y-1'>
                                <div className='flex justify-between text-sm'>
                                    <span className='text-gray-600'>
                                        {watchedValue} из {currentHabit.targetValue} {getUnitText(currentHabit.unit)}
                                    </span>
                                    <span className={`font-medium ${Number(watchedValue) >= currentHabit.targetValue ? 'text-green-600' : 'text-gray-600'}`}>
                                        {Math.round((Number(watchedValue) / currentHabit.targetValue) * 100)}%
                                    </span>
                                </div>
                                <div className='w-full h-2 bg-gray-200 rounded-full overflow-hidden'>
                                    <div 
                                        className='h-full transition-all duration-300'
                                        style={{ 
                                            width: `${Math.min((Number(watchedValue) / currentHabit.targetValue) * 100, 100)}%`,
                                            backgroundColor: Number(watchedValue) >= currentHabit.targetValue ? '#16a34a' : currentHabit.color || '#3b82f6'
                                        }}
                                    />
                                </div>
                                {Number(watchedValue) >= currentHabit.targetValue && (
                                    <div className='text-sm text-green-600 font-medium'>
                                        🎉 Цель достигнута!
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Настроение */}
                    <MySelect
                        label='Настроение'
                        placeholder='Выберите настроение'
                        options={moodOptions}
                        {...register('mood', {
                            required: {
                                value: true,
                                message: 'Настроение обязательно'
                            }
                        })}
                    />
                </div>

                {/* Заметка */}
                <MyTextarea
                    label='Заметка'
                    placeholder='Опишите как прошло выполнение привычки...'
                    rows={4}
                    {...register('note', {
                        maxLength: {
                            value: 500,
                            message: 'Заметка должна быть не более 500 символов'
                        }
                    })}
                />

                {/* Кнопки */}
                <div className='flex justify-end gap-3 pt-4'>
                    <MyButton
                        type='button'
                        className='px-4 py-2 bg-gray-500 text-white hover:bg-gray-600'
                        onClick={handleCancel}
                    >
                        Отмена
                    </MyButton>
                    <MyButton
                        type='submit'
                        className='px-4 py-2 bg-blue-500 text-white hover:bg-blue-600'
                    >
                        {isSubmitting ? 'Сохранение...' : (mode === 'edit' ? 'Обновить' : 'Создать')}
                    </MyButton>
                </div>
            </form>
        </div>
    )
}
