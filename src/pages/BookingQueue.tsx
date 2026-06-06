import { useState, useEffect, useMemo } from 'react';
import { CalendarClock, User, MapPin, Clock, QrCode, X, Check, ChevronRight, Plus, Search, Filter, Calendar, UserX } from 'lucide-react';
import { useAppStore } from '@/store';
import { sites } from '@/data/sites';
import { getStatusText, getStatusColor, getServiceTypeText, formatDateTime } from '@/utils/format';
import type { Booking } from '@/types';

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
];

const MAX_BOOKINGS_PER_SLOT = 3;

export default function BookingQueue() {
  const {
    bookings,
    preselectedBookingSite,
    setPreselectedBookingSite,
    addBooking,
    updateBookingStatus,
    addRecord,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<string>('queue');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('2026-06-07');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    siteId: '',
    siteName: '',
    serviceType: 'charging' as 'charging' | 'battery-swap',
    timeSlot: '',
    userName: '',
    phone: '',
  });

  const slotAvailability = useMemo(() => {
    if (!formData.siteId) return {};
    const siteBookings = bookings.filter(
      b => b.siteId === formData.siteId && 
           b.timeSlot.startsWith(dateFilter) &&
           b.status !== 'cancelled' &&
           b.status !== 'no-show'
    );
    const counts: Record<string, number> = {};
    timeSlots.forEach(slot => {
      counts[slot] = siteBookings.filter(b => b.timeSlot.includes(slot)).length;
    });
    return counts;
  }, [bookings, formData.siteId, dateFilter]);

  useEffect(() => {
    if (preselectedBookingSite) {
      setFormData((prev) => ({
        ...prev,
        siteId: preselectedBookingSite.id,
        siteName: preselectedBookingSite.name,
      }));
      setShowBookingModal(true);
      setPreselectedBookingSite(null);
    }
  }, [preselectedBookingSite, setPreselectedBookingSite]);

  const pendingBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed');
  const inProgressBookings = bookings.filter((b) => b.status === 'in-progress');
  const completedBookings = bookings.filter((b) =>
    ['completed', 'cancelled', 'no-show'].includes(b.status)
  );

  const applyFilters = (list: Booking[]) => {
    return list.filter((b) => {
      const matchesSearch = b.userName.includes(searchQuery) || b.siteName.includes(searchQuery);
      const matchesSite = siteFilter === 'all' || b.siteId === siteFilter;
      const matchesDate = dateFilter === 'all' || b.timeSlot.startsWith(dateFilter);
      const matchesService = serviceTypeFilter === 'all' || b.serviceType === serviceTypeFilter;
      return matchesSearch && matchesSite && matchesDate && matchesService;
    });
  };

  const filteredPending = applyFilters(pendingBookings);
  const filteredInProgress = applyFilters(inProgressBookings);
  const filteredCompleted = applyFilters(completedBookings);

  const handleNoShow = (booking: Booking) => {
    updateBookingStatus(booking.id, 'no-show');
  };

  const handleConfirm = (booking: Booking) => {
    updateBookingStatus(booking.id, 'confirmed');
  };

  const handleCancel = (booking: Booking) => {
    updateBookingStatus(booking.id, 'cancelled');
  };

  const handleVerify = (booking: Booking) => {
    updateBookingStatus(booking.id, 'in-progress');
  };

  const handleComplete = (booking: Booking) => {
    updateBookingStatus(booking.id, 'completed');
    addRecord({
      siteId: booking.siteId,
      siteName: booking.siteName,
      userId: booking.userId,
      userName: booking.userName,
      type: booking.serviceType,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      duration: 30,
      energyDelivered: booking.serviceType === 'charging' ? 25 : undefined,
      batteryBefore: booking.serviceType === 'battery-swap' ? 20 : undefined,
      batteryAfter: booking.serviceType === 'battery-swap' ? 100 : undefined,
      amount: booking.serviceType === 'charging' ? 62.5 : 99,
      status: 'completed',
      settled: false,
      invoiceStatus: 'none',
    });
  };

  const handleSubmitBooking = () => {
    if (!formData.siteId || !formData.timeSlot || !formData.userName || !formData.phone) {
      alert('请填写完整信息');
      return;
    }
    addBooking({
      siteId: formData.siteId,
      siteName: formData.siteName,
      userId: 'user-' + Math.random().toString(36).substring(2, 8),
      userName: formData.userName,
      serviceType: formData.serviceType,
      timeSlot: `2026-06-07 ${formData.timeSlot}`,
      status: 'pending',
    });
    setShowBookingModal(false);
    setFormData({
      siteId: '',
      siteName: '',
      serviceType: 'charging',
      timeSlot: '',
      userName: '',
      phone: '',
    });
  };

  const tabCounts = {
    queue: pendingBookings.length,
    progress: inProgressBookings.length,
    history: completedBookings.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">预约排队</h1>
          <p className="text-slate-500 mt-1">管理预约订单，处理排队队列</p>
        </div>
        <button
          onClick={() => setShowBookingModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建预约
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{pendingBookings.length}</p>
              <p className="text-sm text-slate-500">等待中</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <QrCode className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{inProgressBookings.length}</p>
              <p className="text-sm text-slate-500">进行中</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {bookings.filter((b) => b.status === 'completed').length}
              </p>
              <p className="text-sm text-slate-500">今日完成</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <CalendarClock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{bookings.length}</p>
              <p className="text-sm text-slate-500">今日预约</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600 font-medium">筛选:</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索用户/站点"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
          </div>
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部站点</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={serviceTypeFilter}
            onChange={(e) => setServiceTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部服务</option>
            <option value="charging">充电</option>
            <option value="battery-swap">换电</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex">
                {[
                  { key: 'queue', label: '排队队列' },
                  { key: 'progress', label: '进行中' },
                  { key: 'history', label: '历史记录' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-6 py-2 text-sm font-medium border-b-2 transition-colors relative ${
                      activeTab === tab.key
                        ? 'text-blue-600 border-blue-500'
                        : 'text-slate-600 border-transparent hover:text-slate-800'
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tabCounts[tab.key as keyof typeof tabCounts]}
                    </span>
                  </button>
                ))}
              </div>
              {activeTab === 'queue' && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="搜索用户或站点"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {(activeTab === 'queue'
              ? filteredPending
              : activeTab === 'progress'
              ? filteredInProgress
              : filteredCompleted
            ).map((booking, index) => (
              <div
                key={booking.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        booking.status === 'in-progress'
                          ? 'bg-blue-500'
                          : booking.status === 'completed'
                          ? 'bg-green-500'
                          : booking.status === 'cancelled'
                          ? 'bg-slate-400'
                          : 'bg-orange-500'
                      }`}
                    >
                      {activeTab === 'queue' ? index + 1 : booking.queueNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-800">{booking.userName}</p>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {getStatusText(booking.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {booking.siteName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {booking.timeSlot.split(' ')[1]}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span
                        className={`text-sm font-medium px-2 py-1 rounded ${
                          booking.serviceType === 'charging'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {getServiceTypeText(booking.serviceType)}
                      </span>
                      {booking.estimatedWaitTime > 0 && booking.status === 'pending' && (
                        <p className="text-xs text-orange-600 mt-1">
                          预计等待 {booking.estimatedWaitTime} 分钟
                        </p>
                      )}
                    </div>

                    {booking.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConfirm(booking)}
                          className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                        >
                          确认
                        </button>
                        <button
                          onClick={() => handleCancel(booking)}
                          className="px-3 py-1.5 bg-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {booking.status === 'confirmed' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerify(booking)}
                          className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
                        >
                          <QrCode className="w-4 h-4" />
                          核销
                        </button>
                        <button
                          onClick={() => handleNoShow(booking)}
                          className="px-3 py-1.5 bg-orange-100 text-orange-600 text-sm rounded-lg hover:bg-orange-200 transition-colors flex items-center gap-1"
                          title="标记未到店"
                        >
                          <UserX className="w-4 h-4" />
                          未到
                        </button>
                      </div>
                    )}
                    {booking.status === 'in-progress' && (
                      <button
                        onClick={() => handleComplete(booking)}
                        className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                      >
                        完成
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {(activeTab === 'queue' ? filteredPending : activeTab === 'progress' ? filteredInProgress : filteredCompleted).length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <CalendarClock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无数据</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">今日时段</h3>
          <p className="text-sm text-slate-500 mb-4">2026年6月7日 星期日</p>

          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((slot) => {
              const available = (slotAvailability[slot] || 0) < MAX_BOOKINGS_PER_SLOT;
              return (
                <button
                  key={slot}
                  disabled={!available}
                  className={`py-2.5 px-2 rounded-lg text-sm font-medium transition-all ${
                    available
                      ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  }`}
                >
                  {slot}
                  <span className="block text-xs mt-0.5">{available ? '可预约' : '已满'}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h4 className="font-medium text-blue-800 mb-2">预约须知</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 请提前 15 分钟到站核销</li>
              <li>• 超时 30 分钟未到自动取消</li>
              <li>• 取消需提前 1 小时申请</li>
              <li>• 高峰期可能需要额外等待</li>
            </ul>
          </div>
        </div>
      </div>

      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">新建预约</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">选择站点</label>
                <select
                  value={formData.siteId}
                  onChange={(e) => {
                    const site = sites.find((s) => s.id === e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      siteId: e.target.value,
                      siteName: site?.name || '',
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
                <label className="block text-sm font-medium text-slate-700 mb-2">服务类型</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFormData((prev) => ({ ...prev, serviceType: 'charging' }))}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium border-2 transition-all ${
                      formData.serviceType === 'charging'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    充电服务
                  </button>
                  <button
                    onClick={() => setFormData((prev) => ({ ...prev, serviceType: 'battery-swap' }))}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium border-2 transition-all ${
                      formData.serviceType === 'battery-swap'
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    换电服务
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  选择时段
                  {formData.siteId && (
                    <span className="text-xs text-slate-400 ml-2">（每时段限 {MAX_BOOKINGS_PER_SLOT} 个预约）</span>
                  )}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.slice(0, 8).map((slot) => {
                    const booked = slotAvailability[slot] || 0;
                    const isFull = booked >= MAX_BOOKINGS_PER_SLOT;
                    const remaining = MAX_BOOKINGS_PER_SLOT - booked;
                    return (
                      <button
                        key={slot}
                        onClick={() => !isFull && setFormData((prev) => ({ ...prev, timeSlot: slot }))}
                        disabled={isFull || !formData.siteId}
                        className={`py-2 px-2 rounded-lg text-xs border-2 transition-all relative ${
                          formData.timeSlot === slot
                            ? 'bg-blue-500 text-white border-blue-500'
                            : isFull || !formData.siteId
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-50 border-slate-200 hover:bg-blue-50 hover:border-blue-300'
                        }`}
                      >
                        <div>{slot}</div>
                        {formData.siteId && (
                          <div className={`text-xs mt-0.5 ${
                            formData.timeSlot === slot ? 'text-blue-100' : isFull ? 'text-red-400' : 'text-slate-400'
                          }`}>
                            {isFull ? '已满' : `剩${remaining}`}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">联系人</label>
                <input
                  type="text"
                  placeholder="请输入姓名"
                  value={formData.userName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, userName: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">联系电话</label>
                <input
                  type="tel"
                  placeholder="请输入手机号"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmitBooking}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                确认预约
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
