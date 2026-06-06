import { NavLink } from 'react-router-dom';
import { 
  Map, 
  Cpu, 
  CalendarClock, 
  Battery, 
  Receipt, 
  Users, 
  AlertTriangle, 
  BarChart3,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: '站点地图', icon: Map },
  { path: '/devices', label: '设备状态', icon: Cpu },
  { path: '/bookings', label: '预约排队', icon: CalendarClock },
  { path: '/batteries', label: '电池库存', icon: Battery },
  { path: '/records', label: '充电记录', icon: Receipt },
  { path: '/members', label: '会员账户', icon: Users },
  { path: '/tickets', label: '异常工单', icon: AlertTriangle },
  { path: '/reports', label: '经营报表', icon: BarChart3 },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col z-50">
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-700">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold">低空补能</h1>
          <p className="text-xs text-slate-400">智慧能源服务平台</p>
        </div>
      </div>
      
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-slate-700">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-bold text-white">
              管
            </div>
            <div>
              <p className="text-sm font-medium">管理员</p>
              <p className="text-xs text-slate-400">admin@low-alt.com</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
