
import { prisma } from './db';

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    examName: string;
    examCode: string | null;
    price: number;
    difficultyLevel: string;
  };
}

export async function getCartItems(userId: string): Promise<CartItem[]> {
  return prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          examName: true,
          examCode: true,
          price: true,
          difficultyLevel: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function addToCart(userId: string, productId: string, quantity: number = 1) {
  return prisma.cartItem.upsert({
    where: {
      userId_productId: {
        userId,
        productId
      }
    },
    update: {
      quantity: {
        increment: quantity
      }
    },
    create: {
      userId,
      productId,
      quantity
    }
  });
}

export async function updateCartItemQuantity(userId: string, productId: string, quantity: number) {
  if (quantity <= 0) {
    return prisma.cartItem.delete({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });
  }

  return prisma.cartItem.update({
    where: {
      userId_productId: {
        userId,
        productId
      }
    },
    data: { quantity }
  });
}

export async function removeFromCart(userId: string, productId: string) {
  return prisma.cartItem.delete({
    where: {
      userId_productId: {
        userId,
        productId
      }
    }
  });
}

export async function clearCart(userId: string) {
  return prisma.cartItem.deleteMany({
    where: { userId }
  });
}

export async function getCartTotal(userId: string): Promise<number> {
  const cartItems = await getCartItems(userId);
  return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
}
