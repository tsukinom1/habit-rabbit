import React, { forwardRef } from 'react'

interface MyToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string
    className?: string
}

const MyToggle = forwardRef<HTMLInputElement, MyToggleProps>(
    ({ label, className, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && <label className='block text-md font-medium text-gray-700 mb-2'>{label}</label>}
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        ref={ref}
                        type="checkbox"
                        className="sr-only peer"
                        {...props}
                    />
                    <div className={`relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${className}`}></div>
                </label>
            </div>
        )
    }
)

MyToggle.displayName = 'MyToggle'

export default MyToggle 