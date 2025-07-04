import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { endpoint } = await request.json()
    
    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 })
    }

    // Удаляем или деактивируем подписку
    const result = await prisma.pushSubscription.updateMany({
      where: {
        userId: session.user.id,
        endpoint: endpoint
      },
      data: {
        isActive: false
      }
    })

    return NextResponse.json({ 
      success: true, 
      updated: result.count 
    })
    
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error)
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    )
  }
} 