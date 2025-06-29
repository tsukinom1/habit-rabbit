'use client'
import Image from 'next/image'
import { TProfile } from '@/types/profile'
import { FaUser } from 'react-icons/fa'
import { MdAdminPanelSettings } from 'react-icons/md'

export default function ProfileHeader({ profile }: { profile: TProfile | null }) {

    return (
        <div className='relative flex flex-col sm:flex-row items-center gap-4 border border-gray-300 rounded-lg p-4 shadow-md'>
            <Image src={profile?.avatar || '/icons/default-avatar.png'} alt='avatar' width={100} height={100} />
            <div className='text-center sm:text-left'>
                <h1 className='text-2xl font-bold'>{profile?.firstName} {profile?.lastName} </h1>
                <p className='flex items-center gap-2 text-gray-500'>
                    {profile?.user?.role === 'ADMIN' ? <MdAdminPanelSettings /> : <FaUser />}
                    {profile?.user?.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
                </p>

            </div>


        </div>
    )
}
