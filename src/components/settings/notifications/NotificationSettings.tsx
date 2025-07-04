'use client'
import { useState } from 'react'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import MyButton from '@/components/ui/MyButton'
import MyToggle from '@/components/ui/MyToggle'
import MyInput from '@/components/ui/MyInput'
import { FaBell, FaBellSlash, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { notify } from '@/hooks/useNotification'

export default function NotificationSettings() {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    settings,
    subscribe,
    unsubscribe,
    updateSettings,
  } = usePushNotifications()
  
  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggleNotifications = async () => {
    try {
      if (isSubscribed) {
        await unsubscribe()
        notify.success('🔕 Уведомления отключены')
      } else {
        await subscribe()
        notify.success('🔔 Уведомления включены!')
      }
    } catch (error) {
      console.error('Error toggling notifications:', error)
      notify.error('Ошибка при настройке уведомлений')
    }
  }

  const handleSettingChange = async (key: keyof typeof settings, value: boolean | string) => {
    try {
      await updateSettings({ [key]: value })
      notify.success('⚙️ Настройки обновлены')
    } catch (error) {
      console.error('Error updating settings:', error)
      notify.error('Ошибка при обновлении настроек')
    }
  }



  if (!isSupported) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center gap-3 text-gray-500">
          <FaBellSlash className="w-5 h-5" />
          <div>
            <h3 className="font-medium">Уведомления недоступны</h3>
            <p className="text-sm">Ваш браузер не поддерживает push уведомления</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Заголовок */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isSubscribed ? (
              <FaBell className="w-5 h-5 text-blue-500" />
            ) : (
              <FaBellSlash className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <h3 className="font-medium">Push уведомления</h3>
              <p className="text-sm text-gray-500">
                {isSubscribed ? 'Включены' : 'Отключены'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isSubscribed && (
              <MyButton
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs px-2 py-1 bg-gray-50 text-gray-600 hover:bg-gray-100"
              >
                {isExpanded ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
              </MyButton>
            )}
            
            <MyButton
              type="button"
              onClick={handleToggleNotifications}
              className={`text-sm px-3 py-1 ${
                isSubscribed 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              {isLoading ? 'Загрузка...' : isSubscribed ? 'Отключить' : 'Включить'}
            </MyButton>
          </div>
        </div>
      </div>

      {/* Детальные настройки */}
      {isSubscribed && isExpanded && (
        <div className="p-4 space-y-4">
          {/* Ежедневное приветствие */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <span role="img" aria-label="sunrise">🌅</span> Ежедневное приветствие
                </h4>
                <p className="text-xs text-gray-500">Мотивирующее сообщение каждое утро</p>
              </div>
              <MyToggle
                checked={settings.dailyGreeting}
                onChange={(e) => handleSettingChange('dailyGreeting', e.target.checked)}
              />
            </div>
            
            {settings.dailyGreeting && (
              <div className="ml-6 space-y-2">
                <label className="text-xs text-gray-500">Время отправки</label>
                <MyInput
                  type="time"
                  value={settings.greetingTime}
                  onChange={(e) => handleSettingChange('greetingTime', e.target.value)}
                  className="w-32"
                />
              </div>
            )}
          </div>

          {/* Напоминания о привычках */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm flex items-center gap-2">
                <span role="img" aria-label="alarm">⏰</span> Напоминания о привычках
              </h4>
              <p className="text-xs text-gray-500">По времени, указанному для каждой привычки</p>
            </div>
            <MyToggle
              checked={settings.habitReminders}
              onChange={(e) => handleSettingChange('habitReminders', e.target.checked)}
            />
          </div>

          {/* Предупреждения о streak */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm flex items-center gap-2">
                <span role="img" aria-label="fire">🔥</span> Предупреждения о streak
              </h4>
              <p className="text-xs text-gray-500">Когда есть риск потерять серию (вечером 18:00-22:00)</p>
            </div>
            <MyToggle
              checked={settings.streakWarnings}
              onChange={(e) => handleSettingChange('streakWarnings', e.target.checked)}
            />
          </div>

          {/* Достижения */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm flex items-center gap-2">
                <span role="img" aria-label="trophy">🏆</span> Достижения
              </h4>
              <p className="text-xs text-gray-500">Уведомления о важных milestone (3, 7, 21, 30, 100+ дней)</p>
            </div>
            <MyToggle
              checked={settings.achievements}
              onChange={(e) => handleSettingChange('achievements', e.target.checked)}
            />
          </div>

          {/* Еженедельная сводка */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm flex items-center gap-2">
                <span role="img" aria-label="chart">📊</span> Еженедельная сводка
              </h4>
              <p className="text-xs text-gray-500">Отчет о прогрессе по воскресеньям</p>
            </div>
            <MyToggle
              checked={settings.weeklySummary}
              onChange={(e) => handleSettingChange('weeklySummary', e.target.checked)}
            />
          </div>

          {/* Информация */}
          {/* <div className="pt-3 border-t space-y-2">
            <div className="text-xs text-gray-500">
              <p className="font-medium mb-1">💡 Возможности:</p>
              <ul className="space-y-1 ml-4">
                <li>• Отмечай привычки прямо из уведомлений</li>
                <li>• Откладывай напоминания на час</li>
                <li>• Автоматическая отправка по расписанию</li>
                <li>• Умные streak предупреждения</li>
              </ul>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">Последнее обновление:</span>
              <span className="text-xs text-gray-500">{new Date().toLocaleTimeString()}</span>
            </div>
          </div> */}
        </div>
      )}

      {/* Краткая информация */}
      {isSubscribed && !isExpanded && (
        <div className="p-4 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <p><span role="img" aria-label="check">✅</span> Система уведомлений активна</p>
            <button 
              type="button"
              onClick={() => setIsExpanded(true)}
              className="text-blue-500 hover:text-blue-600 text-xs"
            >
              Настроить подробно →
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 