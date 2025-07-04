'use client'
import HabitsForm from '@/components/habits/HabitsForm'
import React from 'react'
import { useParams } from 'next/navigation'
import { useHabit } from '@/hooks/useHabit'
import Loader from '@/components/ui/Loader'
import Link from 'next/link'

export default function EditHabitPage() {
    const { id } = useParams()
    const { currentHabit, currentHabitLoading, habitError } = useHabit(id as string)

    if (currentHabitLoading) {
        return (
            <div className="container py-4">
                <Loader />
            </div>
        )
    }

    if (habitError) {
        return (
            <div className="container py-4">
                <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                    {habitError}
                </div>
            </div>
        )
    }

    if (!currentHabit) {
        return (
            <div className="container py-4">
                <div className="p-4 bg-gray-100 text-gray-700 rounded-lg">
                    Привычка не найдена, вернитесь на <Link href="/habits">страницу привычек</Link>
                </div>
            </div>
        )
    }

    return (
        <div className='container py-4 space-y-4'>
            
            <HabitsForm
                mode='edit'
                editingHabit={currentHabit}
            />
        </div>
    )
}
