import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Search, Filter, Zap, BatteryCharging, Clock, Users, MapPin, ChevronRight, X, Wifi, WifiOff, Calendar, Battery, Cpu } from 'lucide-react';
import { sites } from '@/data/sites';
import type { Site } from '@/types';
import { getStatusText, getStatusColor, getServiceTypeText } from '@/utils/format';
import { useAppStore } from '@/store';
import 'leaflet/dist/leaflet.css';

const timeSlots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

export default function SiteMap() {
  const navigate = useNavigate();
  const { setPreselectedBookingSite, setPreselectedServiceTypes, devices, batteries, bookings } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  const siteDevices = useMemo(() => 
    selectedSite ? devices.filter(d => d.siteId === selectedSite.id) : [],
    [devices, selectedSite]
  );

  const siteBatteries = useMemo(() => 
    selectedSite ? batteries.filter(b => b.siteId === selectedSite.id) : [],
    [batteries, selectedSite]
  );

  const siteBookings = useMemo(() => 
    selectedSite ? bookings.filter(b => b.siteId === selectedSite.id && b.status !== 'cancelled' && b.status !== 'no-show') : [],
    [bookings, selectedSite]
  );

  const siteSlotAvailability = useMemo(() => {
    if (!selectedSite) return {};
    const counts: Record<string, number> = {};
    timeSlots.forEach(slot => {
      counts[slot] = siteBookings.filter(b => b.timeSlot.includes(slot)).length;
    });
    return counts;
  }, [siteBookings, selectedSite]);

  const handleSiteClick = (site: Site) => {
    setSelectedSite(site);
    setShowDrawer(true);
  };

  const handleBookNow = () => {
    if (selectedSite) {
      setPreselectedBookingSite(selectedSite);
      setPreselectedServiceTypes(selectedSite.serviceTypes);
      navigate('/bookings');
    }
  };

  const filteredSites = sites.filter((site) => {
    const matchesSearch = site.name.includes(searchQuery) || site.address.includes(searchQuery);
    const matchesType = selectedType === 'all' || site.serviceTypes.includes(selectedType as 'charging' | 'battery-swap');
    return matchesSearch && matchesType;
  });

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      <div className="w-80 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">站点列表</h2>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索站点名称或地址"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            {['all', 'charging', 'battery-swap'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  selectedType === type
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type === 'all' ? '全部' : type === 'charging' ? '充电' : '换电'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {filteredSites.map((site) => (
            <div
              key={site.id}
              onClick={() => handleSiteClick(site)}
              className={`p-4 rounded-lg cursor-pointer transition-all mb-2 ${
                selectedSite?.id === site.id
                  ? 'bg-blue-50 border-2 border-blue-500'
                  : 'bg-white border border-slate-200 hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-800">{site.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(site.status)}`}>
                  {getStatusText(site.status)}
                </span>
              </div>
              
              <div className="flex items-center gap-1 text-sm text-slate-500 mb-3">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{site.address}</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {site.serviceTypes.map((type) => (
                  <span
                    key={type}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      type === 'charging' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {type === 'charging' ? <Zap className="w-3 h-3" /> : <BatteryCharging className="w-3 h-3" />}
                    {getServiceTypeText(type)}
                  </span>
                ))}
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-slate-50 rounded-lg">
                  <div className="font-semibold text-slate-700">{site.availableChargers}/{site.totalChargers}</div>
                  <div className="text-slate-500">充电桩</div>
                </div>
                <div className="text-center p-2 bg-slate-50 rounded-lg">
                  <div className="font-semibold text-slate-700">{site.availableBatteries}/{site.totalBatteries}</div>
                  <div className="text-slate-500">电池</div>
                </div>
                <div className="text-center p-2 bg-slate-50 rounded-lg">
                  <div className="font-semibold text-orange-600">{site.queueCount}</div>
                  <div className="text-slate-500">排队</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex-1 rounded-xl overflow-hidden shadow-sm border border-slate-200 relative">
        <MapContainer
          center={[39.9042, 116.4074]}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredSites.map((site) => (
            <Marker key={site.id} position={[site.lat, site.lng]} eventHandlers={{ click: () => handleSiteClick(site) }}>
              <Popup>
                <div className="p-2 min-w-48">
                  <h3 className="font-bold text-slate-800 mb-2">{site.name}</h3>
                  <p className="text-sm text-slate-600 mb-2">{site.address}</p>
                  <div className="flex gap-2 mb-2">
                    {site.serviceTypes.map((type) => (
                      <span key={type} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {getServiceTypeText(type)}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{site.businessHours}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {showDrawer && selectedSite && (
        <div className="w-80 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">站点详情</h3>
            <button onClick={() => setShowDrawer(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">{selectedSite.name}</h4>
              <div className="flex items-center gap-1 text-sm text-slate-500 mb-2">
                <MapPin className="w-4 h-4" />
                <span>{selectedSite.address}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <Clock className="w-4 h-4" />
                <span>营业时间: {selectedSite.businessHours}</span>
              </div>
              <div className="flex gap-2 mt-3">
                {selectedSite.serviceTypes.map((type) => (
                  <span
                    key={type}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      type === 'charging' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {type === 'charging' ? <Zap className="w-3 h-3" /> : <BatteryCharging className="w-3 h-3" />}
                    {getServiceTypeText(type)}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <div className="text-xl font-bold text-blue-600">{siteDevices.filter(d => d.status === 'online').length}/{siteDevices.length}</div>
                <div className="text-xs text-slate-500 mt-1">设备在线</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <div className="text-xl font-bold text-green-600">{siteBatteries.filter(b => b.status === 'available').length}</div>
                <div className="text-xs text-slate-500 mt-1">可用电池</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-xl">
                <div className="text-xl font-bold text-orange-600">{siteBookings.length}</div>
                <div className="text-xs text-slate-500 mt-1">当前排队</div>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                设备状态
              </h5>
              <div className="space-y-2">
                {siteDevices.slice(0, 4).map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {device.status === 'online' || device.status === 'in-use' ? (
                        <Wifi className="w-4 h-4 text-green-500" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm text-slate-700">{device.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      device.status === 'online' ? 'bg-green-100 text-green-700' :
                      device.status === 'fault' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {device.status === 'online' ? '在线' : device.status === 'fault' ? '故障' : device.status === 'in-use' ? '使用中' : '离线'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                今日可预约时段
              </h5>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((slot) => {
                  const booked = siteSlotAvailability[slot] || 0;
                  const isFull = booked >= 3;
                  return (
                    <div
                      key={slot}
                      className={`text-center py-2 px-1 rounded-lg text-xs ${
                        isFull ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-700'
                      }`}
                    >
                      <div className="font-medium">{slot}</div>
                      <div className="text-xs opacity-75">{isFull ? '已满' : `${3 - booked}位`}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleBookNow}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              立即预约
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
