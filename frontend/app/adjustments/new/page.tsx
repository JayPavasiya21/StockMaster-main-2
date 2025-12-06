'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { operationsService, StockAdjustment, AdjustmentItem } from '@/lib/operations';
import { productService, Warehouse, Product } from '@/lib/products';
import { Save, X, Plus, Trash2, Scan } from 'lucide-react';
import Link from 'next/link';
import BarcodeScanner from '@/components/BarcodeScanner';
import { showToast } from '@/lib/toast';

export default function NewAdjustmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<AdjustmentItem[]>([]);
  const [scannerEnabled, setScannerEnabled] = useState(false);
  const [scannerItemIndex, setScannerItemIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    warehouse: '',
    reason: '',
    adjustment_type: 'set' as 'increase' | 'decrease' | 'set',
    notes: '',
    status: 'draft' as const,
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

  const loadStockForProduct = async (productId: number, warehouseId: number) => {
    try {
      const stockData = await productService.getStockByWarehouse(productId, warehouseId);
      return stockData;
    } catch (error) {
      return { stock: 0 };
    }
  };

  const addItem = async () => {
    setItems([...items, {
      product: 0,
      current_quantity: 0,
      adjustment_quantity: 0,
      reason: '',
      unit_of_measure: 'stock',
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = async (index: number, field: keyof AdjustmentItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // If product or warehouse changed, load current stock
    if (field === 'product' && formData.warehouse && value) {
      const stock = await loadStockForProduct(value, parseInt(formData.warehouse));
      newItems[index].current_quantity = stock.stock || 0;
      if (formData.adjustment_type === 'set') {
        newItems[index].adjustment_quantity = stock.stock || 0;
      }
    }
    
    setItems(newItems);
  };

  const clampAdjustmentQuantity = (item: AdjustmentItem): number => {
    const productMeta = products.find((p) => p.id === item.product);
    if (!productMeta) return item.adjustment_quantity;

    const current = Number(item.current_quantity || 0);
    const requested = Number(item.adjustment_quantity || 0);
    const base = Number(productMeta.reorder_quantity || productMeta.reorder_level || 0) || 10;
    const maxCap = base * 5;
    const minSafe = Number(productMeta.reorder_level || 0);

    if (formData.adjustment_type === 'increase') {
      if (current + requested > maxCap) {
        const allowed = Math.max(0, maxCap - current);
        showToast.warning(
          `For ${productMeta.name}, warehouse capacity is limited. Increase amount has been adjusted to ${allowed}.`,
        );
        return allowed;
      }
      return requested;
    }

    if (formData.adjustment_type === 'decrease') {
      const newQty = current - requested;
      if (newQty < minSafe) {
        const allowed = Math.max(0, current - minSafe);
        showToast.warning(
          `For ${productMeta.name}, you cannot reduce stock below the safety level of ${minSafe}. Decrease amount has been adjusted to ${allowed}.`,
        );
        return allowed;
      }
      return requested;
    }

    // set type: clamp final quantity between minSafe and maxCap
    if (requested < minSafe) {
      showToast.warning(
        `For ${productMeta.name}, the new quantity cannot be lower than the safety level of ${minSafe}. It has been increased to that level.`,
      );
      return minSafe;
    }
    if (requested > maxCap) {
      showToast.warning(
        `For ${productMeta.name}, the new quantity exceeds the storage capacity. It has been limited to ${maxCap}.`,
      );
      return maxCap;
    }
    return requested;
  };

  const handleScanResult = async (barcode: string) => {
    if (scannerItemIndex === null) return;
    try {
      const product = await productService.lookupProduct({ barcode });
      updateItem(scannerItemIndex, 'product', product.id);
      showToast.success(`Selected ${product.name}`);
    } catch {
      showToast.error('Product not found for scanned barcode');
    } finally {
      setScannerItemIndex(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('Please add at least one item');
      return;
    }
    if (!formData.warehouse) {
      setError('Please select a warehouse');
      return;
    }
    if (!formData.reason) {
      setError('Please enter a reason for the adjustment');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const adjustmentData = {
        ...formData,
        warehouse: parseInt(formData.warehouse),
        items: items.map(item => {
          const productMeta = products.find((p) => p.id === item.product);
          const factor = productMeta?.unit_conversion_factor || 1;
          const adjustmentQuantity =
            item.unit_of_measure === 'purchase'
              ? Number(item.adjustment_quantity) * Number(factor)
              : item.adjustment_quantity;

          return {
            product: item.product,
            current_quantity: item.current_quantity,
            adjustment_quantity: adjustmentQuantity,
            reason: item.reason,
          };
        }),
      };
      await operationsService.createAdjustment(adjustmentData);
      showToast.success('Adjustment created successfully');
      router.push('/adjustments');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create adjustment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Create New Adjustment</h1>
          <Link
            href="/adjustments"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warehouse *
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adjustment Type *
              </label>
              <select
                required
                value={formData.adjustment_type}
                onChange={(e) => setFormData({ ...formData, adjustment_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="increase">Increase</option>
                <option value="decrease">Decrease</option>
                <option value="set">Set to Value</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason *
              </label>
              <input
                type="text"
                required
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="e.g., Physical count, Damage, Found stock..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="waiting">Waiting</option>
                <option value="ready">Ready</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Items</h2>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={scannerEnabled}
                    onChange={(e) => setScannerEnabled(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  Enable barcode scanning
                </label>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200"
                >
                  <Plus size={20} />
                  Add Item
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No items added. Click "Add Item" to start.</p>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product *
                        </label>
                        <select
                          required
                          value={item.product}
                          onChange={(e) => updateItem(index, 'product', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="0">Select Product</option>
                          {products.map((prod) => (
                            <option key={prod.id} value={prod.id}>
                              {prod.name} ({prod.sku})
                            </option>
                          ))}
                        </select>
                          {scannerEnabled && (
                            <button
                              type="button"
                              onClick={() => setScannerItemIndex(index)}
                              className="mt-2 inline-flex items-center gap-2 rounded-lg border border-primary-200 px-3 py-1 text-sm text-primary-600 hover:bg-primary-50"
                            >
                              <Scan size={14} />
                              Scan barcode
                            </button>
                          )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Stock
                        </label>
                        <input
                          type="number"
                          readOnly
                          value={item.current_quantity}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {formData.adjustment_type === 'set' ? 'New Quantity *' : 
                           formData.adjustment_type === 'increase' ? 'Increase By *' : 
                           'Decrease By *'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={item.adjustment_quantity}
                          onChange={(e) =>
                            updateItem(index, 'adjustment_quantity', {
                              ...item,
                              adjustment_quantity: clampAdjustmentQuantity({
                                ...item,
                                adjustment_quantity: parseFloat(e.target.value) || 0,
                              }),
                            } as any)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity Unit
                        </label>
                        <select
                          value={item.unit_of_measure || 'stock'}
                          onChange={(e) => updateItem(index, 'unit_of_measure', e.target.value as 'stock' | 'purchase')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="stock">Stock unit</option>
                          <option value="purchase">Purchase unit</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          Purchase units automatically convert using each product’s conversion factor.
                        </p>
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item Reason (Optional)
                      </label>
                      <input
                        type="text"
                        value={item.reason || ''}
                        onChange={(e) => updateItem(index, 'reason', e.target.value)}
                        placeholder="Reason for this item..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
            >
              <Save size={20} />
              {loading ? 'Creating...' : 'Create Adjustment'}
            </button>
            <Link
              href="/adjustments"
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
      {scannerEnabled && scannerItemIndex !== null && (
        <BarcodeScanner onScan={handleScanResult} onClose={() => setScannerItemIndex(null)} />
      )}
    </Layout>
  );
}

