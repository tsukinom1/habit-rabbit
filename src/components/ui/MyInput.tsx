import React, { forwardRef } from 'react'

interface MyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    type: string
    placeholder?: string
    className?: string
    rightIcon?: React.ReactNode
}

const MyInput = forwardRef<HTMLInputElement, MyInputProps>(
    ({ type, label, placeholder, className, rightIcon, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && <label htmlFor={label} className='block text-md font-medium text-gray-700 mb-1'>{label}</label>}
                <div className="relative">
                    <input
                        ref={ref}
                        type={type}
                        placeholder={placeholder}
                        className={`w-full py-1 px-2 md:py-2 md:px-4 rounded-lg border border-gray-300 text-lg ${rightIcon ? 'pr-10' : ''} ${className}`}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer">
                            {rightIcon}
                        </div>
                    )}
                </div>
            </div>
        )
    }
)

MyInput.displayName = 'MyInput'

export default MyInput