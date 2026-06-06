import { useState, useMemo } from 'react';
import { AlertTriangle, Clock, User, MapPin, Wrench, Search, Plus, Filter, ChevronRight, XCircle, CheckCircle, AlertCircle, X, MessageSquare } from 'lucide-react';
import { useAppStore } from '@/store';
import { sites } from '@/data/sites';
import { devices } from '@/data/devices';
import { getStatusText, getStatusColor, getPriorityText, getPriorityColor, getTicketTypeText, formatDateTime } from '@/utils/format';
import type { Ticket } from '@/types';

const PROCESSORS = ['张工', '李工', '王工', '赵工', '刘工'];

export default function ExceptionTickets() {
  const { tickets, addTicket, updateTicketStatus, assignTicket, addProcessNote, resolveTicket } = useAppStore();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedProcessor, setSelectedProcessor] = useState('');
  const [processNote, setProcessNote] = useState('');
  const [resolution, setResolution] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    siteId: '',
    siteName: '',
    priority: 'medium' as Ticket['priority'],
    type: 'device-fault' as Ticket['type'],
    deviceId: '',
    deviceName: '',
    description: '',
    reporter: '',
  });

  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === 'open').length;
    const processing = tickets.filter((t) => t.status === 'processing').length;
    const resolved = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;
    const urgent = tickets.filter((t) => t.priority === 'urgent').length;
    return { total, open, processing, resolved, urgent };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        ticket.title.includes(searchQuery) ||
        ticket.siteName.includes(searchQuery) ||
        ticket.description.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter]);

  const groupedTickets = useMemo(() => {
    return {
      open: filteredTickets.filter((t) => t.status === 'open'),
      processing: filteredTickets.filter((t) => t.status === 'processing'),
      resolved: filteredTickets.filter((t) => t.status === 'resolved' || t.status === 'closed'),
    };
  }, [filteredTickets]);

  const handleAssign = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setSelectedProcessor('');
    setShowAssignModal(true);
  };

  const handleConfirmAssign = () => {
    if (!selectedProcessor || !selectedTicket) return;
    assignTicket(selectedTicket.id, selectedProcessor);
    updateTicketStatus(selectedTicket.id, 'processing');
    setShowAssignModal(false);
    setSelectedTicket(null);
  };

  const handleAddNote = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setProcessNote('');
    setShowNoteModal(true);
  };

  const handleConfirmNote = () => {
    if (!processNote || !selectedTicket) return;
    addProcessNote(selectedTicket.id, processNote);
    setShowNoteModal(false);
    setSelectedTicket(null);
    setProcessNote('');
  };

  const handleResolve = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setResolution('');
    setShowResolveModal(true);
  };

  const handleViewDetail = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowDetailModal(true);
  };

  const handleConfirmResolve = () => {
    if (!resolution || !selectedTicket) return;
    resolveTicket(selectedTicket.id, resolution);
    setShowResolveModal(false);
    setSelectedTicket(null);
    setResolution('');
  };

  const handleSubmitTicket = () => {
    if (!formData.title || !formData.siteId || !formData.reporter) {
      alert('请填写必填信息');
      return;
    }
    addTicket({
      siteId: formData.siteId,
      siteName: formData.siteName,
      deviceId: formData.deviceId || undefined,
      deviceName: formData.deviceName || undefined,
      type: formData.type,
      priority: formData.priority,
      title: formData.title,
      description: formData.description,
      reporter: formData.reporter,
    });
    setShowCreateModal(false);
    setFormData({
      title: '',
      siteId: '',
      siteName: '',
      priority: 'medium',
      type: 'device-fault',
      deviceId: '',
      deviceName: '',
      description: '',
      reporter: '',
    });
  };

  const siteDevices = devices.filter((d) => d.siteId === formData.siteId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">异常工单</h1>
          <p className="text-slate-500 mt-1">处理设备故障和异常情况</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          创建工单
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-xs text-slate-500 mt-1">工单总数</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.open}</p>
          <p className="text-xs text-slate-500 mt-1">待处理</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.processing}</p>
          <p className="text-xs text-slate-500 mt-1">处理中</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
          <p className="text-xs text-slate-500 mt-1">已解决</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.urgent}</p>
          <p className="text-xs text-slate-500 mt-1">紧急工单</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索工单..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部状态</option>
              <option value="open">待处理</option>
              <option value="processing">处理中</option>
              <option value="resolved">已解决</option>
              <option value="closed">已关闭</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部优先级</option>
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
              <option value="urgent">紧急</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-red-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                待处理
              </h3>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                {groupedTickets.open.length}
              </span>
            </div>
          </div>
          <div className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
            {groupedTickets.open.map((ticket) => (
              <div
                key={ticket.id}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-red-300 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-slate-800 text-sm">{ticket.title}</h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                      ticket.priority
                    )}`}
                  >
                    {getPriorityText(ticket.priority)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2 line-clamp-2">{ticket.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {ticket.siteName}
                  </span>
                  <span>{formatDateTime(ticket.createdAt)}</span>
                </div>
                {ticket.deviceName && (
                  <div className="text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Wrench className="w-3 h-3" />
                      {ticket.deviceName}
                    </span>
                  </div>
                )}
                <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                  <button
                    onClick={() => handleViewDetail(ticket)}
                    className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                  >
                    详情
                  </button>
                  <button
                    onClick={() => handleAssign(ticket)}
                    className="text-xs text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1"
                  >
                    派工
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
            {groupedTickets.open.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无待处理工单</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-yellow-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                处理中
              </h3>
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                {groupedTickets.processing.length}
              </span>
            </div>
          </div>
          <div className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
            {groupedTickets.processing.map((ticket) => (
              <div
                key={ticket.id}
                className="p-3 bg-slate-50 rounded-lg border border-yellow-200 hover:border-yellow-400 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-slate-800 text-sm">{ticket.title}</h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                      ticket.priority
                    )}`}
                  >
                    {getPriorityText(ticket.priority)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2 line-clamp-2">{ticket.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {ticket.assignee || '待分配'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {ticket.siteName}
                  </span>
                </div>
                {ticket.deviceName && (
                  <div className="text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Wrench className="w-3 h-3" />
                      {ticket.deviceName}
                    </span>
                  </div>
                )}
                {ticket.lastProcessedAt && (
                  <div className="text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      最近处理: {formatDateTime(ticket.lastProcessedAt)}
                    </span>
                  </div>
                )}
                <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleViewDetail(ticket)}
                    className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                  >
                    详情
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddNote(ticket)}
                      className="text-xs text-slate-600 font-medium hover:text-slate-800 flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      备注
                    </button>
                    <button
                      onClick={() => handleResolve(ticket)}
                      className="text-xs text-green-600 font-medium hover:text-green-700 flex items-center gap-1"
                    >
                      完成
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {groupedTickets.processing.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无处理中工单</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-green-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                已解决
              </h3>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                {groupedTickets.resolved.length}
              </span>
            </div>
          </div>
          <div className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
            {groupedTickets.resolved.map((ticket) => (
              <div
                key={ticket.id}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200 opacity-80 hover:opacity-100 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-slate-600 text-sm line-through">{ticket.title}</h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      ticket.status
                    )}`}
                  >
                    {getStatusText(ticket.status)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-2 line-clamp-2">{ticket.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {ticket.siteName}
                  </span>
                  <span>{ticket.resolvedAt && formatDateTime(ticket.resolvedAt)}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-400">类型: {getTicketTypeText(ticket.type)}</span>
                  <button 
                    onClick={() => handleViewDetail(ticket)}
                    className="text-xs text-slate-600 font-medium hover:text-slate-800"
                  >
                    查看
                  </button>
                </div>
              </div>
            ))}
            {groupedTickets.resolved.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无已解决工单</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">创建工单</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">工单标题 *</label>
                <input
                  type="text"
                  placeholder="请输入工单标题"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">选择站点 *</label>
                  <select
                    value={formData.siteId}
                    onChange={(e) => {
                      const site = sites.find((s) => s.id === e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        siteId: e.target.value,
                        siteName: site?.name || '',
                        deviceId: '',
                        deviceName: '',
                      }));
                    }}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">请选择站点</option>
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">优先级</label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, priority: e.target.value as Ticket['priority'] }))
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                    <option value="urgent">紧急</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">工单类型</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, type: e.target.value as Ticket['type'] }))
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="device-fault">设备故障</option>
                    <option value="battery-issue">电池问题</option>
                    <option value="timeout-occupancy">超时占位</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">关联设备</label>
                  <select
                    value={formData.deviceId}
                    onChange={(e) => {
                      const device = siteDevices.find((d) => d.id === e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        deviceId: e.target.value,
                        deviceName: device?.name || '',
                      }));
                    }}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">无</option>
                    {siteDevices.map((device) => (
                      <option key={device.id} value={device.id}>
                        {device.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">问题描述</label>
                <textarea
                  rows={4}
                  placeholder="请详细描述问题..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">上报人 *</label>
                <input
                  type="text"
                  placeholder="请输入上报人姓名"
                  value={formData.reporter}
                  onChange={(e) => setFormData((prev) => ({ ...prev, reporter: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmitTicket}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                提交工单
              </button>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">分配处理人</h3>
              <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <div className="p-4 bg-blue-50 rounded-xl mb-4">
                <p className="text-sm text-slate-500 mb-1">工单标题</p>
                <p className="font-medium text-slate-800">{selectedTicket.title}</p>
              </div>
              <label className="block text-sm font-medium text-slate-700 mb-2">选择处理人</label>
              <select
                value={selectedProcessor}
                onChange={(e) => setSelectedProcessor(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">请选择处理人</option>
                {PROCESSORS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200"
              >
                取消
              </button>
              <button
                onClick={handleConfirmAssign}
                disabled={!selectedProcessor}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                确认派工
              </button>
            </div>
          </div>
        </div>
      )}

      {showNoteModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">追加处理备注</h3>
              <button onClick={() => setShowNoteModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">备注内容</label>
              <textarea
                rows={4}
                value={processNote}
                onChange={(e) => setProcessNote(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="请输入处理进展或备注..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNoteModal(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200"
              >
                取消
              </button>
              <button
                onClick={handleConfirmNote}
                disabled={!processNote}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                确认提交
              </button>
            </div>
          </div>
        </div>
      )}

      {showResolveModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">工单解决</h3>
              <button onClick={() => setShowResolveModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <div className="p-4 bg-green-50 rounded-xl mb-4">
                <p className="text-sm text-slate-500 mb-1">工单标题</p>
                <p className="font-medium text-slate-800">{selectedTicket.title}</p>
              </div>
              <label className="block text-sm font-medium text-slate-700 mb-2">解决说明</label>
              <textarea
                rows={4}
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                placeholder="请描述问题的解决方案..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResolveModal(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200"
              >
                取消
              </button>
              <button
                onClick={handleConfirmResolve}
                disabled={!resolution}
                className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                确认完成
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">工单详情</h3>
                <p className="text-sm text-slate-500">#{selectedTicket.id}</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-800">{selectedTicket.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                    {getPriorityText(selectedTicket.priority)}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-3">{selectedTicket.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {selectedTicket.siteName}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    上报人: {selectedTicket.reporter}
                  </div>
                  {selectedTicket.assignee && (
                    <div className="flex items-center gap-1">
                      <Wrench className="w-3 h-3" />
                      处理人: {selectedTicket.assignee}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(selectedTicket.createdAt)}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  处理记录
                </h4>
                <div className="space-y-3">
                  {(selectedTicket.processLog || []).length > 0 ? (
                    (selectedTicket.processLog || []).map((log) => (
                      <div key={log.id} className="flex gap-3">
                        <div className="relative">
                          <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${
                            log.type === 'assign' ? 'bg-blue-500' :
                            log.type === 'note' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`} />
                          <div className="absolute top-4 left-1 w-px h-full bg-slate-200" />
                        </div>
                        <div className="flex-1 pb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-slate-700">
                              {log.type === 'assign' ? '派工' : log.type === 'note' ? '处理备注' : '问题解决'}
                            </span>
                            <span className="text-xs text-slate-400">{log.createdAt}</span>
                          </div>
                          <p className="text-sm text-slate-600">{log.content}</p>
                          <p className="text-xs text-slate-400 mt-1">操作人: {log.operator}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">暂无处理记录</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
