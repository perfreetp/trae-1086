import type { ReportData, Review } from '@/types';

export const reportData: ReportData[] = [
  { date: '06-01', totalOrders: 156, totalRevenue: 12580, chargingOrders: 98, swapOrders: 58, avgOrderValue: 80.6, newMembers: 12, siteUtilization: 68 },
  { date: '06-02', totalOrders: 168, totalRevenue: 13680, chargingOrders: 105, swapOrders: 63, avgOrderValue: 81.4, newMembers: 15, siteUtilization: 72 },
  { date: '06-03', totalOrders: 145, totalRevenue: 11850, chargingOrders: 92, swapOrders: 53, avgOrderValue: 81.7, newMembers: 8, siteUtilization: 65 },
  { date: '06-04', totalOrders: 178, totalRevenue: 14820, chargingOrders: 112, swapOrders: 66, avgOrderValue: 83.3, newMembers: 18, siteUtilization: 76 },
  { date: '06-05', totalOrders: 192, totalRevenue: 15860, chargingOrders: 120, swapOrders: 72, avgOrderValue: 82.6, newMembers: 22, siteUtilization: 79 },
  { date: '06-06', totalOrders: 165, totalRevenue: 13560, chargingOrders: 102, swapOrders: 63, avgOrderValue: 82.2, newMembers: 14, siteUtilization: 71 },
  { date: '06-07', totalOrders: 98, totalRevenue: 8250, chargingOrders: 62, swapOrders: 36, avgOrderValue: 84.2, newMembers: 8, siteUtilization: 58 }
];

export const reviews: Review[] = [
  {
    id: 'REV001',
    userId: 'U001',
    userName: '张晓明',
    siteId: '1',
    siteName: '中关村智能补能站',
    rating: 5,
    content: '充电速度很快，工作人员服务态度很好，站点环境整洁。换电流程也很顺畅，3分钟搞定，非常满意！',
    createdAt: '2026-06-06 15:30:00'
  },
  {
    id: 'REV002',
    userId: 'U002',
    userName: '李飞宇',
    siteId: '2',
    siteName: '望京科创园站',
    rating: 3,
    content: '有一个充电桩坏了，等了好久才排上队。希望能及时维修设备，不然高峰期真的很耽误时间。',
    createdAt: '2026-06-06 12:15:00'
  },
  {
    id: 'REV003',
    userId: 'U007',
    userName: '孙雅琪',
    siteId: '4',
    siteName: '海淀软件园站',
    rating: 5,
    content: '作为铂金会员，折扣力度很大，电池质量也很好。站点位置方便，预约系统很实用，节省了很多等待时间。',
    createdAt: '2026-06-05 18:45:00'
  },
  {
    id: 'REV004',
    userId: 'U004',
    userName: '陈思远',
    siteId: '3',
    siteName: '亦庄经济开发区站',
    rating: 4,
    content: '整体不错，就是充电桩数量有点少，下午高峰期需要排队。建议增加一些充电位。',
    createdAt: '2026-06-05 14:20:00',
    reply: '感谢您的反馈！我们正在规划扩建，预计下月新增4个充电桩。'
  },
  {
    id: 'REV005',
    userId: 'U008',
    userName: '周梦瑶',
    siteId: '6',
    siteName: '通州副中心站',
    rating: 2,
    content: '换电柜今天出故障了，白跑一趟。希望系统能更稳定一些，或者提前发布设备故障通知。',
    createdAt: '2026-06-07 09:10:00'
  }
];
