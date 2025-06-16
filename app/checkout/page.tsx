
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { 
  CreditCard, 
  Lock, 
  ShoppingCart,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

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

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
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
        if (!data.items || data.items.length === 0) {
          router.push('/cart');
          return;
        }
        setCartItems(data.items);
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

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleStripePayment = async () => {
    setIsProcessing(true);
    try {
      // Create order first
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod: 'stripe',
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const { orderId } = await orderResponse.json();

      // Create Stripe checkout session
      const response = await fetch('/api/payments/stripe/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          items: cartItems,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment session');
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          throw new Error(error.message);
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Error',
        description: 'Failed to process payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalPayment = async (data: any, actions: any) => {
    try {
      // Create order first
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod: 'paypal',
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const { orderId } = await orderResponse.json();

      // Process PayPal payment
      const response = await fetch('/api/payments/paypal/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          paypalOrderId: data.orderID,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Payment Successful!',
          description: 'Your order has been processed successfully.',
        });
        router.push('/dashboard');
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (error) {
      console.error('PayPal payment error:', error);
      toast({
        title: 'Payment Error',
        description: 'Failed to process PayPal payment.',
        variant: 'destructive',
      });
    }
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
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600 mt-1">Complete your purchase securely</p>
          </div>
          <Button variant="ghost" onClick={() => router.push('/cart')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} in your order
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 line-clamp-2">
                        {item.product.examName}
                      </h3>
                      {item.product.examCode && (
                        <p className="text-sm text-gray-600">{item.product.examCode}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <Badge className={getDifficultyColor(item.product.difficultyLevel)}>
                          {item.product.difficultyLevel}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          <p className="font-semibold text-blue-600">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Processing Fee</span>
                    <span>$0.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-blue-600">${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What's Included */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  What's Included
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span>Comprehensive practice questions</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span>Detailed explanations and answers</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span>PDF download format</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span>15-day access period</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span>Up to 10 downloads per exam</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Secure Payment
                </CardTitle>
                <CardDescription>
                  Choose your preferred payment method
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setPaymentMethod('stripe')}
                      className={`flex-1 p-4 border rounded-lg transition-colors ${
                        paymentMethod === 'stripe'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <CreditCard className="w-5 h-5 mr-2" />
                        <span className="font-medium">Credit Card</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Visa, Mastercard</p>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('paypal')}
                      className={`flex-1 p-4 border rounded-lg transition-colors ${
                        paymentMethod === 'paypal'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 mr-2 bg-blue-600 rounded"></div>
                        <span className="font-medium">PayPal</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">PayPal Account</p>
                    </button>
                  </div>
                </div>

                <Separator />

                {/* Payment Buttons */}
                <div className="space-y-4">
                  {paymentMethod === 'stripe' ? (
                    <Button
                      onClick={handleStripePayment}
                      disabled={isProcessing}
                      className="w-full"
                      size="lg"
                    >
                      {isProcessing ? 'Processing...' : `Pay $${getTotalPrice().toFixed(2)} with Card`}
                    </Button>
                  ) : (
                    <PayPalScriptProvider
                      options={{
                        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test',
                        currency: 'USD',
                      }}
                    >
                      <PayPalButtons
                        style={{ layout: 'vertical' }}
                        createOrder={(data, actions) => {
                          return actions.order.create({
                            intent: 'CAPTURE',
                            purchase_units: [
                              {
                                amount: {
                                  currency_code: 'USD',
                                  value: getTotalPrice().toFixed(2),
                                },
                              },
                            ],
                          });
                        }}
                        onApprove={handlePayPalPayment}
                        onError={(err) => {
                          console.error('PayPal error:', err);
                          toast({
                            title: 'Payment Error',
                            description: 'PayPal payment failed. Please try again.',
                            variant: 'destructive',
                          });
                        }}
                      />
                    </PayPalScriptProvider>
                  )}
                </div>

                <div className="text-center text-xs text-gray-600">
                  <Lock className="w-3 h-3 inline mr-1" />
                  Your payment information is secure and encrypted
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
