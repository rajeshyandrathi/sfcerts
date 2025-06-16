
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  BookOpen, 
  Award, 
  Users, 
  CheckCircle, 
  Star,
  ArrowRight,
  Download,
  Clock,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  examName: string;
  examCode: string | null;
  price: number;
  difficultyLevel: string;
  questionsCount: number;
  examDuration: number;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({ totalExams: 0, totalQuestions: 0, avgPrice: 0 });
  
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [featuresRef, featuresInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [productsRef, productsInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data.slice(0, 6)); // Show first 6 products
      
      {/* // Commented for Static values
      const totalExams = data.length;
      const totalQuestions = data.reduce((sum: number, product: Product) => sum + product.questionsCount, 0);
      const avgPrice = data.reduce((sum: number, product: Product) => sum + product.price, 0) / data.length; */}

      const totalExams = 50;
      const totalQuestions = 3000;
      const avgPrice = 25;
      
      setStats({ totalExams, totalQuestions, avgPrice: Math.round(avgPrice) });
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const features = [
    {
      icon: BookOpen,
      title: "Comprehensive Study Materials",
      description: "Detailed practice questions covering all exam topics with explanations"
    },
    {
      icon: Award,
      title: "Real Exam Format",
      description: "Questions designed to match the actual Salesforce certification exam format"
    },
    {
      icon: Download,
      title: "Instant Download",
      description: "Get immediate access to your study materials after purchase"
    },
    {
      icon: Clock,
      title: "15-Day Access",
      description: "Download and study at your own pace with extended access period"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 px-4"
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="secondary" className="mb-4">
              <Star className="w-4 h-4 mr-1" />
              Trusted by Salesforce Professionals
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Master Salesforce
              <span className="text-blue-600 block">Certifications</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Professional practice questions and study materials for all Salesforce certification exams. 
              Get certified with confidence using our comprehensive exam preparation resources.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/products">
                  Browse All Exams
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link href="/auth/register">Start Free Trial</Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{stats.totalExams}+</div>
              <div className="text-gray-600">Certification Exams</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{stats.totalQuestions}+</div>
              <div className="text-gray-600">Practice Questions</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">${stats.avgPrice}</div>
              <div className="text-gray-600">Average Price</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            className="text-center mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose SF Exams For You?
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide the most comprehensive and up-to-date Salesforce certification study materials
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full text-center hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section ref={productsRef} className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={productsInView ? "visible" : "hidden"}
            className="text-center mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-4xl font-bold text-gray-900 mb-4">
              Popular Certification Exams
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start your Salesforce certification journey with our most popular exam preparations
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={productsInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {products.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline">{product.difficultyLevel}</Badge>
                      <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                    </div>
                    <CardTitle className="text-xl line-clamp-2">{product.examName}</CardTitle>
                    {product.examCode && (
                      <CardDescription className="font-medium text-gray-700">
                        {product.examCode}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Target className="w-4 h-4 mr-1" />
                        {product.questionsCount} Questions
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {product.examDuration} min
                      </div>
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/products/${product.id}`}>
                        View Details
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate={productsInView ? "visible" : "hidden"}
            className="text-center mt-12"
          >
            <Button asChild variant="outline" size="lg">
              <Link href="/products">
                View All Exams
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Certified?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of professionals who have advanced their careers with Salesforce certifications
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link href="/products">Start Learning Today</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 border-white text-white hover:bg-white hover:text-blue-600">
              <Link href="/auth/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
