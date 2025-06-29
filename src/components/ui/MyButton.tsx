import React from 'react'

interface MyButtonProps {
    type?: "button" | "submit" | "reset"
    children: React.ReactNode
    className?: string
    onClick?: () => void
    onMouseEnter?: () => void
    onMouseLeave?: () => void
}

export default function MyButton({ children, className, onClick, type, onMouseEnter, onMouseLeave }: MyButtonProps) {
    return (
        <button type={type} className={`py-1 px-2 md:py-2 md:px-4 rounded-lg border border-gray-300  ${className}`}
            onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            {children}
        </button>
    )
}
