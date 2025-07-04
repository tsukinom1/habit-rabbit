import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import webpush from 'web-push'

// Настройка VAPID ключей
const vapidEmail = process.env.VAPID_EMAIL || 'dlyattnavern@gmail.com'
const formattedEmail = vapidEmail.startsWith('mailto:') ? vapidEmail : `mailto:${vapidEmail}`

webpush.setVapidDetails(
  formattedEmail,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Test notification API called')
    
    // Проверяем VAPID ключи
    console.log('VAPID Keys:', {
      email: process.env.VAPID_EMAIL ? 'SET' : 'MISSING',
      publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? 'SET' : 'MISSING',
      privateKey: process.env.VAPID_PRIVATE_KEY ? 'SET' : 'MISSING'
    })
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      console.log('❌ No session found')
      return NextResponse.json({ error: 'Профиль не найден' }, { status: 401 })
    }
    
    console.log('✅ User authenticated:', session.user.id)

    // Получаем активные подписки пользователя
    console.log('📋 Checking subscriptions for user:', session.user.id)
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId: session.user.id,
        isActive: true
      }
    })
    
    console.log('📋 Found subscriptions:', subscriptions.length)

    if (subscriptions.length === 0) {
      console.log('❌ No active subscriptions found')
      return NextResponse.json({ error: 'Сначала включите уведомления!' }, { status: 404 })
    }

    // Подготавливаем тестовое уведомление
    const notification = {
      title: '🎉 Тестовое уведомление!',
      body: 'Отлично! Push уведомления работают корректно.',
      type: 'DAILY_GREETING',
      data: {
        url: '/habits',
        timestamp: new Date().toISOString()
      }
    }

    // Отправляем уведомления
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        }

        return webpush.sendNotification(
          pushSubscription,
          JSON.stringify(notification)
        )
      })
    )

    // Подсчитываем результаты
    const successful = results.filter(result => result.status === 'fulfilled').length
    const failed = results.filter(result => result.status === 'rejected').length

    // Логируем ошибки
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to send to subscription ${index}:`, result.reason)
      }
    })

    return NextResponse.json({
      success: true,
      sent: successful,
      failed: failed,
      total: subscriptions.length
    })

  } catch (error) {
    console.error('Error sending test notification:', error)
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    )
  }
} 