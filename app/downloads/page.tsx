
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Download, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  FileText,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

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

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    try {
      const authResponse = await fetch('/api/auth/me');
      if (!authResponse.ok) {
        router.push('/auth/login');
        return;
      }
      await fetchDownloads();
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/auth/login');
    } finally {
      setIsLoading(false);
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
      toast({
        title: 'Error',
        description: 'Failed to load downloads',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = async (downloadUrl: string, examName: string) => {
    try {
      const response = await fetch(downloadUrl);
      if (response.ok) {
        // Trigger download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${examName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Refresh downloads to update count
        await fetchDownloads();
        
        toast({
          title: 'Download Started',
          description: 'Your exam file is being downloaded.',
        });
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download Failed',
        description: 'Unable to download the file. Please try again.',
        variant: 'destructive',
      });
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

  const getStatusInfo = (download: Download) => {
    const now = new Date();
    const expiry = new Date(download.expiresAt);
    const remainingDays = getRemainingDays(download.expiresAt);
    const remainingDownloads = download.maxDownloads - download.downloadCount;

    if (!download.isActive) {
      return { status: 'inactive', color: 'bg-gray-100 text-gray-800', text: 'Inactive' };
    }
    if (expiry <= now) {
      return { status: 'expired', color: 'bg-red-100 text-red-800', text: 'Expired' };
    }
    if (remainingDownloads <= 0) {
      return { status: 'exhausted', color: 'bg-red-100 text-red-800', text: 'Downloads Exhausted' };
    }
    if (remainingDays <= 3) {
      return { status: 'expiring', color: 'bg-yellow-100 text-yellow-800', text: 'Expiring Soon' };
    }
    return { status: 'active', color: 'bg-green-100 text-green-800', text: 'Active' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Download className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your downloads...</p>
        </div>
      </div>
    );
  }

  const activeDownloads = downloads.filter(d => {
    const statusInfo = getStatusInfo(d);
    return statusInfo.status === 'active' || statusInfo.status === 'expiring';
  });

  const expiredDownloads = downloads.filter(d => {
    const statusInfo = getStatusInfo(d);
    return statusInfo.status === 'expired' || statusInfo.status === 'exhausted' || statusInfo.status === 'inactive';
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Downloads</h1>
            <p className="text-gray-600 mt-1">
              Access your purchased exam materials
            </p>
          </div>
          <Button variant="ghost" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {downloads.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <FileText className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">No downloads yet</h2>
            <p className="text-gray-600 mb-8">Purchase some Salesforce certification exams to get started!</p>
            <Button asChild size="lg">
              <Link href="/products">Browse Exams</Link>
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Active Downloads */}
            {activeDownloads.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                      Active Downloads ({activeDownloads.length})
                    </CardTitle>
                    <CardDescription>
                      Downloads that are currently available
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activeDownloads.map((download) => {
                        const statusInfo = getStatusInfo(download);
                        const remainingDays = getRemainingDays(download.expiresAt);
                        const remainingDownloads = download.maxDownloads - download.downloadCount;

                        return (
                          <motion.div
                            key={download.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <Badge className={statusInfo.color}>
                                {statusInfo.text}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                ${download.product.price}
                              </span>
                            </div>

                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                              {download.product.examName}
                            </h3>
                            
                            {download.product.examCode && (
                              <p className="text-sm text-gray-600 mb-4">
                                {download.product.examCode}
                              </p>
                            )}

                            <div className="space-y-2 mb-4 text-sm text-gray-600">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  <span>Expires in</span>
                                </div>
                                <span className={remainingDays <= 3 ? 'text-red-600 font-medium' : ''}>
                                  {remainingDays} days
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Download className="w-4 h-4 mr-1" />
                                  <span>Downloads left</span>
                                </div>
                                <span>{remainingDownloads}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  <span>Purchased</span>
                                </div>
                                <span>{formatDate(download.createdAt)}</span>
                              </div>
                            </div>

                            {remainingDays <= 3 && (
                              <div className="flex items-center mb-4 p-2 bg-yellow-50 rounded text-sm text-yellow-800">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                <span>Expires soon!</span>
                              </div>
                            )}

                            <Button
                              onClick={() => handleDownload(download.downloadUrl, download.product.examName)}
                              className="w-full"
                              disabled={remainingDownloads <= 0}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </Button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Expired Downloads */}
            {expiredDownloads.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 text-gray-600" />
                      Expired Downloads ({expiredDownloads.length})
                    </CardTitle>
                    <CardDescription>
                      Downloads that are no longer available
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {expiredDownloads.map((download) => {
                        const statusInfo = getStatusInfo(download);

                        return (
                          <div
                            key={download.id}
                            className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                          >
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h4 className="font-medium text-gray-900 mr-3">
                                  {download.product.examName}
                                </h4>
                                <Badge className={statusInfo.color}>
                                  {statusInfo.text}
                                </Badge>
                              </div>
                              {download.product.examCode && (
                                <p className="text-sm text-gray-600 mb-1">
                                  {download.product.examCode}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">
                                Purchased: {formatDate(download.createdAt)} • 
                                Expired: {formatDate(download.expiresAt)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600 mb-1">
                                Downloads used: {download.downloadCount}/{download.maxDownloads}
                              </p>
                              <Button variant="outline" size="sm" asChild>
                                <Link href="/products">Purchase Again</Link>
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
