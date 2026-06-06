import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Zap, BatteryCharging, AlertTriangle, CheckCircle, XCircle, Clock, Wrench, Search } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useAppStore } from '@/store';
import { getStatusText, getStatusColor } from '@/utils/format';
import type { Device } from '@/types';

export default function DeviceStatus() {
  const navigate = useNavigate();
  const { devices, addTicket, updateDeviceStatus } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [repairMessage, setRepairMessage] = useState('');

  const stats = useMemo(() => {
    const total = devices.length;
    const online = devices.filter(d => d.status === 'online').length;
    const inUse = devices.filter(d => d.status === 'in-use').length;
    const fault = devices.filter(d => d.status === 'fault').length;
    const offline = devices.filter(d => d.status === 'offline').length;
    return { total, online, inUse, fault, offline };
  }, [devices]);

  const handleRepair = (device: Device) => {
    addTicket({
      siteId: device.siteId,
      siteName: device.siteName,
      deviceId: device.id,
      deviceName: device.name,
      type: 'device-fault',
      priority: 'high',
      title: `${device.name} 故障报修`,
      description: `设备型号：${device.model}，请尽快安排维修人员处理`,
      reporter: '系统自动',
    });
    updateDeviceStatus(device.id, 'fault');
    setRepairMessage(`已为 ${device.name} 创建报修工单`);
    setTimeout(() => {
      setRepairMessage('');
      navigate('/tickets');
    }, 1500);
  };

  const pieData = useMemo(() => [
    { name: '在线', value: stats.online, color: '#10B981' },
    { name: '使用中', value: stats.inUse, color: '#3B82F6' },
    { name: '故障', value: stats.fault, color: '#EF4444' },
    { name: '离线', value: stats.offline, color: '#6B7280' },
  ], [stats]);

  const filteredDevices = devices.filter((device) => {
    const matchesSearch = device.name.includes(searchQuery) || 
                          device.siteName.includes(searchQuery) ||
                          device.model.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
    const matchesType = typeFilter === 'all' || device.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const faultDevices = devices.filter(d => d.status === 'fault');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">设备状态</h1>
          <p className="text-slate-500 mt-1">实时监控所有站点设备运行状态</p>
        </div>
        {repairMessage && (
          <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {repairMessage}
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-sm text-slate-500 mt-1">设备总数</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.online}</p>
          <p className="text-sm text-slate-500 mt-1">在线设备</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.inUse}</p>
          <p className="text-sm text-slate-500 mt-1">使用中</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600">{stats.fault}</p>
          <p className="text-sm text-slate-500 mt-1">故障设备</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-slate-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-600">{stats.offline}</p>
          <p className="text-sm text-slate-500 mt-1">离线设备</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">设备状态分布</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">故障告警</h3>
          <div className="space-y-3">
            {faultDevices.length > 0 ? (
              faultDevices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800">{device.name}</p>
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                        故障
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {device.siteName} · {device.model}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleRepair(device)}
                    className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                  >
                    <Wrench className="w-4 h-4" />
                    报修
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>暂无故障设备</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">设备列表</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索设备..."
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
              <option value="charger">充电桩</option>
              <option value="battery-cabinet">换电柜</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部状态</option>
              <option value="online">在线</option>
              <option value="in-use">使用中</option>
              <option value="fault">故障</option>
              <option value="offline">离线</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">设备信息</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">所属站点</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">类型</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">状态</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">功率/电池数</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">上次维护</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredDevices.map((device) => (
                <tr key={device.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        device.type === 'charger' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {device.type === 'charger' ? (
                          <Zap className="w-5 h-5 text-blue-600" />
                        ) : (
                          <BatteryCharging className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{device.name}</p>
                        <p className="text-xs text-slate-500">{device.model}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{device.siteName}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${device.type === 'charger' ? 'text-blue-600' : 'text-green-600'}`}>
                      {device.type === 'charger' ? '充电桩' : '换电柜'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                      {getStatusText(device.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {device.power ? `${device.power} kW` : `${device.currentBattery} 块`}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Clock className="w-4 h-4" />
                      {device.lastMaintenance}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">详情</button>
                      {device.status === 'fault' && (
                        <button 
                          onClick={() => handleRepair(device)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >报修</button>
                      )}
                    </div>
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
