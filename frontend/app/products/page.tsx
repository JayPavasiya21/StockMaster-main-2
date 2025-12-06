'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { productService, Product, Category } from '@/lib/products';
import { Plus, Search, Edit, Eye, Filter } from 'lucide-react';
import Link from 'next/link';
import { useDebounce } from '@/lib/hooks/useDebounce';
import SavedViewToolbar from '@/components/SavedViewToolbar';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [debouncedSearch, categoryFilter]);

  const loadCategories = async () => {
    try {
      const data = await productService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (categoryFilter) params.category = parseInt(categoryFilter);
      const data = await productService.getProducts(params);
      setProducts(data.results || data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySavedFilters = (filters: Record<string, any>) => {
    setSearch(filters.search ?? '');
    setCategoryFilter(filters.category ? String(filters.category) : '');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <Link
              href="/products/new"
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0"
            >
              <Plus size={20} />
              Add Product
            </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-500" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all duration-200 hover:border-gray-400 cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <select
                value=""
                onChange={() => {}}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all duration-200 hover:border-gray-400 cursor-pointer"
                disabled
                title="Warehouse filter coming soon"
              >
                <option value="">All Warehouses</option>
              </select>
            </div>
          </div>

          <SavedViewToolbar
            pageKey="products"
            currentFilters={{ search, category: categoryFilter || null }}
            onApply={handleApplySavedFilters}
            helperText="Store frequently used product search + category filters."
            className="mb-8"
          />

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium text-gray-700">Name</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-700">SKU</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-700">Category</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-700">Stock</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-700">Status</th>
                    <th className="text-right p-3 text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-gray-500">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50 hover:shadow-sm transition-all duration-200 cursor-pointer">
                        <td className="p-3">{product.name}</td>
                        <td className="p-3 text-gray-600">{product.sku}</td>
                        <td className="p-3 text-gray-600">{product.category_name || '-'}</td>
                        <td className="p-3">
                          <span className={product.is_low_stock ? 'text-yellow-600 font-medium' : ''}>
                            {product.total_stock || 0}{' '}
                            {product.stock_unit_detail?.code || product.stock_unit_detail?.name || ''}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              product.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/products/${product.id}`}
                              className="p-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200 dark:text-gray-300 dark:hover:text-emerald-300 dark:hover:bg-emerald-500/20"
                            >
                              <Eye size={18} />
                            </Link>
                            <Link
                              href={`/products/${product.id}/edit`}
                              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                            >
                              <Edit size={18} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

