import React, { forwardRef } from 'react'

interface MyTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
    placeholder?: string
    className?: string
    rightIcon?: React.ReactNode
}

const MyTextarea = forwardRef<HTMLTextAreaElement, MyTextareaProps>(
    ({ label, placeholder, className, rightIcon, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && <label htmlFor={label} className='block text-md font-medium text-gray-700 mb-1'>{label}</label>}
                <div className="relative">
                    <textarea
                        ref={ref}
                        rows={4}
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

MyTextarea.displayName = 'MyTextarea'

export default MyTextarea