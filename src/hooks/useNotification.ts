import { useCallback, useEffect, useState } from "react"

interface INotification {
    id: string
    title: string
    description?: string
    type: 'success' | 'error' | 'warning' | 'info'
    duration?: number
}


let globalAddNotification: ((notification: Omit<INotification, 'id'>) => void) | null = null

export const useNotification = () => {
    const [notifications, setNotifications] = useState<INotification[]>([])

    const addNotification = useCallback((notification: Omit<INotification, 'id'>) => {
        const fullNotification: INotification = {
            ...notification,
            id: crypto.randomUUID(),
            duration: notification.duration || 5000
        }

        setNotifications(prev => [...prev, fullNotification])

        if (fullNotification.duration && fullNotification.duration > 0) {
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== fullNotification.id))
            }, fullNotification.duration)
        }
    }, [])


    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }, [])

    useEffect(() => {
        globalAddNotification = addNotification
        return () => {
            globalAddNotification = null
        }
    }, [addNotification])

    return { notifications, addNotification, removeNotification }
}

// Глобальные функции для удобного использования
export const notify = {
    success: (title: string, description?: string, duration?: number) => 
        globalAddNotification?.({ type: 'success', title, description, duration }),
    
    error: (title: string, description?: string, duration?: number) => 
        globalAddNotification?.({ type: 'error', title, description, duration }),
    
    warning: (title: string, description?: string, duration?: number) => 
        globalAddNotification?.({ type: 'warning', title, description, duration }),
    
    info: (title: string, description?: string, duration?: number) => 
        globalAddNotification?.({ type: 'info', title, description, duration })
}