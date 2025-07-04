import { NextRequest, NextResponse } from 'next/server'
import { isTimeToSend } from '@/utils/notificationUtils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const targetTime = searchParams.get('time') || '10:00'
    const tolerance = parseInt(searchParams.get('tolerance') || '2')
    const timezone = searchParams.get('timezone') || 'Europe/Moscow'
    
    const now = new Date()
    const serverTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    // Получаем время в указанном часовом поясе
    const userTime = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    }).format(now)
    
    const result = isTimeToSend(targetTime, timezone, tolerance)
    
    return NextResponse.json({
      serverTime,
      userTime,
      targetTime,
      timezone,
      tolerance,
      shouldSend: result,
      timestamp: now.toISOString()
    })
    
  } catch (error) {
    console.error('Error testing time:', error)
    return NextResponse.json(
      { error: 'Time test failed' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { targetTime, tolerance = 2, timezone = 'Europe/Moscow' } = await request.json()
    
    if (!targetTime) {
      return NextResponse.json({ error: 'targetTime is required' }, { status: 400 })
    }
    
    const now = new Date()
    const serverTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    // Получаем время в указанном часовом поясе
    const userTime = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    }).format(now)
    
    const result = isTimeToSend(targetTime, timezone, tolerance)
    
    return NextResponse.json({
      serverTime,
      userTime,
      targetTime,
      timezone,
      tolerance,
      shouldSend: result,
      timestamp: now.toISOString()
    })
    
  } catch (error) {
    console.error('Error testing time:', error)
    return NextResponse.json(
      { error: 'Time test failed' },
      { status: 500 }
    )
  }
} 