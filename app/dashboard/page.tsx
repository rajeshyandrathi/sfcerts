
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  User, 
  Download, 
  ShoppingBag, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Calendar,
  FileText,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  orderItems: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      examName: string;
      examCode: string | null;
    };
  }[];
}

interface Download {
  id: string;
  downloadUrl: string;
  expiresAt: string;
  downloadCount: number;
  maxDownloads: number;
  isActive: boolean;
  createdAt: string;
  product: {
    id: string;
    examName: string;
    examCode: string | null;
    price: number;
  };
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        await Promise.all([fetchOrders(), fetchDownloads()]);
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/auth/login');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchDownloads = async () => {
    try {
      const response = await fetch('/api/downloads');
      if (response.ok) {
        const data = await response.json();
        setDownloads(data);
      }
    } catch (error) {
      console.error('Error fetching downloads:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRemainingDays = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const completedOrders = orders.filter(order => order.status === 'COMPLETED');
  const totalSpent = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const activeDownloads = downloads.filter(download => download.isActive && new Date(download.expiresAt) > new Date());

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <CardContent className="flex items-center p-6">
              <ShoppingBag className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{completedOrders.length}</p>
                <p className="text-sm text-gray-600">Orders</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <Download className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{activeDownloads.length}</p>
                <p className="text-sm text-gray-600">Active Downloads</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <Award className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{downloads.length}</p>
                <p className="text-sm text-gray-600">Total Exams</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <FileText className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Recent Orders
                  </span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/orders">View All</Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No orders yet</p>
                    <Button asChild className="mt-4">
                      <Link href="/products">Browse Exams</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Order #{order.id.slice(-8)}</span>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''} • ${order.totalAmount.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Downloads */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Download className="w-5 h-5 mr-2" />
                    Active Downloads
                  </span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/downloads">View All</Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeDownloads.length === 0 ? (
                  <div className="text-center py-8">
                    <Download className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No active downloads</p>
                    <Button asChild className="mt-4">
                      <Link href="/products">Purchase Exams</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeDownloads.slice(0, 3).map((download) => {
                      const remainingDays = getRemainingDays(download.expiresAt);
                      const remainingDownloads = download.maxDownloads - download.downloadCount;
                      
                      return (
                        <div key={download.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium line-clamp-2">{download.product.examName}</h4>
                              {download.product.examCode && (
                                <p className="text-sm text-gray-600">{download.product.examCode}</p>
                              )}
                            </div>
                            <Button size="sm" asChild>
                              <Link href={download.downloadUrl}>Download</Link>
                            </Button>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {remainingDays} days left
                            </div>
                            <div className="flex items-center">
                              <Download className="w-3 h-3 mr-1" />
                              {remainingDownloads} downloads left
                            </div>
                          </div>
                          {remainingDays <= 3 && (
                            <div className="flex items-center mt-2 text-xs text-amber-600">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Expires soon
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button asChild variant="outline" className="h-auto p-4">
                  <Link href="/products" className="flex flex-col items-center space-y-2">
                    <ShoppingBag className="w-6 h-6" />
                    <span>Browse Exams</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto p-4">
                  <Link href="/downloads" className="flex flex-col items-center space-y-2">
                    <Download className="w-6 h-6" />
                    <span>My Downloads</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto p-4">
                  <Link href="/cart" className="flex flex-col items-center space-y-2">
                    <ShoppingBag className="w-6 h-6" />
                    <span>View Cart</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
