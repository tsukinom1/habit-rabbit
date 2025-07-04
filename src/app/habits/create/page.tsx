import HabitsForm from '@/components/habits/HabitsForm'
import React from 'react'

export default function CreateHabitPage() {
    return (
        <div className='container py-4 space-y-4'>
            <HabitsForm
                mode='create'
            />
        </div>
    )
}
