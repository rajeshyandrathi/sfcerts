
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { updateCartItemQuantity, removeFromCart } from '@/lib/cart';

export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { quantity } = await request.json();
    
    if (quantity < 0) {
      return NextResponse.json(
        { error: 'Quantity must be non-negative' },
        { status: 400 }
      );
    }

    await updateCartItemQuantity(user.id, params.productId, quantity);
    return NextResponse.json({ message: 'Cart updated' });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await removeFromCart(user.id, params.productId);
    return NextResponse.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json(
      { error: 'Failed to remove from cart' },
      { status: 500 }
    );
  }
}
