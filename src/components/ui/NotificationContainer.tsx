import React from 'react'
import { useNotification } from '@/hooks/useNotification'
import NotificationItem from './NotificationItem'

const NotificationContainer: React.FC = () => {
    const { notifications, removeNotification } = useNotification()

    if (notifications.length === 0) {
        return null
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
            {notifications.map((notification) => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClose={removeNotification}
                />
            ))}
        </div>
    )
}

export default NotificationContainer 