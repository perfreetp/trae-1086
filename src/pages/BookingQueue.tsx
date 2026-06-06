import { useState } from 'react';
import { CalendarClock, User, MapPin, Clock, QrCode, X, Check, ChevronRight, Plus, Search } from 'lucide-react';
import { bookings } from '@/data/bookings';
import { getStatusText, getStatusColor, getServiceTypeText, formatDateTime, formatDuration } from '@/utils/format';

export default function BookingQueue() {
  const [activeTab, setActiveTab] = useState<string>('queue');
  const [showBookingModal, setShowBookingModal] = useState(false);

  const pendingBookings = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');
  const inProgressBookings = bookings.filter(b => b.status === 'in-progress');
  const completedBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled' || b.status === 'no-show');

  const timeSlots = [
    { time: '08:00', available: true },
    { time: '08:30', available: true },
    { time: '09:00', available: false },
    { time: '09:30', available: true },
    { time: '10:00', available: false },
    { time: '10:30', available: true },
    { time: '11:00', available: true },
    { time: '11:30', available: false },
    { time: '14:00', available: true },
    { time: '14:30', available: true },
    { time: '15:00', available: true },
    { time: '15:30', available: false },
  ];

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
              <p className="text-2xl font-bold text-slate-800">{bookings.filter(b => b.status === 'completed').length}</p>
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

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-200">
            <div className="flex">
              {[
                { key: 'queue', label: '排队队列', count: pendingBookings.length },
                { key: 'progress', label: '进行中', count: inProgressBookings.length },
                { key: 'history', label: '历史记录', count: completedBookings.length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors relative ${
                    activeTab === tab.key
                      ? 'text-blue-600 border-blue-500'
                      : 'text-slate-600 border-transparent hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {(activeTab === 'queue' ? pendingBookings : 
              activeTab === 'progress' ? inProgressBookings : completedBookings).map((booking, index) => (
              <div
                key={booking.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      booking.status === 'in-progress' ? 'bg-blue-500' :
                      booking.status === 'completed' ? 'bg-green-500' :
                      booking.status === 'cancelled' ? 'bg-slate-400' :
                      'bg-orange-500'
                    }`}>
                      {activeTab === 'queue' ? index + 1 : booking.queueNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-800">{booking.userName}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
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
                      <span className={`text-sm font-medium px-2 py-1 rounded ${
                        booking.serviceType === 'charging' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {getServiceTypeText(booking.serviceType)}
                      </span>
                      {booking.estimatedWaitTime > 0 && (
                        <p className="text-xs text-orange-600 mt-1">预计等待 {booking.estimatedWaitTime} 分钟</p>
                      )}
                    </div>
                    
                    {booking.status === 'pending' && (
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors">
                          确认
                        </button>
                        <button className="px-3 py-1.5 bg-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-300 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {booking.status === 'confirmed' && (
                      <button className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1">
                        <QrCode className="w-4 h-4" />
                        核销
                      </button>
                    )}
                    {booking.status === 'in-progress' && (
                      <button className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors">
                        完成
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">今日时段</h3>
          <p className="text-sm text-slate-500 mb-4">2026年6月7日 星期日</p>
          
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot.time}
                disabled={!slot.available}
                className={`py-2.5 px-2 rounded-lg text-sm font-medium transition-all ${
                  slot.available
                    ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
              >
                {slot.time}
                <span className="block text-xs mt-0.5">
                  {slot.available ? '可预约' : '已满'}
                </span>
              </button>
            ))}
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
                <select className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>中关村智能补能站</option>
                  <option>望京科创园站</option>
                  <option>亦庄经济开发区站</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">服务类型</label>
                <div className="flex gap-3">
                  <button className="flex-1 py-2.5 px-4 bg-blue-50 border-2 border-blue-500 text-blue-700 rounded-lg font-medium">
                    充电服务
                  </button>
                  <button className="flex-1 py-2.5 px-4 bg-slate-50 border-2 border-slate-200 text-slate-600 rounded-lg font-medium hover:border-slate-300">
                    换电服务
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">选择时段</label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.filter(s => s.available).slice(0, 8).map((slot) => (
                    <button
                      key={slot.time}
                      className="py-2 px-2 bg-slate-50 border border-slate-200 rounded-lg text-sm hover:bg-blue-50 hover:border-blue-300 transition-all"
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">联系人</label>
                <input
                  type="text"
                  placeholder="请输入姓名"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">联系电话</label>
                <input
                  type="tel"
                  placeholder="请输入手机号"
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
              <button className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all">
                确认预约
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
