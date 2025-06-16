
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { processPaymentSuccess, processPaymentFailure } from '@/lib/payments';

export async function POST(request: NextRequest) {
  try {
    const { orderId, paypalOrderId } = await request.json();

    // In a real implementation, you would verify the PayPal payment here
    // For now, we'll simulate a successful payment
    
    try {
      await processPaymentSuccess(orderId, paypalOrderId, 'paypal');
      return NextResponse.json({ success: true });
    } catch (error) {
      await processPaymentFailure(orderId, 'PayPal payment processing failed');
      throw error;
    }
  } catch (error) {
    console.error('PayPal payment processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process PayPal payment' },
      { status: 500 }
    );
  }
}
