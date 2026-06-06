import { create } from 'zustand';
import type { Booking, Battery, Ticket, Member, ChargingRecord, Device, Site } from '@/types';
import { bookings as initialBookings } from '@/data/bookings';
import { batteries as initialBatteries } from '@/data/batteries';
import { tickets as initialTickets } from '@/data/tickets';
import { members as initialMembers } from '@/data/members';
import { chargingRecords as initialRecords } from '@/data/records';
import { devices as initialDevices } from '@/data/devices';
import { sites as initialSites } from '@/data/sites';

interface Transaction {
  id: string;
  type: 'recharge' | 'deposit' | 'refund' | 'consume' | 'adjust';
  amount: number;
  description: string;
  createdAt: string;
}

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
  transactions: Transaction[];
  lastInventoryTime: string;
  
  setPreselectedBookingSite: (site: Site | null) => void;
  addBooking: (booking: Omit<Booking, 'id' | 'queueNumber' | 'createdAt' | 'estimatedWaitTime'>) => void;
  updateBookingStatus: (id: string, status: Booking['status']) => void;
  addRecord: (record: Omit<ChargingRecord, 'id'>) => void;
  
  addBattery: (battery: Omit<Battery, 'id' | 'cycleCount' | 'lastSwapTime'>) => void;
  updateBatteryStatus: (id: string, status: Battery['status'], swapCode?: string) => void;
  updateInventoryTime: () => void;
  
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'status'>) => void;
  updateTicketStatus: (id: string, status: Ticket['status']) => void;
  
  rechargeMember: (memberId: string, amount: number) => void;
  refundDeposit: (memberId: string, amount: number) => void;
  updateMemberLevel: (memberId: string, level: Member['level']) => void;
  
  settleRecord: (id: string) => void;
  applyInvoice: (id: string) => void;
  
  updateDeviceStatus: (id: string, status: Device['status']) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 10);

export const useAppStore = create<AppState>((set, get) => ({
  bookings: initialBookings,
  batteries: initialBatteries,
  tickets: initialTickets,
  members: initialMembers,
  records: initialRecords,
  devices: initialDevices,
  sites: initialSites,
  selectedSiteId: null,
  preselectedBookingSite: null,
  transactions: [
    { id: '1', type: 'recharge', amount: 500, description: '账户充值', createdAt: '2026-06-06 10:30' },
    { id: '2', type: 'consume', amount: 58.5, description: '充电服务消费', createdAt: '2026-06-06 14:20' },
    { id: '3', type: 'deposit', amount: 1000, description: '电池押金', createdAt: '2026-06-05 09:15' },
  ],
  lastInventoryTime: '2026-06-06 18:00',

  setPreselectedBookingSite: (site) => set({ preselectedBookingSite: site }),

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
    };
    set((state) => ({ records: [...state.records, newRecord] }));
  },

  addBattery: (batteryData) => {
    const newBattery: Battery = {
      ...batteryData,
      id: generateId(),
      cycleCount: 0,
    };
    set((state) => ({ batteries: [...state.batteries, newBattery] }));
  },

  updateBatteryStatus: (id, status, swapCode) => {
    set((state) => ({
      batteries: state.batteries.map((b) =>
        b.id === id
          ? { 
              ...b, 
              status, 
              lastSwapTime: swapCode ? new Date().toISOString() : b.lastSwapTime,
              location: swapCode ? `换电编号: ${swapCode}` : b.location,
            }
          : b
      ),
    }));
  },

  updateInventoryTime: () => {
    set({ lastInventoryTime: new Date().toLocaleString('zh-CN') });
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
          ? { ...t, status, resolvedAt: status === 'resolved' ? new Date().toISOString() : t.resolvedAt }
          : t
      ),
    }));
  },

  rechargeMember: (memberId, amount) => {
    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId ? { ...m, balance: m.balance + amount, points: m.points + Math.floor(amount) } : m
      ),
      transactions: [
        {
          id: generateId(),
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
    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId ? { ...m, deposit: Math.max(0, m.deposit - amount) } : m
      ),
      transactions: [
        {
          id: generateId(),
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
    const discountMap = { normal: 1, silver: 0.95, gold: 0.9, platinum: 0.85 };
    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId ? { ...m, level, discountRate: discountMap[level] } : m
      ),
      transactions: [
        {
          id: generateId(),
          type: 'adjust',
          amount: 0,
          description: `会员等级调整为 ${level === 'normal' ? '普通' : level === 'silver' ? '银卡' : level === 'gold' ? '金卡' : '铂金'}`,
          createdAt: new Date().toLocaleString('zh-CN'),
        },
        ...state.transactions,
      ],
    }));
  },

  settleRecord: (id) => {
    set((state) => ({
      records: state.records.map((r) =>
        r.id === id ? { ...r, status: 'completed' as const } : r
      ),
    }));
  },

  applyInvoice: (id) => {
    set((state) => ({
      records: state.records.map((r) =>
        r.id === id ? { ...r, invoiceStatus: 'applied' } : r
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
