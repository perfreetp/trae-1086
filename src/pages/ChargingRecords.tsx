import { useState, useMemo } from 'react';
import { Receipt, Zap, BatteryCharging, Clock, MapPin, User, Search, Filter, Download, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { chargingRecords } from '@/data/records';
import { getStatusText, getStatusColor, getServiceTypeText, formatCurrency, formatDateTime, formatDuration } from '@/utils/format';

export default function ChargingRecords() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const stats = useMemo(() => {
    const todayRecords = chargingRecords.filter(r => r.startTime.includes('2026-06-07'));
    const totalAmount = todayRecords.reduce((sum, r) => sum + r.amount, 0);
    const chargingCount = todayRecords.filter(r => r.type === 'charging').length;
    const swapCount = todayRecords.filter(r => r.type === 'battery-swap').length;
    const inProgress = todayRecords.filter(r => r.status === 'charging').length;
    return { totalAmount, chargingCount, swapCount, inProgress, total: todayRecords.length };
  }, []);

  const chartData = [
    { time: '08:00', orders: 5, revenue: 420 },
    { time: '09:00', orders: 12, revenue: 980 },
    { time: '10:00', orders: 18, revenue: 1520 },
    { time: '11:00', orders: 15, revenue: 1280 },
    { time: '12:00', orders: 8, revenue: 680 },
    { time: '14:00', orders: 10, revenue: 850 },
    { time: '15:00', orders: 14, revenue: 1180 },
    { time: '16:00', orders: 16, revenue: 1360 },
  ];

  const filteredRecords = chargingRecords.filter((record) => {
    const matchesSearch = record.userName.includes(searchQuery) || 
                          record.siteName.includes(searchQuery) ||
                          record.id.includes(searchQuery);
    const matchesType = typeFilter === 'all' || record.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const inProgressRecords = chargingRecords.filter(r => r.status === 'charging');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">充电记录</h1>
          <p className="text-slate-500 mt-1">查看充电和换电服务历史记录</p>
        </div>
        <button className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-200 transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" />
          导出报表
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-xs text-slate-500 mt-1">今日订单</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.chargingCount}</p>
          <p className="text-xs text-slate-500 mt-1">充电服务</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <BatteryCharging className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.swapCount}</p>
          <p className="text-xs text-slate-500 mt-1">换电服务</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.inProgress}</p>
          <p className="text-xs text-slate-500 mt-1">进行中</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalAmount)}</p>
          <p className="text-xs text-slate-500 mt-1">今日营收</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">今日充电进度</h3>
          </div>
          
          {inProgressRecords.length > 0 ? (
            <div className="p-4 space-y-4">
              {inProgressRecords.map((record) => (
                <div key={record.id} className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 relative">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="#E0E7FF"
                            strokeWidth="6"
                            fill="none"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="#3B82F6"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={`${(record.batteryAfter! / 100) * 176} 176`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-blue-600">{record.batteryAfter}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-800">{record.userName}</p>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                            充电中
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{record.siteName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">已充电</p>
                      <p className="text-lg font-bold text-blue-600">{record.energyDelivered} kWh</p>
                      <p className="text-xs text-slate-500 mt-1">预计还需 12 分钟</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>开始时间: {formatDateTime(record.startTime)}</span>
                    <span>预计费用: {formatCurrency(record.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              <Zap className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>暂无进行中的充电</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">今日订单趋势</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">历史记录</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索订单..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部类型</option>
              <option value="charging">充电</option>
              <option value="battery-swap">换电</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部状态</option>
              <option value="charging">充电中</option>
              <option value="completed">已完成</option>
              <option value="failed">失败</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">订单信息</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">用户</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">站点</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">类型</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">时长/电量</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">金额</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">状态</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-mono text-sm text-slate-700">{record.id}</p>
                      <p className="text-xs text-slate-500">{formatDateTime(record.startTime)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm text-slate-700">{record.userName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <MapPin className="w-4 h-4" />
                      {record.siteName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${
                      record.type === 'charging' ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {getServiceTypeText(record.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {record.duration ? formatDuration(record.duration) : '-'}
                    {record.energyDelivered && ` / ${record.energyDelivered} kWh`}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-800">
                      {formatCurrency(record.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {getStatusText(record.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                      详情
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
