
import { prisma } from './db';
import { createDownloadLink } from './downloads';

export async function createOrder(userId: string, cartItems: any[], paymentMethod: string) {
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const order = await prisma.order.create({
    data: {
      userId,
      totalAmount,
      status: 'PENDING',
      paymentMethod,
      orderItems: {
        create: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        }))
      }
    },
    include: {
      orderItems: {
        include: {
          product: true
        }
      }
    }
  });

  return order;
}

export async function processPaymentSuccess(orderId: string, paymentId: string, paymentMethod: string) {
  // Update order status
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'COMPLETED',
      paymentId,
    },
    include: {
      orderItems: {
        include: {
          product: true
        }
      },
      user: true
    }
  });

  // Create payment record
  await prisma.payment.create({
    data: {
      orderId,
      amount: order.totalAmount,
      status: 'COMPLETED',
      paymentMethod,
      stripeId: paymentMethod === 'stripe' ? paymentId : null,
      paypalId: paymentMethod === 'paypal' ? paymentId : null,
    }
  });

  // Create download links for each product
  for (const item of order.orderItems) {
    await createDownloadLink(order.userId, item.productId);
  }

  // Clear user's cart
  await prisma.cartItem.deleteMany({
    where: { userId: order.userId }
  });

  // Create email notification
  await prisma.emailNotification.create({
    data: {
      email: order.user.email,
      type: 'ORDER_CONFIRMATION',
      subject: 'Order Confirmation - SF Exams For You',
      content: `Thank you for your purchase! Your order #${order.id} has been confirmed.`,
      status: 'PENDING'
    }
  });

  return order;
}

export async function processPaymentFailure(orderId: string, reason?: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'CANCELLED',
    }
  });

  await prisma.payment.create({
    data: {
      orderId,
      amount: 0,
      status: 'FAILED',
      paymentMethod: 'unknown',
    }
  });
}
