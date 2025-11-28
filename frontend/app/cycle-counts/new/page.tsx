'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { operationsService } from '@/lib/operations';
import { productService, Warehouse, Product } from '@/lib/products';
import { Save, X } from 'lucide-react';
import Link from 'next/link';

export default function NewCycleCountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    warehouse: '',
    scheduled_date: '',
    method: 'full' as 'full' | 'partial' | 'abc',
    notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadWarehouses();
    loadProducts();
  }, []);

  const loadWarehouses = async () => {
    try {
      const data = await productService.getWarehouses();
      setWarehouses(data);
    } catch (error) {
      console.error('Failed to load warehouses:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data.results || data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.warehouse) {
      setError('Please select a warehouse');
      return;
    }
    if (selectedProducts.length === 0) {
      setError('Please select at least one product to count');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await operationsService.createCycleCount({
        warehouse: parseInt(formData.warehouse),
        scheduled_date: formData.scheduled_date || undefined,
        method: formData.method,
        notes: formData.notes || undefined,
        items: selectedProducts,
      });
      const { showToast } = await import('@/lib/toast');
      showToast.success('Cycle count created successfully');
      router.push('/cycle-counts');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create cycle count');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">New Cycle Count</h1>
          <Link
            href="/cycle-counts"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
          >
            <X size={20} />
            Cancel
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse *</label>
              <select
                required
                value={formData.warehouse}
                onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name} ({wh.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Method *</label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="full">Full Count</option>
                <option value="partial">Partial Count</option>
                <option value="abc">ABC-Based</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date</label>
              <input
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Products to Count</h2>
            <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
              {products.length === 0 ? (
                <p className="text-gray-500 text-center py-6">No products found.</p>
              ) : (
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left">
                        <span className="sr-only">Select</span>
                      </th>
                      <th className="p-3 text-left font-medium text-gray-700">Name</th>
                      <th className="p-3 text-left font-medium text-gray-700">SKU</th>
                      <th className="p-3 text-left font-medium text-gray-700">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const checked = selectedProducts.includes(product.id);
                      return (
                        <tr
                          key={product.id}
                          className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                          onClick={() => toggleProductSelection(product.id)}
                        >
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleProductSelection(product.id)}
                              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                          </td>
                          <td className="p-3 text-gray-900">{product.name}</td>
                          <td className="p-3 text-gray-600">{product.sku}</td>
                          <td className="p-3 text-gray-600">{product.category_name || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
            >
              <Save size={20} />
              {loading ? 'Creating...' : 'Create Cycle Count'}
            </button>
            <Link
              href="/cycle-counts"
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  );
}
