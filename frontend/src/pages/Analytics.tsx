import { useState, useEffect } from 'react';
import api from '../services/api';
import { TrendingUp, DollarSign, Users, Package, LucideIcon } from 'lucide-react';
import { DashboardStats, RevenueReport } from '../types';

const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: LucideIcon; color: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex items-center">
      <div className={`p-3 rounded-lg ${color} mr-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  </div>
);

const Analytics = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reports, setReports] = useState<RevenueReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, reportsRes] = await Promise.all([
          api.get<DashboardStats>('/reports/dashboard-stats'),
          api.get<RevenueReport>('/reports/revenue')
        ]);
        setStats(statsRes.data);
        setReports(reportsRes.data);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-10">Loading analytics...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Financial Analytics</h1>
        <p className="text-gray-500">Overview of business performance and revenue</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Today's Revenue" 
          value={`₱${stats?.todayRevenue?.toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Active Orders" 
          value={stats?.activeOrders || 0} 
          icon={Package} 
          color="bg-brand" 
        />
        <StatCard 
          title="New Customers Today" 
          value={stats?.newCustomersToday || 0} 
          icon={Users} 
          color="bg-purple-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-brand" />
            Recent Daily Revenue
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-sm border-b border-gray-100">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reports?.daily.slice(0, 7).map((item) => (
                  <tr key={item.date}>
                    <td className="py-3 text-sm text-gray-700">
                      {new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 text-sm font-bold text-gray-900 text-right">
                      ₱{parseFloat(item.revenue).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">Monthly Performance</h2>
          <div className="space-y-4">
            {reports?.monthly.map((item) => (
              <div key={item.month} className="flex flex-col">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {new Date(item.month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    ₱{parseFloat(item.revenue).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-brand h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (parseFloat(item.revenue) / 50000) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
