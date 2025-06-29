import React, { forwardRef } from 'react'

interface MySelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    placeholder?: string
    className?: string
    options: { value: string; label: string }[]
}

const MySelect = forwardRef<HTMLSelectElement, MySelectProps>(
    ({ label, placeholder, className, options, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && <label htmlFor={label} className='block text-md font-medium text-gray-700 mb-1'>{label}</label>}
                <select
                    ref={ref}
                    className={`w-full py-1 px-2 md:py-2 md:px-4 rounded-lg border border-gray-300 text-lg bg-white ${className}`}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        )
    }
)

MySelect.displayName = 'MySelect'

export default MySelect
