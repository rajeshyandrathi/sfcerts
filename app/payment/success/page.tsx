
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Download, 
  ArrowRight,
  ShoppingBag,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function PaymentSuccessContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (sessionId && orderId) {
      processPaymentSuccess();
    } else {
      router.push('/');
    }
  }, [sessionId, orderId]);

  const processPaymentSuccess = async () => {
    try {
      // Process the successful payment
      const response = await fetch('/api/payments/process-success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          orderId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data);
      } else {
        console.error('Failed to process payment success');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error processing payment success:', error);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        <Card>
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-8 h-8 text-green-600" />
            </motion.div>
            <CardTitle className="text-3xl text-green-600">Payment Successful!</CardTitle>
            <CardDescription className="text-lg">
              Thank you for your purchase. Your order has been confirmed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {orderDetails && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-50 rounded-lg p-6"
              >
                <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Order ID:</span>
                    <span className="font-medium">#{orderDetails.id?.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="font-medium">${orderDetails.totalAmount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Items:</span>
                    <span className="font-medium">{orderDetails.orderItems?.length} exam(s)</span>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-gray-900">What's Next?</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Download Links Created</p>
                    <p className="text-sm text-gray-600">
                      Your download links have been automatically generated and are ready to use.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium">15-Day Access Period</p>
                    <p className="text-sm text-gray-600">
                      You have 15 days to download your exam materials (up to 10 downloads each).
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Email Confirmation</p>
                    <p className="text-sm text-gray-600">
                      A confirmation email with your order details will be sent shortly.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button asChild className="flex-1">
                <Link href="/downloads">
                  <Download className="w-4 h-4 mr-2" />
                  View Downloads
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/dashboard">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center"
            >
              <p className="text-sm text-gray-600 mb-4">
                Need help? Contact our support team or browse more exams.
              </p>
              <Button asChild variant="ghost">
                <Link href="/products">
                  Browse More Exams
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
