// Service Worker для push уведомлений
const CACHE_NAME = 'habit-rabbit-v1'

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('SW: Installing...')
  self.skipWaiting()
})

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('SW: Activating...')
  event.waitUntil(self.clients.claim())
})

// Обработка push уведомлений
self.addEventListener('push', (event) => {
  console.log('SW: Push received', event)
  
  if (!event.data) {
    console.log('SW: No data in push event')
    return
  }

  try {
    const data = event.data.json()
    console.log('SW: Push data:', data)
    
    const options = {
      body: data.body,
      icon: '/images/poster.png',
      badge: '/images/poster.png',
      data: data.data || {},
      actions: getNotificationActions(data.type),
      requireInteraction: data.type === 'STREAK_WARNING', // Требует взаимодействия для важных
      tag: data.tag || data.type, // Группировка однотипных уведомлений
    }

    // Кастомизация по типу уведомления
    switch (data.type) {
      case 'DAILY_GREETING':
        options.icon = '/images/poster.png'
        break
      case 'HABIT_REMINDER':
        options.icon = '/images/poster.png'
        options.actions = [
          { action: 'mark_done', title: '✅ Выполнено' },
          { action: 'snooze', title: '⏰ Напомнить через час' }
        ]
        break
      case 'STREAK_WARNING':
        options.icon = '/images/poster.png'
        options.requireInteraction = true
        break
      case 'ACHIEVEMENT':
        options.icon = '/images/poster.png'
        break
      case 'WEEKLY_SUMMARY':
        options.icon = '/images/poster.png'
        break
    }

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  } catch (error) {
    console.error('SW: Error processing push:', error)
  }
})

// Действия для разных типов уведомлений
function getNotificationActions(type) {
  switch (type) {
    case 'HABIT_REMINDER':
      return [
        { action: 'mark_done', title: '✅ Выполнено' },
        { action: 'snooze', title: '⏰ Позже' }
      ]
    case 'STREAK_WARNING':
      return [
        { action: 'open_app', title: '📱 Открыть приложение' }
      ]
    case 'WEEKLY_SUMMARY':
      return [
        { action: 'view_stats', title: '📊 Посмотреть статистику' }
      ]
    default:
      return []
  }
}

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', (event) => {
  console.log('SW: Notification clicked', event)
  
  event.notification.close()
  
  const action = event.action
  const data = event.notification.data || {}
  
  event.waitUntil(
    handleNotificationClick(action, data)
  )
})

// Обработка действий с уведомлениями
async function handleNotificationClick(action, data) {
  const clients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  })

  switch (action) {
    case 'mark_done':
      // Отмечаем привычку как выполненную
      if (data.habitId) {
        await markHabitDone(data.habitId)
      }
      break
      
    case 'snooze':
      // Откладываем напоминание на час
      if (data.habitId) {
        await snoozeReminder(data.habitId)
      }
      break
      
    case 'open_app':
    case 'view_stats':
    default:
      // Открываем приложение
      if (clients.length > 0) {
        // Фокусируем существующую вкладку
        await clients[0].focus()
        if (data.url) {
          await clients[0].navigate(data.url)
        }
      } else {
        // Открываем новую вкладку
        const url = data.url || '/'
        await self.clients.openWindow(url)
      }
      break
  }
}

// Отметка привычки как выполненной
async function markHabitDone(habitId) {
  try {
    const response = await fetch(`/api/habits/${habitId}/entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: new Date().toISOString(),
        isCompleted: true,
        source: 'notification'
      }),
    })
    
    if (response.ok) {
      // Показываем уведомление об успехе
      await self.registration.showNotification('✅ Привычка отмечена!', {
        body: 'Отличная работа! Продолжай в том же духе!',
        icon: '/images/poster.png',
        tag: 'success'
      })
    }
  } catch (error) {
    console.error('SW: Error marking habit done:', error)
  }
}

// Отложить напоминание
async function snoozeReminder(habitId) {
  try {
    await fetch('/api/notifications/snooze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        habitId,
        snoozeMinutes: 60
      }),
    })
    
    await self.registration.showNotification('⏰ Напоминание отложено', {
      body: 'Напомним через час!',
      icon: '/icons/default-avatar.png',
      tag: 'snooze'
    })
  } catch (error) {
    console.error('SW: Error snoozing reminder:', error)
  }
} 