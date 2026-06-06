import { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Users, Zap, BatteryCharging, DollarSign, Star, Download, Calendar, ChevronDown, MessageSquare, ThumbsUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import { reviews } from '@/data/reports';
import { formatCurrency, formatDate } from '@/utils/format';

const dataByRange = {
  day: {
    report: [
      { date: '08:00', totalRevenue: 320, totalOrders: 5, newMembers: 1, siteUtilization: 45, chargingOrders: 3, swapOrders: 2 },
      { date: '09:00', totalRevenue: 680, totalOrders: 12, newMembers: 2, siteUtilization: 68, chargingOrders: 7, swapOrders: 5 },
      { date: '10:00', totalRevenue: 920, totalOrders: 18, newMembers: 3, siteUtilization: 78, chargingOrders: 11, swapOrders: 7 },
      { date: '11:00', totalRevenue: 780, totalOrders: 15, newMembers: 1, siteUtilization: 72, chargingOrders: 9, swapOrders: 6 },
      { date: '12:00', totalRevenue: 450, totalOrders: 8, newMembers: 0, siteUtilization: 55, chargingOrders: 5, swapOrders: 3 },
      { date: '14:00', totalRevenue: 580, totalOrders: 10, newMembers: 2, siteUtilization: 60, chargingOrders: 6, swapOrders: 4 },
      { date: '15:00', totalRevenue: 820, totalOrders: 14, newMembers: 1, siteUtilization: 75, chargingOrders: 8, swapOrders: 6 },
      { date: '16:00', totalRevenue: 950, totalOrders: 16, newMembers: 2, siteUtilization: 80, chargingOrders: 10, swapOrders: 6 },
    ],
    utilization: [
      { name: '中关村', utilization: 82 },
      { name: '望京', utilization: 88 },
      { name: '亦庄', utilization: 65 },
    ],
    revenueType: [
      { name: '充电服务', value: 62, color: '#3B82F6' },
      { name: '换电服务', value: 38, color: '#10B981' },
    ],
  },
  week: {
    report: [
      { date: '周一', totalRevenue: 4200, totalOrders: 68, newMembers: 12, siteUtilization: 62, chargingOrders: 40, swapOrders: 28 },
      { date: '周二', totalRevenue: 4800, totalOrders: 75, newMembers: 15, siteUtilization: 68, chargingOrders: 44, swapOrders: 31 },
      { date: '周三', totalRevenue: 5200, totalOrders: 82, newMembers: 18, siteUtilization: 72, chargingOrders: 48, swapOrders: 34 },
      { date: '周四', totalRevenue: 4600, totalOrders: 72, newMembers: 10, siteUtilization: 65, chargingOrders: 42, swapOrders: 30 },
      { date: '周五', totalRevenue: 5800, totalOrders: 95, newMembers: 22, siteUtilization: 78, chargingOrders: 55, swapOrders: 40 },
      { date: '周六', totalRevenue: 6200, totalOrders: 105, newMembers: 25, siteUtilization: 82, chargingOrders: 62, swapOrders: 43 },
      { date: '周日', totalRevenue: 5500, totalOrders: 88, newMembers: 18, siteUtilization: 75, chargingOrders: 52, swapOrders: 36 },
    ],
    utilization: [
      { name: '中关村', utilization: 78 },
      { name: '望京', utilization: 85 },
      { name: '亦庄', utilization: 62 },
      { name: '海淀', utilization: 72 },
      { name: '通州', utilization: 68 },
      { name: '丰台', utilization: 92 },
    ],
    revenueType: [
      { name: '充电服务', value: 58, color: '#3B82F6' },
      { name: '换电服务', value: 42, color: '#10B981' },
    ],
  },
  month: {
    report: [
      { date: '第1周', totalRevenue: 32000, totalOrders: 520, newMembers: 85, siteUtilization: 65, chargingOrders: 300, swapOrders: 220 },
      { date: '第2周', totalRevenue: 35000, totalOrders: 580, newMembers: 92, siteUtilization: 68, chargingOrders: 340, swapOrders: 240 },
      { date: '第3周', totalRevenue: 38000, totalOrders: 620, newMembers: 98, siteUtilization: 72, chargingOrders: 360, swapOrders: 260 },
      { date: '第4周', totalRevenue: 42000, totalOrders: 680, newMembers: 105, siteUtilization: 75, chargingOrders: 400, swapOrders: 280 },
    ],
    utilization: [
      { name: '中关村', utilization: 75 },
      { name: '望京', utilization: 82 },
      { name: '亦庄', utilization: 60 },
      { name: '海淀', utilization: 70 },
      { name: '通州', utilization: 65 },
      { name: '昌平', utilization: 55 },
      { name: '丰台', utilization: 88 },
      { name: '大兴', utilization: 58 },
    ],
    revenueType: [
      { name: '充电服务', value: 55, color: '#3B82F6' },
      { name: '换电服务', value: 45, color: '#10B981' },
    ],
  },
};

export default function BusinessReports() {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  const currentData = useMemo(() => dataByRange[timeRange], [timeRange]);

  const summaryStats = useMemo(() => {
    const data = currentData.report;
    const totalRevenue = data.reduce((sum, d) => sum + d.totalRevenue, 0);
    const totalOrders = data.reduce((sum, d) => sum + d.totalOrders, 0);
    const totalNewMembers = data.reduce((sum, d) => sum + d.newMembers, 0);
    const avgUtilization = Math.round(data.reduce((sum, d) => sum + d.siteUtilization, 0) / data.length);
    const avgOrderValue = Math.round(totalRevenue / totalOrders);
    return { totalRevenue, totalOrders, totalNewMembers, avgUtilization, avgOrderValue };
  }, [currentData]);

  const siteUtilizationData = currentData.utilization;
  const revenueByType = currentData.revenueType;

  const averageRating = useMemo(() => {
    return (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">经营报表</h1>
          <p className="text-slate-500 mt-1">查看平台运营数据和统计分析</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as 'day' | 'week' | 'month')}
              className="text-sm text-slate-700 focus:outline-none bg-transparent"
            >
              <option value="day">今日</option>
              <option value="week">本周</option>
              <option value="month">本月</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-200 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            导出报表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">+12.5%</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(summaryStats.totalRevenue)}</p>
          <p className="text-xs text-blue-100 mt-1">总营收</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">+8.3%</span>
          </div>
          <p className="text-2xl font-bold">{summaryStats.totalOrders}</p>
          <p className="text-xs text-emerald-100 mt-1">总订单数</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">+15.2%</span>
          </div>
          <p className="text-2xl font-bold">{summaryStats.totalNewMembers}</p>
          <p className="text-xs text-purple-100 mt-1">新增会员</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">+5.8%</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(summaryStats.avgOrderValue)}</p>
          <p className="text-xs text-amber-100 mt-1">客单价</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <BatteryCharging className="w-5 h-5" />
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">+3.1%</span>
          </div>
          <p className="text-2xl font-bold">{summaryStats.avgUtilization}%</p>
          <p className="text-xs text-cyan-100 mt-1">站点利用率</p>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Star className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold">{averageRating}</p>
          <p className="text-xs text-pink-100 mt-1">用户评分</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">营收趋势</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData.report}>
                <defs>
                  <linearGradient id="colorRevenue2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="totalRevenue"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue2)"
                  name="营收"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">服务类型占比</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {revenueByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">站点利用率</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={siteUtilizationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" unit="%" />
                <Tooltip />
                <Bar dataKey="utilization" fill="#10B981" radius={[4, 4, 0, 0]} name="利用率" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">订单量趋势</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentData.report}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <Tooltip />
                <Line type="monotone" dataKey="chargingOrders" stroke="#3B82F6" strokeWidth={2} dot={false} name="充电" />
                <Line type="monotone" dataKey="swapOrders" stroke="#10B981" strokeWidth={2} dot={false} name="换电" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            客户评价
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {review.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">{review.userName}</span>
                      <span className="text-xs text-slate-500">{review.siteName}</span>
                      <span className="text-xs text-slate-400">{formatDate(review.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 mt-2">{review.content}</p>
                    {review.reply && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs font-medium text-blue-700 mb-1">官方回复</p>
                        <p className="text-sm text-blue-800">{review.reply}</p>
                      </div>
                    )}
                  </div>
                </div>
                {!review.reply && (
                  <button className="text-xs text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    回复
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
