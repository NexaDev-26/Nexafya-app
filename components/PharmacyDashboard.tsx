
import React from 'react';
import { ShoppingBag, Wallet } from 'lucide-react';
import { SkeletonLoader } from './SkeletonLoader';

interface PharmacyDashboardProps {
  userName: string;
  loading: boolean;
  onNavigate: (view: string, tab?: any) => void;
}

export const PharmacyDashboard: React.FC<PharmacyDashboardProps> = ({
  userName,
  loading,
  onNavigate
}) => {
  if (loading) {
      return (
          <div className="animate-in fade-in duration-500">
              <SkeletonLoader type="dashboard" />
          </div>
      );
  }
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
                <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white">Pharmacy Overview</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{userName}</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
                <button onClick={() => onNavigate('orders')} className="flex-1 md:flex-none bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                    <ShoppingBag size={18} /> Orders
                </button>
                <button onClick={() => onNavigate('finance')} className="flex-1 md:flex-none bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-emerald-700 flex items-center justify-center gap-2">
                    <Wallet size={18} /> Finance
                </button>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 p-6 rounded-2xl">
                <h3 className="text-emerald-800 dark:text-emerald-300 font-bold text-lg mb-1">Total Sales</h3>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">TZS 1.2M</p>
                <p className="text-xs text-emerald-500 mt-2">▲ 12% from last month</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 p-6 rounded-2xl">
                <h3 className="text-blue-800 dark:text-blue-300 font-bold text-lg mb-1">Pending Orders</h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">5</p>
                <p className="text-xs text-blue-500 mt-2">Requires immediate attention</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800 p-6 rounded-2xl">
                <h3 className="text-purple-800 dark:text-purple-300 font-bold text-lg mb-1">Low Stock Items</h3>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">3</p>
                <p className="text-xs text-purple-500 mt-2">Refill suggested</p>
            </div>
        </div>
    </div>
  );
};
