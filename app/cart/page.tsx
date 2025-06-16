
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight,
  ArrowLeft,
  ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
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

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
      } else if (response.status === 401) {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to load cart items',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    setIsUpdating(productId);
    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (response.ok) {
        await fetchCart();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update cart',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const removeItem = async (productId: string) => {
    setIsUpdating(productId);
    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCart();
        toast({
          title: 'Removed',
          description: 'Item removed from cart',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to remove item',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getDifficultyColor = (difficulty: string) => {
    const lower = difficulty.toLowerCase();
    if (lower.includes('foundational')) return 'bg-green-100 text-green-800';
    if (lower.includes('intermediate') || lower.includes('specialized')) return 'bg-yellow-100 text-yellow-800';
    if (lower.includes('advanced') || lower.includes('architect')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-1">
              {cartItems.length === 0 ? 'Your cart is empty' : `${getTotalItems()} item${getTotalItems() !== 1 ? 's' : ''} in your cart`}
            </p>
          </div>
          <Button variant="ghost" onClick={() => router.push('/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
        </div>

        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Start adding some Salesforce certification exams to your cart!</p>
            <Button asChild size="lg">
              <Link href="/products">
                Browse Exams
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                                {item.product.examName}
                              </h3>
                              {item.product.examCode && (
                                <p className="text-gray-600 font-medium">{item.product.examCode}</p>
                              )}
                            </div>
                            <Badge className={getDifficultyColor(item.product.difficultyLevel)}>
                              {item.product.difficultyLevel}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                disabled={isUpdating === item.productId || item.quantity <= 1}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                disabled={isUpdating === item.productId}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>

                            <div className="flex items-center space-x-4">
                              <span className="text-xl font-bold text-blue-600">
                                ${(item.product.price * item.quantity).toFixed(2)}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.productId)}
                                disabled={isUpdating === item.productId}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="sticky top-8"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal ({getTotalItems()} items)</span>
                        <span>${getTotalPrice().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Processing Fee</span>
                        <span>$0.00</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-blue-600">${getTotalPrice().toFixed(2)}</span>
                    </div>

                    <Button asChild className="w-full" size="lg">
                      <Link href="/checkout">
                        Proceed to Checkout
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>

                    <div className="text-center text-sm text-gray-600">
                      <p>Secure checkout with Stripe & PayPal</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
