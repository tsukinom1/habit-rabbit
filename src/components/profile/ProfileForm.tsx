'use client'
import { useFieldArray, useForm } from 'react-hook-form'
import { useProfile } from '@/hooks/useProfile'
import { TProfile } from '@/types/profile'
import MyInput from '@/components/ui/MyInput'
import { useEffect } from 'react'
import { notify } from '@/hooks/useNotification'
import MyButton from '@/components/ui/MyButton'
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa'
import MyTextarea from '@/components/ui/MyTextarea'
import MySelect from '../ui/MySelect'
import MyToggle from '../ui/MyToggle'
import { socialPlatforms } from '@/utils/socials'


export default function ProfileForm({ profile, setIsEdit, refetch }: {
    profile: TProfile | null,
    setIsEdit: (isEdit: boolean) => void,
    refetch: () => Promise<void>
}) {
    const { profileError, updateProfile } = useProfile()
    const { register, handleSubmit, reset, control, watch, setValue } = useForm()

    const watchedSocials = watch('socials')
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'socials'
    })

    const addSocial = () => {
        append({
            platform: '',
            url: '',
            username: ''
        })
    }

    const removeSocial = (index: number) => {
        remove(index)
    }

    const onSubmit = async (data: Partial<TProfile>) => {
        try {
            await updateProfile(data)
            await refetch()
            notify.success('Профиль обновлен')
            setIsEdit(false)
        } catch (error) {
            notify.error('Ошибка при обновлении профиля')
        }
    }

    useEffect(() => {
        if (profile) {
            const formData = { ...profile }

            // Преобразуем дату рождения в формат YYYY-MM-DD для input type="date"
            if (profile.birthDate) {
                try {
                    const date = new Date(profile.birthDate)
                    if (!isNaN(date.getTime())) {
                        // Форматируем дату в YYYY-MM-DD для HTML input
                        formData.birthDate = date.toISOString().split('T')[0]
                    }
                } catch (error) {
                    console.log('Error formatting birthDate for form:', error)
                }
            }

            reset(formData)
        }
    }, [profile, reset])

    useEffect(() => {
        if (watchedSocials) {
            watchedSocials.forEach((social: { platform?: string; username?: string; url?: string }, index: number) => {
                if (social?.platform && social?.username) {
                    const platform = socialPlatforms.find(p => p.value === social.platform)
                    if (platform?.urlTemplate) {
                        const generatedUrl = platform.urlTemplate.replace('{username}', social.username.replace('@', ''))
                        setValue(`socials.${index}.url`, generatedUrl)
                    }
                }
            })
        }
    }, [watchedSocials, setValue])

    if (profileError) return <p>{profileError}</p>
    return (
        <form onSubmit={handleSubmit(onSubmit)} className='fixed top-0 left-0 w-full h-screen bg-white z-[51] overflow-y-scroll'>
            <div className='container border !my-4 border-gray-300 rounded-lg p-4 bg-gray-100 space-y-4'>

                <h1 className='text-4xl font-bold ml-2 text-center border-b border-gray-300 pb-2'>Habit Rabbit</h1>
                <div className='flex justify-between items-end'>
                    <h1 className='text-2xl font-bold ml-2'>Редактирование профиля</h1>
                    <FaTimes size={30} onClick={() => setIsEdit(false)} className='cursor-pointer' />
                </div>


                <div className='space-y-2 border border-gray-300 rounded-lg p-4 bg-white'>
                    <h1 className='text-xl font-bold'>Персональная информация</h1>
                    <h1 className='text-md text-gray-500'>Совсем скоро тут будет возможность загрузить и аватарку</h1>
                    <div className='grid sm:grid-cols-2 gap-4'>
                        <MyInput label='Имя' placeholder='Имя' type='text' {...register('firstName', { required: true })} />
                        <MyInput label='Фамилия' placeholder='Фамилия' type='text' {...register('lastName', { required: true })} />
                        {/* <MyInput label='Аватар' placeholder='Аватар' type='file' {...register('avatar')} /> */}
                        <MySelect label='Пол' placeholder='Выберите пол'
                            options={[
                                { value: 'male', label: 'Мужчина' },
                                { value: 'female', label: 'Женщина' }
                            ]}
                            {...register('gender')} />
                        <MyInput label='Дата рождения' placeholder='Дата рождения' type='date' {...register('birthDate')} />
                        <MyInput label='Телефон' placeholder='Телефон' type='text' {...register('phone')} />
                        <MyTextarea label='Биография' placeholder='Биография' {...register('bio', { required: true })} />

                    </div>
                </div>

                <div className='space-y-2 border border-gray-300 rounded-lg p-4 bg-white'>
                    <h1 className='text-xl font-bold'>Местоположение</h1>
                    <div className='grid grid-cols-2 gap-4'>
                        <MyInput label='Страна' placeholder='Страна' type='text' {...register('country')} />
                        <MyInput label='Город' placeholder='Город' type='text' {...register('city')} />
                        <MyInput label='Адрес' placeholder='Адрес' type='text' {...register('address')} />
                    </div>
                </div>

                <div className='space-y-2 border border-gray-300 rounded-lg p-4 bg-white'>
                    <h1 className='text-xl font-bold'>Общее</h1>
                    <div className='grid grid-cols-2 gap-4'>
                        <MySelect label='Язык' placeholder='Выберите язык'
                            options={[
                                { value: 'ru', label: 'Русский' },
                                { value: 'en', label: 'Английский' },
                                { value: 'kz', label: 'Казахский' },
                                { value: 'other', label: 'Другой' },
                            ]}
                            {...register('language')} />

                        <MySelect label='Часовой пояс' placeholder='Выберите часовой пояс'
                            options={[
                                { value: 'UTC+0', label: 'UTC+0' },
                                { value: 'UTC+1', label: 'UTC+1' },
                                { value: 'UTC+2', label: 'UTC+2' },
                                { value: 'UTC+3', label: 'UTC+3' },
                                { value: 'UTC+4', label: 'UTC+4' },
                                { value: 'UTC+5', label: 'UTC+5' },
                                { value: 'UTC+6', label: 'UTC+6' },
                            ]} {...register('timezone')} />

                        <MyToggle
                            label='Публичный профиль'
                            {...register('isPublic')}
                        />
                    </div>
                </div>


                <div className='space-y-4 border border-gray-300 rounded-lg p-4 bg-white'>
                    <div className='flex justify-between items-center'>
                        <h1 className='text-xl font-bold'>Социальные сети</h1>
                        <MyButton
                            type='button'
                            onClick={addSocial}
                            className='py-2 w-fit flex items-center gap-2 bg-blue-500 text-white'
                        >
                            <FaPlus size={12} />
                            Добавить
                        </MyButton>
                    </div>

                    {fields.length === 0 && (
                        <p className='text-gray-500 text-center py-4'>
                            Нажмите на кнопку "Добавить" чтобы добавить социальную сеть (можете добавить несколько)
                        </p>
                    )}

                    <div className='space-y-1'>
                        {watchedSocials && watchedSocials.length > 0 && (
                            <div className='space-y-1'>
                                <p className='text-md text-gray-500'>Ссылка на платформу будет автоматически заполнена, если вы выберите платформу, введете username и нажмете на кнопку "Добавить"</p>
                                <p className='text-md text-gray-500'>Единственные исключения - это платформы "Веб-сайт" и "Другое", для них нужно ввести ссылку на сайт вручную</p>
                            </div>
                        )}
                        {fields.map((field, index) => (
                            <div key={field.id} className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 items-end p-3 bg-gray-50 rounded'>
                                <div>
                                    <label className='block text-sm font-medium mb-1'>Платформа</label>
                                    <select
                                        className='w-full p-2 border rounded-md'
                                        {...register(`socials.${index}.platform`)}
                                    >
                                        <option value=''>Выберите платформу</option>
                                        {socialPlatforms.map(platform => (
                                            <option key={platform.value} value={platform.value}>
                                                {platform.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <MyInput
                                    label='Ссылка'
                                    type='url'
                                    placeholder='https://...'
                                    {...register(`socials.${index}.url`)}
                                />

                                <div className='flex items-end gap-2'>

                                    <MyInput
                                        label='Username'
                                        type='text'
                                        placeholder='@username'
                                        {...register(`socials.${index}.username`)}
                                    />

                                    <MyButton
                                        type='button'
                                        onClick={() => removeSocial(index)}
                                        className='bg-red-500 h-10   md:h-2/3 w-fit text-white flex items-center justify-center'
                                    >
                                        <FaTrash size={20} />
                                    </MyButton>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>




                <div className='flex justify-center items-center gap-4'>
                    <MyButton type='submit' className='py-2 bg-blue-500 text-white'>Сохранить</MyButton>
                    <MyButton type='button' className='py-2 bg-red-500 text-white' onClick={() => setIsEdit(false)}>Отмена</MyButton>
                </div>

            </div>
        </form >

    )
}
