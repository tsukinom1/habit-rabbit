'use client'
import { useSession } from 'next-auth/react'
import React from 'react'
import { TProfile } from '@/types/profile'

export default function ProfileContact({ profile }: { profile: TProfile | null }) {
    const { data: session } = useSession()
    return (
        <div className='gap-4 border border-gray-300 rounded-lg p-4 shadow-md'>
            <h1 className='text-xl font-bold border-b border-gray-300 pb-2'>Контактная информация</h1>
            <p className='text-lg'><b className='text-text'>Номер телефона: </b>{profile?.phone || 'Не указан'}</p>
            <p className='text-lg'><b className='text-text'>Email: </b>{session?.user?.email || 'Не указан'}</p>
            <p className='text-lg'><b className='text-text'>Страна: </b>{profile?.country || 'Не указана'}</p>
            <p className='text-lg'><b className='text-text'>Город: </b>{profile?.city || 'Не указан'}</p>
            <p className='text-lg'><b className='text-text'>Адрес: </b>{profile?.address || 'Не указан'}</p>
        </div>
    )
}
