export interface Site {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  serviceTypes: ('charging' | 'battery-swap')[];
  totalChargers: number;
  availableChargers: number;
  totalBatteries: number;
  availableBatteries: number;
  businessHours: string;
  queueCount: number;
  status: 'active' | 'maintenance' | 'offline';
}

export interface Device {
  id: string;
  siteId: string;
  siteName: string;
  type: 'charger' | 'battery-cabinet';
  name: string;
  model: string;
  status: 'online' | 'offline' | 'fault' | 'in-use';
  power?: number;
  currentBattery?: number;
  lastMaintenance: string;
}

export interface Booking {
  id: string;
  siteId: string;
  siteName: string;
  userId: string;
  userName: string;
  serviceType: 'charging' | 'battery-swap';
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  queueNumber: number;
  estimatedWaitTime: number;
  createdAt: string;
}

export interface Battery {
  id: string;
  serialNumber: string;
  model: string;
  capacity: number;
  currentLevel: number;
  healthStatus: number;
  status: 'available' | 'charging' | 'in-use' | 'maintenance' | 'retired';
  siteId: string;
  location: string;
  lastSwapTime?: string;
  cycleCount: number;
}

export interface ChargingRecord {
  id: string;
  siteId: string;
  siteName: string;
  userId: string;
  userName: string;
  type: 'charging' | 'battery-swap';
  startTime: string;
  endTime?: string;
  duration?: number;
  energyDelivered?: number;
  batteryBefore?: number;
  batteryAfter?: number;
  amount: number;
  status: 'charging' | 'completed' | 'failed';
  invoiceStatus?: 'none' | 'applied' | 'issued';
  settled?: boolean;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  level: 'normal' | 'silver' | 'gold' | 'platinum';
  discountRate: number;
  balance: number;
  deposit: number;
  points: number;
  totalOrders: number;
  totalSpent: number;
  joinDate: string;
}

export interface Ticket {
  id: string;
  siteId: string;
  siteName: string;
  deviceId?: string;
  deviceName?: string;
  type: 'device-fault' | 'battery-issue' | 'timeout-occupancy' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'processing' | 'resolved' | 'closed';
  title: string;
  description: string;
  reporter: string;
  assignee?: string;
  createdAt: string;
  resolvedAt?: string;
  lastProcessedAt?: string;
  processNotes?: string;
  resolution?: string;
}

export interface BatteryLog {
  id: string;
  batteryId: string;
  type: 'inventory' | 'stock-in' | 'swap' | 'status-change' | 'maintenance';
  description: string;
  operator: string;
  relatedId?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  memberId: string;
  memberName: string;
  type: 'recharge' | 'deposit' | 'refund' | 'consume' | 'adjust';
  amount: number;
  description: string;
  createdAt: string;
}

export interface ReportData {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  chargingOrders: number;
  swapOrders: number;
  avgOrderValue: number;
  newMembers: number;
  siteUtilization: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  siteId: string;
  siteName: string;
  rating: number;
  content: string;
  createdAt: string;
  reply?: string;
}
