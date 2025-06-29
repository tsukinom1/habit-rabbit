import { TProfile } from '@/types/profile'
import React from 'react'

export default function ProfileData({ profile }: { profile: TProfile | null }) {
    const formatBirthDate = (dateString?: string) => {
        if (!dateString) return 'Не указана'

        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return 'Не указана'

            return date.toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        } catch (error) {
            return 'Не указана'
        }
    }

    return (
        <div className='gap-4 border border-gray-300 rounded-lg p-4 shadow-md'>
            <h1 className='text-xl font-bold border-b border-gray-300 pb-2'>Основная информация</h1>
            <p className='text-lg'><b className='text-text'>Дата рождения: </b>{formatBirthDate(profile?.birthDate)}</p>
            <p className='text-lg'><b className='text-text'>Пол: </b>{profile?.gender === 'male' ? 'Мужчина' : profile?.gender === 'female' ? 'Женщина' : 'Не указан'}</p>
            <p className='text-lg'><b className='text-text'>Язык: </b>{profile?.language === 'ru' ? 'Русский' : profile?.language === 'en' ? 'Английский' : profile?.language === 'kz' ? 'Казахский' : 'Не указан'}</p>
            <p className='text-lg'><b className='text-text'>Временная зона: </b>{profile?.timezone || 'Не указана'}</p>
            <p className='text-lg'><b className='text-text'>Биография:</b> {profile?.bio || 'Не указана'}</p>
        </div>
    )
}
