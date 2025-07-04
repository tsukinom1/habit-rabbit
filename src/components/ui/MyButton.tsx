import React from 'react'

interface MyButtonProps {
    type?: "button" | "submit" | "reset"
    children: React.ReactNode
    className?: string
    title?: string
    onClick?: (e?: React.MouseEvent) => void
    onMouseEnter?: () => void
    onMouseLeave?: () => void
}

export default function MyButton({ children, className, onClick, type = "button", onMouseEnter, onMouseLeave, title }: MyButtonProps) {
    return (
        <button 
            type={type} 
            className={`py-1 px-2 md:py-2 md:px-4 rounded-lg border border-gray-300  ${className}`}
            title={title}
            onClick={(e) => onClick?.(e)} 
            onMouseEnter={onMouseEnter} 
            onMouseLeave={onMouseLeave}
        >
            {children}
        </button>
    )
}
