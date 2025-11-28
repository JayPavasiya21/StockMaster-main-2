'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import {
  analyticsService,
  AnalyticsDashboard,
  ReplenishmentSuggestion,
  ServiceLevelMetrics,
  AbcXyzMatrix,
} from '@/lib/analytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Package, DollarSign, AlertTriangle, Clock, Activity } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B'];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [replenishment, setReplenishment] = useState<ReplenishmentSuggestion[]>([]);
  const [serviceLevels, setServiceLevels] = useState<ServiceLevelMetrics | null>(null);
  const [abcXyz, setAbcXyz] = useState<AbcXyzMatrix | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [dashboardData, replenishmentData, serviceData, abcXyzData] = await Promise.all([
        analyticsService.getAnalyticsDashboard(),
        analyticsService.getReplenishmentSuggestions(),
        analyticsService.getServiceLevels(),
        analyticsService.getAbcXyzMatrix(),
      ]);
      setAnalytics(dashboardData);
      setReplenishment(replenishmentData.results.slice(0, 8));
      setServiceLevels(serviceData);
      setAbcXyz(abcXyzData);
    } catch (error: any) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8 text-gray-500">Loading analytics...</div>
      </Layout>
    );
  }

  if (!analytics) {
    return (
      <Layout>
        <div className="text-center py-8 text-gray-500">No analytics data available</div>
      </Layout>
    );
  }

  const abcData = [
    {
      name: 'Class A',
      value: analytics.abc_analysis.class_a.value,
      count: analytics.abc_analysis.class_a.count,
      percentage: analytics.abc_analysis.class_a.percentage,
    },
    {
      name: 'Class B',
      value: analytics.abc_analysis.class_b.value,
      count: analytics.abc_analysis.class_b.count,
      percentage: analytics.abc_analysis.class_b.percentage,
    },
    {
      name: 'Class C',
      value: analytics.abc_analysis.class_c.value,
      count: analytics.abc_analysis.class_c.count,
      percentage: analytics.abc_analysis.class_c.percentage,
    },
  ];

  const matrixBuckets = ['AX', 'AY', 'AZ', 'BX', 'BY', 'BZ', 'CX', 'CY', 'CZ'];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Comprehensive inventory insights and metrics</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Total Inventory Value</p>
                <p className="text-2xl font-bold mt-2">
                  ${analytics.total_inventory_value.toLocaleString()}
                </p>
              </div>
              <DollarSign size={32} className="text-primary-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Inventory Turnover</p>
                <p className="text-2xl font-bold mt-2">
                  {analytics.inventory_turnover.ratio.toFixed(2)}x
                </p>
              </div>
              <TrendingUp size={32} className="text-green-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Dead Stock Products</p>
                <p className="text-2xl font-bold mt-2">{analytics.dead_stock.product_count}</p>
              </div>
              <AlertTriangle size={32} className="text-orange-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Dead Stock Value</p>
                <p className="text-2xl font-bold mt-2">
                  ${analytics.dead_stock.total_value.toLocaleString()}
                </p>
              </div>
              <Package size={32} className="text-red-600" />
            </div>
          </div>
        </div>

        {/* ABC Analysis Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">ABC Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <BarChart width={400} height={300} data={abcData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </div>
            <div>
              <PieChart width={400} height={300}>
                <Pie
                  data={abcData}
                  cx={200}
                  cy={150}
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {abcData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {abcData.map((item) => (
              <div key={item.name} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold text-lg">{item.name}</p>
                <p className="text-2xl font-bold text-primary-600 mt-2">
                  ${item.value.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {item.count} products ({item.percentage.toFixed(1)}%)
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Turnover Details */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Inventory Turnover Details</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Turnover Ratio</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {analytics.inventory_turnover.ratio.toFixed(2)}x
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">COGS</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                ${analytics.inventory_turnover.cogs.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Avg Inventory</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                ${analytics.inventory_turnover.average_inventory.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Replenishment Suggestions */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">Replenishment Suggestions</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Based on the last 90 days of outbound demand
              </p>
            </div>
            <Activity size={24} className="text-primary-600" />
          </div>
          {replenishment.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-300">No products are projected to stock out soon.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700">
                    <th className="py-2 pr-4">Product</th>
                    <th className="py-2 pr-4">Current Stock</th>
                    <th className="py-2 pr-4">Daily Demand</th>
                    <th className="py-2 pr-4">Suggested Qty</th>
                    <th className="py-2">Days to Stockout</th>
                  </tr>
                </thead>
                <tbody>
                  {replenishment.map((row) => (
                    <tr key={`${row.product_id}-${row.warehouse_id}`} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 pr-4">
                        <p className="font-medium">{row.product_name}</p>
                        <p className="text-xs text-gray-500">SKU {row.sku}</p>
                      </td>
                      <td className="py-3 pr-4">{row.current_stock.toFixed(1)}</td>
                      <td className="py-3 pr-4">{row.avg_daily_demand.toFixed(2)}</td>
                      <td className="py-3 pr-4 text-primary-600 font-semibold">{row.suggested_quantity.toFixed(1)}</td>
                      <td className="py-3">
                        {row.days_until_stockout ? `${row.days_until_stockout.toFixed(1)} days` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Service Levels */}
        {serviceLevels && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Service Level & Fill Rate</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rolling 30-day overview</p>
              </div>
              <Clock size={24} className="text-primary-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">On-time rate</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                  {(serviceLevels.overall.on_time_rate * 100).toFixed(1)}%
                </p>
              </div>
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">Fill rate</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-300">
                  {(serviceLevels.overall.fill_rate * 100).toFixed(1)}%
                </p>
              </div>
              <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">Avg lead time</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                  {serviceLevels.overall.avg_lead_time_hours.toFixed(1)}h
                </p>
              </div>
              <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">Open units</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-300">
                  {serviceLevels.overall.open_units.toFixed(0)}
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700">
                    <th className="py-2 pr-4">Warehouse</th>
                    <th className="py-2 pr-4">Deliveries</th>
                    <th className="py-2 pr-4">Completed</th>
                    <th className="py-2 pr-4">On-time rate</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceLevels.warehouses.map((warehouse) => (
                    <tr key={warehouse.warehouse_id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 pr-4 font-medium">{warehouse.warehouse_name}</td>
                      <td className="py-2 pr-4">{warehouse.total_deliveries}</td>
                      <td className="py-2 pr-4">{warehouse.done_deliveries}</td>
                      <td className="py-2 pr-4">
                        {(warehouse.on_time_rate * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABC / XYZ Matrix */}
        {abcXyz && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">ABC / XYZ Segmentation</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {matrixBuckets.map((bucket) => {
                const entry = abcXyz.matrix[bucket] || { count: 0, sample_products: [] };
                return (
                  <div
                    key={bucket}
                    className="rounded-lg border border-gray-100 dark:border-gray-700 p-4 hover:border-primary-200"
                  >
                    <p className="text-sm text-gray-500">Segment</p>
                    <p className="text-2xl font-bold text-primary-600">{bucket}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {entry.count} products
                    </p>
                    {entry.sample_products.length > 0 && (
                      <ul className="mt-2 text-xs text-gray-500 space-y-1">
                        {entry.sample_products.map((product) => (
                          <li key={product.id}>
                            {product.name} ({product.sku})
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

