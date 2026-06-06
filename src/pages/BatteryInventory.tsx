import { useState, useMemo } from 'react';
import { Battery, BatteryCharging, Activity, RefreshCw, Search, Filter, Plus, BarChart3, AlertTriangle, X, Save, History, Clock, User } from 'lucide-react';
import { useAppStore } from '@/store';
import { getStatusText, getStatusColor, formatCapacity, formatPercent, formatDateTime } from '@/utils/format';
import type { Battery as BatteryType, BatteryLog } from '@/types';

export default function BatteryInventory() {
  const {
    batteries,
    lastInventoryTime,
    addBattery,
    updateBatteryStatus,
    updateInventoryTime,
    batteryLogs,
  } = useAppStore();
  const [showLogDrawer, setShowLogDrawer] = useState(false);
  const [selectedBatteryForLog, setSelectedBatteryForLog] = useState<BatteryType | null>(null);

  const batteryLogsForSelected = useMemo(() => 
    selectedBatteryForLog ? batteryLogs.filter(l => l.batteryId === selectedBatteryForLog.id) : [],
    [batteryLogs, selectedBatteryForLog]
  );

  const handleViewLogs = (battery: BatteryType) => {
    setSelectedBatteryForLog(battery);
    setShowLogDrawer(true);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'all' | 'abnormal'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedBattery, setSelectedBattery] = useState<BatteryType | null>(null);
  const [swapCode, setSwapCode] = useState('');
  const [inventoryMessage, setInventoryMessage] = useState('');

  const [newBattery, setNewBattery] = useState({
    serialNumber: '',
    model: 'TB-48S',
    capacity: 4500,
    currentLevel: 100,
    healthStatus: 100,
    siteId: 'site-1',
    location: '中关村智能补能站-A柜',
  });

  const stats = useMemo(() => {
    const total = batteries.length;
    const available = batteries.filter((b) => b.status === 'available').length;
    const charging = batteries.filter((b) => b.status === 'charging').length;
    const inUse = batteries.filter((b) => b.status === 'in-use').length;
    const maintenance = batteries.filter((b) => b.status === 'maintenance').length;
    const avgHealth = total > 0 ? Math.round(batteries.reduce((sum, b) => sum + b.healthStatus, 0) / total) : 0;
    return { total, available, charging, inUse, maintenance, avgHealth };
  }, [batteries]);

  const models = useMemo(() => {
    return [...new Set(batteries.map((b) => b.model))];
  }, [batteries]);

  const filteredBatteries = batteries.filter((battery) => {
    const matchesSearch =
      battery.serialNumber.includes(searchQuery) ||
      battery.model.includes(searchQuery) ||
      battery.location.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || battery.status === statusFilter;
    const matchesModel = modelFilter === 'all' || battery.model === modelFilter;
    return matchesSearch && matchesStatus && matchesModel;
  });

  const lowHealthBatteries = batteries.filter((b) => b.healthStatus < 85);

  const modelStats = useMemo(() => {
    return models.map((model) => {
      const modelBatteries = batteries.filter((b) => b.model === model);
      return {
        model,
        total: modelBatteries.length,
        available: modelBatteries.filter((b) => b.status === 'available').length,
        avgHealth:
          modelBatteries.length > 0
            ? Math.round(modelBatteries.reduce((sum, b) => sum + b.healthStatus, 0) / modelBatteries.length)
            : 0,
      };
    });
  }, [models, batteries]);

  const abnormalBatteries = useMemo(() => 
    batteries.filter((b) => {
      const lastInventory = batteryLogs
        .filter(l => l.batteryId === b.id && l.type === 'inventory')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      const daysSinceInventory = lastInventory 
        ? Math.floor((new Date('2026-06-07').getTime() - new Date(lastInventory.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      return (
        b.healthStatus < 85 || 
        b.status === 'maintenance' ||
        b.cycleCount > 300 ||
        daysSinceInventory > 7
      );
    }), [batteries, batteryLogs]);

  const getAbnormalReasons = (battery: BatteryType) => {
    const reasons: string[] = [];
    if (battery.healthStatus < 85) reasons.push(`健康度过低 (${battery.healthStatus}%)`);
    if (battery.status === 'maintenance') reasons.push('维护中');
    if (battery.cycleCount > 300) reasons.push(`循环次数过高 (${battery.cycleCount}次)`);
    const lastInventory = batteryLogs
      .filter(l => l.batteryId === battery.id && l.type === 'inventory')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    const daysSinceInventory = lastInventory 
      ? Math.floor((new Date('2026-06-07').getTime() - new Date(lastInventory.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    if (daysSinceInventory > 7) reasons.push(`长时间未盘点 (${daysSinceInventory}天)`);
    return reasons;
  };

  const displayBatteries = viewMode === 'abnormal' ? abnormalBatteries : filteredBatteries;

  const handleInventory = () => {
    updateInventoryTime();
    setInventoryMessage('盘点完成，库存已更新');
    setTimeout(() => setInventoryMessage(''), 3000);
  };

  const handleAddBattery = () => {
    if (!newBattery.serialNumber) {
      alert('请输入电池编号');
      return;
    }
    addBattery({
      serialNumber: newBattery.serialNumber,
      model: newBattery.model,
      capacity: newBattery.capacity,
      currentLevel: newBattery.currentLevel,
      healthStatus: newBattery.healthStatus,
      status: 'available',
      siteId: newBattery.siteId,
      location: newBattery.location,
    });
    setShowAddModal(false);
    setNewBattery({
      serialNumber: '',
      model: 'TB-48S',
      capacity: 4500,
      currentLevel: 100,
      healthStatus: 100,
      siteId: 'site-1',
      location: '中关村智能补能站-A柜',
    });
  };

  const handleSwap = (battery: BatteryType) => {
    setSelectedBattery(battery);
    setSwapCode('');
    setShowSwapModal(true);
  };

  const handleConfirmSwap = () => {
    if (!swapCode) {
      alert('请输入换电编号');
      return;
    }
    if (selectedBattery) {
      updateBatteryStatus(selectedBattery.id, 'in-use', swapCode);
    }
    setShowSwapModal(false);
    setSelectedBattery(null);
    setSwapCode('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">电池库存</h1>
          <p className="text-slate-500 mt-1">
            管理电池库存，追踪电池状态
            {lastInventoryTime && (
              <span className="ml-4 text-xs text-slate-400">上次盘点：{lastInventoryTime}</span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          {inventoryMessage && (
            <span className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center gap-1">
              <Save className="w-4 h-4" />
              {inventoryMessage}
            </span>
          )}
          <button
            onClick={handleInventory}
            className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-200 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            盘点
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            入库
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          全部电池
        </button>
        <button
          onClick={() => setViewMode('abnormal')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            viewMode === 'abnormal'
              ? 'bg-orange-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          异常电池
          {abnormalBatteries.length > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
              viewMode === 'abnormal' ? 'bg-white/20' : 'bg-orange-100 text-orange-700'
            }`}>
              {abnormalBatteries.length}
            </span>
          )}
        </button>
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
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
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
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                    电池编号
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                    型号
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                    容量
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                    电量
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                    健康度
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                    状态
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                    位置
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                    循环次数
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {displayBatteries.map((battery) => (
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
                              battery.currentLevel >= 80
                                ? 'bg-green-500'
                                : battery.currentLevel >= 30
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${battery.currentLevel}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-600">{battery.currentLevel}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm font-medium ${
                          battery.healthStatus >= 90
                            ? 'text-green-600'
                            : battery.healthStatus >= 75
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {battery.healthStatus}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          battery.status
                        )}`}
                      >
                        {getStatusText(battery.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{battery.location}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{battery.cycleCount} 次</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewLogs(battery)}
                          className="text-slate-600 hover:text-slate-800 text-sm font-medium flex items-center gap-1"
                        >
                          <History className="w-3.5 h-3.5" />
                          记录
                        </button>
                        {battery.status === 'available' && (
                          <button
                            onClick={() => handleSwap(battery)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            换电
                          </button>
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
                    <span className="text-sm text-slate-500">
                      {stat.available}/{stat.total} 可用
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${stat.total > 0 ? (stat.available / stat.total) * 100 : 0}%` }}
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
              {lowHealthBatteries.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">暂无需要关注的电池</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">电池入库</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">电池编号</label>
                <input
                  type="text"
                  placeholder="例如：BAT-2026-0016"
                  value={newBattery.serialNumber}
                  onChange={(e) => setNewBattery((prev) => ({ ...prev, serialNumber: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">型号</label>
                  <select
                    value={newBattery.model}
                    onChange={(e) => setNewBattery((prev) => ({ ...prev, model: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TB-48S">TB-48S</option>
                    <option value="TB-48">TB-48</option>
                    <option value="TB-50">TB-50</option>
                    <option value="TB-55">TB-55</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">容量 (mAh)</label>
                  <input
                    type="number"
                    value={newBattery.capacity}
                    onChange={(e) =>
                      setNewBattery((prev) => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">当前电量 (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newBattery.currentLevel}
                    onChange={(e) =>
                      setNewBattery((prev) => ({ ...prev, currentLevel: parseInt(e.target.value) || 0 }))
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">健康度 (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newBattery.healthStatus}
                    onChange={(e) =>
                      setNewBattery((prev) => ({ ...prev, healthStatus: parseInt(e.target.value) || 0 }))
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">存放位置</label>
                <input
                  type="text"
                  value={newBattery.location}
                  onChange={(e) => setNewBattery((prev) => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddBattery}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                确认入库
              </button>
            </div>
          </div>
        </div>
      )}

      {showSwapModal && selectedBattery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">电池换电</h3>
              <button
                onClick={() => {
                  setShowSwapModal(false);
                  setSelectedBattery(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">选中电池</p>
                <p className="font-mono font-semibold text-slate-800">{selectedBattery.serialNumber}</p>
                <p className="text-sm text-slate-600 mt-1">
                  {selectedBattery.model} | {formatCapacity(selectedBattery.capacity)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">换电编号</label>
                <input
                  type="text"
                  placeholder="请输入或扫描换电编号"
                  value={swapCode}
                  onChange={(e) => setSwapCode(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-400 mt-2">换电编号用于追踪电池流转，例如：SW-20260607-001</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSwapModal(false);
                  setSelectedBattery(null);
                }}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmSwap}
                className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                确认绑定
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogDrawer && selectedBatteryForLog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-bold text-slate-800">电池流转记录</h3>
                <p className="text-sm text-slate-500">{selectedBatteryForLog.serialNumber}</p>
              </div>
              <button onClick={() => setShowLogDrawer(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {getAbnormalReasons(selectedBatteryForLog).length > 0 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-xs font-medium text-orange-800 mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    异常原因
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {getAbnormalReasons(selectedBatteryForLog).map((reason, i) => (
                      <span key={i} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {batteryLogsForSelected.length > 0 ? (
                batteryLogsForSelected.map((log) => (
                  <div key={log.id} className="flex gap-4">
                    <div className="relative">
                      <div className={`w-3 h-3 rounded-full mt-1.5 ${
                        log.type === 'stock-in' ? 'bg-green-500' :
                        log.type === 'swap' ? 'bg-blue-500' :
                        log.type === 'inventory' ? 'bg-yellow-500' :
                        'bg-slate-400'
                      }`} />
                      <div className="absolute top-4 left-1.5 w-px h-full bg-slate-200" />
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-800">{log.description}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {log.createdAt}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {log.operator}
                        </span>
                      </div>
                      {log.relatedId && (
                        <p className="text-xs text-blue-600 mt-1">关联编号: {log.relatedId}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无流转记录</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
