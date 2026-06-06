import { useState, useMemo } from 'react';
import { Battery, BatteryCharging, Activity, RefreshCw, Search, Filter, Plus, BarChart3, AlertTriangle } from 'lucide-react';
import { batteries } from '@/data/batteries';
import { getStatusText, getStatusColor, formatCapacity, formatPercent, formatDateTime } from '@/utils/format';

export default function BatteryInventory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modelFilter, setModelFilter] = useState<string>('all');

  const stats = useMemo(() => {
    const total = batteries.length;
    const available = batteries.filter(b => b.status === 'available').length;
    const charging = batteries.filter(b => b.status === 'charging').length;
    const inUse = batteries.filter(b => b.status === 'in-use').length;
    const maintenance = batteries.filter(b => b.status === 'maintenance').length;
    const avgHealth = Math.round(batteries.reduce((sum, b) => sum + b.healthStatus, 0) / total);
    return { total, available, charging, inUse, maintenance, avgHealth };
  }, []);

  const models = useMemo(() => {
    return [...new Set(batteries.map(b => b.model))];
  }, []);

  const filteredBatteries = batteries.filter((battery) => {
    const matchesSearch = battery.serialNumber.includes(searchQuery) || 
                          battery.model.includes(searchQuery) ||
                          battery.location.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || battery.status === statusFilter;
    const matchesModel = modelFilter === 'all' || battery.model === modelFilter;
    return matchesSearch && matchesStatus && matchesModel;
  });

  const modelStats = useMemo(() => {
    return models.map(model => {
      const modelBatteries = batteries.filter(b => b.model === model);
      return {
        model,
        total: modelBatteries.length,
        available: modelBatteries.filter(b => b.status === 'available').length,
        avgHealth: Math.round(modelBatteries.reduce((sum, b) => sum + b.healthStatus, 0) / modelBatteries.length)
      };
    });
  }, [models]);

  const lowHealthBatteries = batteries.filter(b => b.healthStatus < 85);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">电池库存</h1>
          <p className="text-slate-500 mt-1">管理电池库存，追踪电池状态</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-200 transition-colors flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            盘点
          </button>
          <button className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            入库
          </button>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Battery className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-xs text-slate-500 mt-1">电池总数</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <BatteryCharging className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.available}</p>
          <p className="text-xs text-slate-500 mt-1">可用电池</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.charging}</p>
          <p className="text-xs text-slate-500 mt-1">充电中</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Battery className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.inUse}</p>
          <p className="text-xs text-slate-500 mt-1">使用中</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.maintenance}</p>
          <p className="text-xs text-slate-500 mt-1">维护中</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats.avgHealth}%</p>
          <p className="text-xs text-slate-500 mt-1">平均健康度</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">电池列表</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索编号/型号..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部型号</option>
                {models.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部状态</option>
                <option value="available">可用</option>
                <option value="charging">充电中</option>
                <option value="in-use">使用中</option>
                <option value="maintenance">维护中</option>
                <option value="retired">已报废</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">电池编号</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">型号</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">容量</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">电量</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">健康度</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">状态</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">位置</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">循环次数</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredBatteries.map((battery) => (
                  <tr key={battery.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-slate-700">{battery.serialNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-800">{battery.model}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatCapacity(battery.capacity)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              battery.currentLevel >= 80 ? 'bg-green-500' :
                              battery.currentLevel >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${battery.currentLevel}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-600">{battery.currentLevel}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${
                        battery.healthStatus >= 90 ? 'text-green-600' :
                        battery.healthStatus >= 75 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {battery.healthStatus}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(battery.status)}`}>
                        {getStatusText(battery.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{battery.location}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{battery.cycleCount} 次</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">详情</button>
                        {battery.status === 'available' && (
                          <button className="text-green-600 hover:text-green-700 text-sm font-medium">换电</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">型号分布</h3>
            <div className="space-y-4">
              {modelStats.map((stat) => (
                <div key={stat.model} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-800">{stat.model}</span>
                    <span className="text-sm text-slate-500">{stat.available}/{stat.total} 可用</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(stat.available / stat.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">平均健康度: {stat.avgHealth}%</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              需关注电池
            </h3>
            <div className="space-y-3">
              {lowHealthBatteries.map((battery) => (
                <div key={battery.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{battery.serialNumber}</p>
                      <p className="text-xs text-slate-500">{battery.model}</p>
                    </div>
                    <span className="text-sm font-bold text-orange-600">{battery.healthStatus}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
