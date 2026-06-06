import { create } from 'zustand';
import type { Booking, Battery, Ticket, Member, ChargingRecord, Device, Site, BatteryLog, Transaction } from '@/types';
import { bookings as initialBookings } from '@/data/bookings';
import { batteries as initialBatteries } from '@/data/batteries';
import { tickets as initialTickets } from '@/data/tickets';
import { members as initialMembers } from '@/data/members';
import { chargingRecords as initialRecords } from '@/data/records';
import { devices as initialDevices } from '@/data/devices';
import { sites as initialSites } from '@/data/sites';

interface AppState {
  bookings: Booking[];
  batteries: Battery[];
  tickets: Ticket[];
  members: Member[];
  records: ChargingRecord[];
  devices: Device[];
  sites: Site[];
  selectedSiteId: string | null;
  preselectedBookingSite: Site | null;
  preselectedServiceTypes: ('charging' | 'battery-swap')[] | null;
  transactions: Transaction[];
  batteryLogs: BatteryLog[];
  lastInventoryTime: string;
  
  setPreselectedBookingSite: (site: Site | null) => void;
  setPreselectedServiceTypes: (types: ('charging' | 'battery-swap')[] | null) => void;
  addBooking: (booking: Omit<Booking, 'id' | 'queueNumber' | 'createdAt' | 'estimatedWaitTime'>) => void;
  updateBookingStatus: (id: string, status: Booking['status']) => void;
  addRecord: (record: Omit<ChargingRecord, 'id'>) => void;
  completeRecord: (id: string) => void;
  
  addBattery: (battery: Omit<Battery, 'id' | 'cycleCount' | 'lastSwapTime'>) => void;
  updateBatteryStatus: (id: string, status: Battery['status'], swapCode?: string) => void;
  updateInventoryTime: () => void;
  addBatteryLog: (log: Omit<BatteryLog, 'id' | 'createdAt'>) => void;
  
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'status'>) => void;
  updateTicketStatus: (id: string, status: Ticket['status']) => void;
  assignTicket: (id: string, assignee: string) => void;
  addProcessNote: (id: string, note: string) => void;
  resolveTicket: (id: string, resolution: string) => void;
  
  rechargeMember: (memberId: string, amount: number) => void;
  refundDeposit: (memberId: string, amount: number) => void;
  updateMemberLevel: (memberId: string, level: Member['level']) => void;
  
  settleRecord: (id: string) => void;
  settleRecords: (ids: string[]) => void;
  applyInvoice: (id: string, title?: string, email?: string) => void;
  applyInvoices: (ids: string[], title?: string, email?: string) => void;
  
  updateDeviceStatus: (id: string, status: Device['status']) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 10);

