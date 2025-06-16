
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { processPaymentSuccess } from '@/lib/payments';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Process the payment success
    const order = await processPaymentSuccess(orderId, sessionId || 'manual', 'stripe');

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error processing payment success:', error);
    return NextResponse.json(
      { error: 'Failed to process payment success' },
      { status: 500 }
    );
  }
}
