
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Clock, 
  Target, 
  CheckCircle, 
  ArrowLeft,
  BookOpen,
  Award,
  Users,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  examName: string;
  examCode: string | null;
  description: string;
  targetAudience: string;
  difficultyLevel: string;
  questionsCount: number;
  examDuration: number;
  passingScore: string;
  keyTopics: any[];
  price: number;
  sampleQuestions: any[];
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        router.push('/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      router.push('/products');
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async () => {
    setIsAddingToCart(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product?.id,
          quantity: 1,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Added to cart!',
          description: 'The exam has been added to your cart.',
        });
      } else if (response.status === 401) {
        toast({
          title: 'Please log in',
          description: 'You need to be logged in to add items to cart.',
          variant: 'destructive',
        });
        router.push('/auth/login');
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.error || 'Failed to add to cart',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAddingToCart(false);
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
          <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading exam details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Exam not found</h1>
          <Button onClick={() => router.push('/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Exams
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/products')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to All Exams
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-start justify-between mb-4">
                <Badge className={getDifficultyColor(product.difficultyLevel)}>
                  {product.difficultyLevel}
                </Badge>
                <span className="text-3xl font-bold text-blue-600">${product.price}</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.examName}</h1>
              {product.examCode && (
                <p className="text-xl text-gray-600 font-medium">{product.examCode}</p>
              )}
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <Card>
                <CardContent className="flex items-center p-4">
                  <Target className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{product.questionsCount}</p>
                    <p className="text-sm text-gray-600">Questions</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-4">
                  <Clock className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{product.examDuration}</p>
                    <p className="text-sm text-gray-600">Minutes</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-4">
                  <Award className="w-8 h-8 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{product.passingScore}</p>
                    <p className="text-sm text-gray-600">Passing Score</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    About This Exam
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Target Audience */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Target Audience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{product.targetAudience}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Key Topics */}
            {product.keyTopics && product.keyTopics.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Exam Topics</CardTitle>
                    <CardDescription>
                      Key areas covered in this certification exam
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {product.keyTopics.map((topic: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                            <span className="font-medium">{topic.topic}</span>
                          </div>
                          {topic.weighting && (
                            <Badge variant="outline">{topic.weighting}</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Sample Questions */}
            {product.sampleQuestions && product.sampleQuestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Sample Questions</CardTitle>
                    <CardDescription>
                      Examples of question formats you'll encounter
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {product.sampleQuestions.map((question: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center mb-2">
                            <Badge variant="outline" className="mr-2">
                              {question.type}
                            </Badge>
                          </div>
                          <p className="text-gray-700 italic">"{question.example}"</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="sticky top-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">${product.price}</CardTitle>
                  <CardDescription>One-time purchase with 15-day access</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={addToCart}
                    disabled={isAddingToCart}
                    className="w-full"
                    size="lg"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                  </Button>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">What's Included:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span>{product.questionsCount} practice questions</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span>Detailed explanations</span>
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
                        <span>Up to 10 downloads</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="text-center text-sm text-gray-600">
                    <Download className="w-4 h-4 mx-auto mb-1" />
                    <p>Instant access after purchase</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
