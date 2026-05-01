import { useState, useEffect } from 'react';
import api from '../services/api';
import { TrendingUp, ShoppingBag, Users, LucideIcon } from 'lucide-react';
import { DashboardStats, RevenueReport } from '../types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const StatCard = ({ title, value, icon: Icon, bgColor, iconColor }: { title: string; value: string | number; icon: LucideIcon; bgColor: string; iconColor: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
    <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center mr-4`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
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

  const chartData = reports?.daily.slice(0, 7).map(item => ({
    name: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    revenue: parseFloat(item.revenue)
  })).reverse() || [];

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
          icon={TrendingUp} 
          bgColor="bg-brand/10"
          iconColor="text-brand" 
        />
        <StatCard 
          title="Active Orders" 
          value={stats?.activeOrders || 0} 
          icon={ShoppingBag} 
          bgColor="bg-orange-50"
          iconColor="text-orange-600" 
        />
        <StatCard 
          title="New Customers Today" 
          value={stats?.newCustomersToday || 0} 
          icon={Users} 
          bgColor="bg-green-50"
          iconColor="text-green-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-brand" />
            Recent Daily Revenue
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00B5B8" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#00B5B8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickFormatter={(value) => `₱${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                  }}
                  formatter={(value: any) => [`₱${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Area 
                  name="Revenue"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#00B5B8" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
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