export const useAppStore = create<AppState>((set, get) => ({
  bookings: initialBookings,
  batteries: initialBatteries,
  tickets: initialTickets,
  members: initialMembers,
  records: initialRecords.map(r => ({ ...r, settled: r.status === 'completed', invoiceStatus: r.invoiceStatus || 'none' })),
  devices: initialDevices,
  sites: initialSites,
  selectedSiteId: null,
  preselectedBookingSite: null,
  preselectedServiceTypes: null,
  transactions: [
    { id: '1', memberId: 'U001', memberName: '张晓明', type: 'recharge', amount: 500, description: '账户充值', createdAt: '2026-06-06 10:30' },
    { id: '2', memberId: 'U001', memberName: '张晓明', type: 'consume', amount: 58.5, description: '充电服务消费', createdAt: '2026-06-06 14:20' },
    { id: '3', memberId: 'U002', memberName: '李华', type: 'deposit', amount: 1000, description: '电池押金', createdAt: '2026-06-05 09:15' },
  ],
  batteryLogs: [
    ...['BAT001', 'BAT002', 'BAT003', 'BAT004', 'BAT005', 'BAT006', 'BAT007', 'BAT008', 'BAT009', 'BAT010', 'BAT011', 'BAT012', 'BAT013', 'BAT014', 'BAT015'].map((id, i) => ({
      id: `log-stock-${i}`,
      batteryId: id,
      type: 'stock-in' as const,
      description: '新电池入库',
      operator: '系统',
      createdAt: `2026-05-${String(20 + i).padStart(2, '0')} 08:00`,
    })),
    { id: 'log-swap-1', batteryId: 'BAT001', type: 'swap', description: '换电绑定 SW-20260606-001', operator: '张晓明', relatedId: 'SW-20260606-001', createdAt: '2026-06-06 10:30' },
    { id: 'log-inv-1', batteryId: 'BAT003', type: 'inventory', description: '库存盘点', operator: '管理员', createdAt: '2026-06-06 18:00' },
  ],
  lastInventoryTime: '2026-06-06 18:00',

  setPreselectedBookingSite: (site) => set({ preselectedBookingSite: site }),
  setPreselectedServiceTypes: (types) => set({ preselectedServiceTypes: types }),

  addBooking: (bookingData) => {
    const { bookings } = get();
    const maxQueue = bookings.length > 0 ? Math.max(...bookings.map(b => b.queueNumber)) : 0;
    const newBooking: Booking = {
      ...bookingData,
      id: generateId(),
      queueNumber: maxQueue + 1,
      estimatedWaitTime: Math.floor(Math.random() * 20) + 5,
      createdAt: new Date().toISOString(),
    };
    set({ bookings: [...bookings, newBooking] });
  },

  updateBookingStatus: (id, status) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, status } : b
      ),
    }));
  },

  addRecord: (recordData) => {
    const newRecord: ChargingRecord = {
      ...recordData,
      id: generateId(),
      settled: false,
      invoiceStatus: 'none',
    };
    set((state) => ({ records: [...state.records, newRecord] }));
  },

  completeRecord: (id) => {
    set((state) => ({
      records: state.records.map((r) =>
        r.id === id ? { 
          ...r, 
          status: 'completed' as const, 
          endTime: new Date().toLocaleString('zh-CN'),
          duration: 15,
          settled: false,
        } : r
      ),
    }));
  },

  addBattery: (batteryData) => {
    const newBattery: Battery = {
      ...batteryData,
      id: generateId(),
      cycleCount: 0,
    };
    const log: BatteryLog = {
      id: generateId(),
      batteryId: newBattery.id,
      type: 'stock-in',
      description: `新电池入库 - ${batteryData.serialNumber}`,
      operator: '管理员',
      createdAt: new Date().toLocaleString('zh-CN'),
    };
    set((state) => ({ 
      batteries: [...state.batteries, newBattery],
      batteryLogs: [log, ...state.batteryLogs],
    }));
  },

  updateBatteryStatus: (id, status, swapCode) => {
    const battery = get().batteries.find(b => b.id === id);
    const log: BatteryLog = {
      id: generateId(),
      batteryId: id,
      type: swapCode ? 'swap' : 'status-change',
      description: swapCode ? `换电绑定 ${swapCode}` : `状态变更为 ${status}`,
      operator: '管理员',
      relatedId: swapCode,
      createdAt: new Date().toLocaleString('zh-CN'),
    };
    set((state) => ({
      batteries: state.batteries.map((b) =>
        b.id === id
          ? { 
              ...b, 
              status, 
              lastSwapTime: swapCode ? new Date().toISOString() : b.lastSwapTime,
              location: swapCode ? `换电编号: ${swapCode}` : b.location,
              cycleCount: swapCode ? b.cycleCount + 1 : b.cycleCount,
            }
          : b
      ),
      batteryLogs: [log, ...state.batteryLogs],
    }));
  },

  updateInventoryTime: () => {
    const now = new Date().toLocaleString('zh-CN');
    const logs: BatteryLog[] = get().batteries.map(b => ({
      id: generateId(),
      batteryId: b.id,
      type: 'inventory',
      description: '库存盘点',
      operator: '管理员',
      createdAt: now,
    }));
    set({ 
      lastInventoryTime: now,
      batteryLogs: [...logs, ...get().batteryLogs],
    });
  },

  addBatteryLog: (logData) => {
    const log: BatteryLog = {
      ...logData,
      id: generateId(),
      createdAt: new Date().toLocaleString('zh-CN'),
    };
    set((state) => ({ batteryLogs: [log, ...state.batteryLogs] }));
  },

  addTicket: (ticketData) => {
    const newTicket: Ticket = {
      ...ticketData,
      id: generateId(),
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ tickets: [...state.tickets, newTicket] }));
  },

  updateTicketStatus: (id, status) => {
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === id
          ? { 
              ...t, 
              status, 
              resolvedAt: status === 'resolved' ? new Date().toISOString() : t.resolvedAt,
              lastProcessedAt: new Date().toISOString(),
            }
          : t
      ),
    }));
  },

  assignTicket: (id, assignee) => {
    const now = new Date().toLocaleString('zh-CN');
    const logEntry = {
      id: generateId(),
      type: 'assign' as const,
      content: `分配给 ${assignee} 处理`,
      operator: '系统',
      createdAt: now,
    };
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === id
          ? { 
              ...t, 
              assignee, 
              status: 'processing' as const, 
              lastProcessedAt: now,
              processLog: [...(t.processLog || []), logEntry],
            }
          : t
      ),
    }));
  },

  addProcessNote: (id, note) => {
    const now = new Date().toLocaleString('zh-CN');
    const logEntry = {
      id: generateId(),
      type: 'note' as const,
      content: note,
      operator: '处理人',
      createdAt: now,
    };
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === id
          ? { 
              ...t, 
              lastProcessedAt: now,
              processLog: [...(t.processLog || []), logEntry],
            }
          : t
      ),
    }));
  },

  resolveTicket: (id, resolution) => {
    const now = new Date().toLocaleString('zh-CN');
    const logEntry = {
      id: generateId(),
      type: 'resolve' as const,
      content: resolution,
      operator: '处理人',
      createdAt: now,
    };
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === id
          ? { 
              ...t, 
              status: 'resolved' as const, 
              resolution, 
              resolvedAt: now,
              lastProcessedAt: now,
              processLog: [...(t.processLog || []), logEntry],
            }
          : t
      ),
    }));
  },

  rechargeMember: (memberId, amount) => {
    const member = get().members.find(m => m.id === memberId);
    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId ? { ...m, balance: m.balance + amount, points: m.points + Math.floor(amount) } : m
      ),
      transactions: [
        {
          id: generateId(),
          memberId,
          memberName: member?.name || '',
          type: 'recharge',
          amount,
          description: '账户充值',
          createdAt: new Date().toLocaleString('zh-CN'),
        },
        ...state.transactions,
      ],
    }));
  },

  refundDeposit: (memberId, amount) => {
    const member = get().members.find(m => m.id === memberId);
    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId ? { ...m, deposit: Math.max(0, m.deposit - amount) } : m
      ),
      transactions: [
        {
          id: generateId(),
          memberId,
          memberName: member?.name || '',
          type: 'refund',
          amount: -amount,
          description: '押金退还',
          createdAt: new Date().toLocaleString('zh-CN'),
        },
        ...state.transactions,
      ],
    }));
  },

  updateMemberLevel: (memberId, level) => {
    const member = get().members.find(m => m.id === memberId);
    const discountMap = { normal: 1, silver: 0.95, gold: 0.9, platinum: 0.85 };
    const levelNames = { normal: '普通', silver: '银卡', gold: '金卡', platinum: '铂金' };
    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId ? { ...m, level, discountRate: discountMap[level] } : m
      ),
      transactions: [
        {
          id: generateId(),
          memberId,
          memberName: member?.name || '',
          type: 'adjust',
          amount: 0,
          description: `会员等级调整为 ${levelNames[level]}`,
          createdAt: new Date().toLocaleString('zh-CN'),
        },
        ...state.transactions,
      ],
    }));
  },

  settleRecord: (id) => {
    const settlementNo = 'SET' + Date.now().toString().slice(-8) + '01';
    set((state) => ({
      records: state.records.map((r) =>
        r.id === id ? { ...r, settled: true, settlementNo } : r
      ),
    }));
  },

  settleRecords: (ids) => {
    set((state) => ({
      records: state.records.map((r, i) =>
        ids.includes(r.id) ? { 
          ...r, 
          settled: true, 
          settlementNo: 'SET' + Date.now().toString().slice(-8) + String(i + 1).padStart(2, '0')
        } : r
      ),
    }));
  },

  applyInvoice: (id, title, email) => {
    set((state) => ({
      records: state.records.map((r) =>
        r.id === id ? { ...r, invoiceStatus: 'applied', invoiceTitle: title, invoiceEmail: email } : r
      ),
    }));
  },

  applyInvoices: (ids, title, email) => {
    set((state) => ({
      records: state.records.map((r) =>
        ids.includes(r.id) ? { ...r, invoiceStatus: 'applied', invoiceTitle: title, invoiceEmail: email } : r
      ),
    }));
  },

  updateDeviceStatus: (id, status) => {
    set((state) => ({
      devices: state.devices.map((d) =>
        d.id === id ? { ...d, status } : d
      ),
    }));
  },
}));
