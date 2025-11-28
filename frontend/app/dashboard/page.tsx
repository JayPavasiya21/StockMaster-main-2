'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { dashboardService, DashboardKPIs, RecentActivity, LowStockProduct } from '@/lib/dashboard';
import { Package, AlertTriangle, Receipt, Truck, ArrowLeftRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [kpis, setKPIs] = useState<DashboardKPIs | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [kpisData, activitiesData, lowStockData] = await Promise.all([
        dashboardService.getKPIs(),
        dashboardService.getRecentActivities(5),
        dashboardService.getLowStockProducts(),
      ]);
      setKPIs(kpisData);
      setActivities(activitiesData);
      setLowStock(lowStockData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  const kpiCards = [
    {
      title: 'Total Products',
      value: kpis?.total_products || 0,
      icon: Package,
      color: 'bg-blue-500',
      href: '/products',
    },
    {
      title: 'Low Stock Items',
      value: kpis?.low_stock_items || 0,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      href: '/products?filter=low_stock',
    },
    {
      title: 'Out of Stock',
      value: kpis?.out_of_stock_items || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      href: '/products?filter=out_of_stock',
    },
    {
      title: 'Pending Receipts',
      value: kpis?.pending_receipts || 0,
      icon: Receipt,
      color: 'bg-green-500',
      href: '/receipts?status=ready',
    },
    {
      title: 'Pending Deliveries',
      value: kpis?.pending_deliveries || 0,
      icon: Truck,
      color: 'bg-purple-500',
      href: '/deliveries?status=ready',
    },
    {
      title: 'Scheduled Transfers',
      value: kpis?.scheduled_transfers || 0,
      icon: ArrowLeftRight,
      color: 'bg-indigo-500',
      href: '/transfers?status=ready',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpiCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="bg-white rounded-lg shadow p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium group-hover:text-gray-900 transition-colors">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2 group-hover:text-primary-600 transition-colors">{card.value}</p>
                  </div>
                  <div className={`${card.color} p-3 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activities</h2>
            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent activities</p>
              ) : (
                activities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-sm transition-all duration-200 cursor-pointer"
                  >
                    <div>
                      <p className="font-medium text-sm text-gray-900">
                        {activity.document_number}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.type} • {activity.warehouse || `${activity.from_warehouse} → ${activity.to_warehouse}`}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        activity.status === 'done'
                          ? 'bg-green-100 text-green-800'
                          : activity.status === 'ready'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {activity.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Low Stock Alert</h2>
            <div className="space-y-3">
              {lowStock.length === 0 ? (
                <p className="text-gray-500 text-sm">No low stock items</p>
              ) : (
                lowStock.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 hover:shadow-sm transition-all duration-200 cursor-pointer"
                  >
                    <div>
                      <p className="font-medium text-sm text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">
                        Stock: {product.current_stock} • Reorder: {product.reorder_level}
                      </p>
                    </div>
                    <AlertTriangle className="text-yellow-600" size={20} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

