import { TProfile } from '@/types/profile'
import Link from 'next/link'
import React from 'react'
import { socialsIcons } from '@/utils/socials'

export default function ProfileSocials({ profile }: { profile: TProfile | null }) {


    return (
        <div className='gap-4 border border-gray-300 rounded-lg p-4 shadow-md'>
            {profile?.socials?.length === 0 ? (
                <p>Социальные сети не найдены</p>
            ) : (
                <div>
                    <h1 className='text-xl font-bold border-b border-gray-300 pb-2'>Социальные сети</h1>
                    {profile?.socials?.map((social) => (
                        social.platform && (
                            <div key={social.id} className='flex items-center gap-2 mt-2'>
                                <h2 className='text-2xl'>{socialsIcons(social.platform)}</h2>
                                <Link href={social.url || ''} target='_blank' className='min-w-40'>{social.username}</Link>
                                <p className='text-lg'>{social.isPublic ? 'Публичный' : 'Приватный'}</p>
                            </div>
                        )))}

                </div>
            )}
        </div>
    )
}
