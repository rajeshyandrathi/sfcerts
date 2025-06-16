
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Search, 
  Filter, 
  Clock, 
  Target, 
  ArrowRight,
  BookOpen,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Product {
  id: string;
  examName: string;
  examCode: string | null;
  description: string;
  difficultyLevel: string;
  questionsCount: number;
  examDuration: number;
  passingScore: string;
  price: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const [headerRef, headerInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [productsRef, productsInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, difficultyFilter, priceFilter]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.examCode && product.examCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(product =>
        product.difficultyLevel.toLowerCase().includes(difficultyFilter.toLowerCase())
      );
    }

    // Price filter
    if (priceFilter !== 'all') {
      filtered = filtered.filter(product => {
        switch (priceFilter) {
          case 'under-20':
            return product.price < 20;
          case '20-25':
            return product.price >= 20 && product.price <= 25;
          case 'over-25':
            return product.price > 25;
          default:
            return true;
        }
      });
    }

    setFilteredProducts(filtered);
  };

  const getDifficultyColor = (difficulty: string) => {
    const lower = difficulty.toLowerCase();
    if (lower.includes('foundational')) return 'bg-green-100 text-green-800';
    if (lower.includes('intermediate') || lower.includes('specialized')) return 'bg-yellow-100 text-yellow-800';
    if (lower.includes('advanced') || lower.includes('architect')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading exam catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section ref={headerRef} className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Salesforce Certification Exams
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Choose from our comprehensive collection of Salesforce certification practice exams. 
              Each exam includes detailed questions, explanations, and study materials.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                <span>Professional Quality</span>
              </div>
              <div className="flex items-center">
                <Target className="w-4 h-4 mr-1 text-blue-500" />
                <span>Real Exam Format</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1 text-green-500" />
                <span>15-Day Access</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search exams by name, code, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4">
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="foundational">Foundational</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="architect">Architect</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-20">Under $20</SelectItem>
                  <SelectItem value="20-25">$20 - $25</SelectItem>
                  <SelectItem value="over-25">Over $25</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section ref={productsRef} className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-gray-600">
              Showing {filteredProducts.length} of {products.length} exams
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={productsInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredProducts.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getDifficultyColor(product.difficultyLevel)}>
                        {product.difficultyLevel}
                      </Badge>
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
                    <p className="text-gray-600 line-clamp-3">{product.description}</p>
                    
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

                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Passing Score:</span> {product.passingScore}
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

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No exams found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
