'use client'
import ProfileHeader from "@/components/profile/ProfileHeader"
import ProfileContact from "@/components/profile/ProfileContact"
import { useProfile } from "@/hooks/useProfile"
import Loader from "@/components/ui/Loader"
import ProfileSocials from "@/components/profile/ProfileSocials"
import ProfileData from "@/components/profile/ProfileData"
import MyButton from "@/components/ui/MyButton"
import { FaEdit } from "react-icons/fa"
import { useState } from "react"
import ProfileForm from "@/components/profile/ProfileForm"

export default function ProfilePage() {
    const { profile, profileLoading, refetch } = useProfile()
    const [isEdit, setIsEdit] = useState(false)

    if (profileLoading) return <Loader />

    console.log(profile)
    return (
        <div className='container py-4 space-y-4'>
            <div className='flex items-center gap-4'>
                <h1 className='text-2xl font-bold'>Профиль</h1>
                <MyButton className='flex items-center gap-2' onClick={() => setIsEdit(true)}>
                    <FaEdit className='w-4 h-4' />
                    Редактировать
                </MyButton>
            </div>
            <ProfileHeader profile={profile} />
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <ProfileData profile={profile} />
                <ProfileContact profile={profile} />
                <ProfileSocials profile={profile} />
            </div>

            {isEdit && (
                <ProfileForm profile={profile} setIsEdit={setIsEdit} refetch={refetch} />
            )}
        </div >
    )
}
