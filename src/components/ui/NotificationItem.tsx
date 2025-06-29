import React from 'react'
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimesCircle, FaTimes } from 'react-icons/fa'
import '@/styles/ui.css'

interface INotification {
    id: string
    title: string
    description?: string
    type: 'success' | 'error' | 'warning' | 'info'
    duration?: number
}

interface NotificationItemProps {
    notification: INotification
    onClose: (id: string) => void
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClose }) => {
    const getIcon = () => {
        switch (notification.type) {
            case 'success':
                return <FaCheckCircle className="text-green-500" size={20} />
            case 'error':
                return <FaTimesCircle className="text-red-500" size={20} />
            case 'warning':
                return <FaExclamationCircle className="text-yellow-500" size={20} />
            case 'info':
                return <FaInfoCircle className="text-blue-500" size={20} />
        }
    }

    const getBackgroundColor = () => {
        switch (notification.type) {
            case 'success':
                return 'bg-green-50 border-green-200'
            case 'error':
                return 'bg-red-50 border-red-200'
            case 'warning':
                return 'bg-yellow-50 border-yellow-200'
            case 'info':
                return 'bg-blue-50 border-blue-200'
        }
    }

    return (
        <div
            className={`
                ${getBackgroundColor()}
                min-w-80 max-w-md p-4 border rounded-lg shadow-lg
                transform transition-all duration-300 ease-in-out
                hover:scale-105 animate-slideIn
            `}
        >
            <div className="flex items-start gap-3">
                {/* Иконка */}
                <div className="flex-shrink-0 mt-0.5">
                    {getIcon()}
                </div>

                {/* Контент */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                    </p>
                    {notification.description && (
                        <p className="text-sm text-gray-600 mt-1">
                            {notification.description}
                        </p>
                    )}
                </div>

                {/* Кнопка закрытия */}
                <button
                    onClick={() => onClose(notification.id)}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <FaTimes size={16} />
                </button>
            </div>
        </div>
    )
}

export default NotificationItem 