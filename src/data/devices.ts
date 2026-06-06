import type { Device } from '@/types';

export const devices: Device[] = [
  {
    id: 'D001',
    siteId: '1',
    siteName: '中关村智能补能站',
    type: 'charger',
    name: '充电桩 #01',
    model: 'DJI-Charge-Pro-180',
    status: 'in-use',
    power: 180,
    lastMaintenance: '2026-05-15'
  },
  {
    id: 'D002',
    siteId: '1',
    siteName: '中关村智能补能站',
    type: 'charger',
    name: '充电桩 #02',
    model: 'DJI-Charge-Pro-180',
    status: 'online',
    power: 180,
    lastMaintenance: '2026-05-18'
  },
  {
    id: 'D003',
    siteId: '1',
    siteName: '中关村智能补能站',
    type: 'charger',
    name: '充电桩 #03',
    model: 'DJI-Charge-Pro-180',
    status: 'online',
    power: 180,
    lastMaintenance: '2026-05-20'
  },
  {
    id: 'D004',
    siteId: '1',
    siteName: '中关村智能补能站',
    type: 'battery-cabinet',
    name: '换电柜 #01',
    model: 'DJI-Swap-Cabinet-10',
    status: 'online',
    currentBattery: 8,
    lastMaintenance: '2026-05-10'
  },
  {
    id: 'D005',
    siteId: '2',
    siteName: '望京科创园站',
    type: 'charger',
    name: '充电桩 #01',
    model: 'DJI-Charge-Pro-180',
    status: 'fault',
    power: 180,
    lastMaintenance: '2026-04-28'
  },
  {
    id: 'D006',
    siteId: '2',
    siteName: '望京科创园站',
    type: 'charger',
    name: '充电桩 #02',
    model: 'DJI-Charge-Pro-180',
    status: 'in-use',
    power: 180,
    lastMaintenance: '2026-05-12'
  },
  {
    id: 'D007',
    siteId: '2',
    siteName: '望京科创园站',
    type: 'battery-cabinet',
    name: '换电柜 #01',
    model: 'DJI-Swap-Cabinet-8',
    status: 'online',
    currentBattery: 5,
    lastMaintenance: '2026-05-08'
  },
  {
    id: 'D008',
    siteId: '3',
    siteName: '亦庄经济开发区站',
    type: 'charger',
    name: '充电桩 #01',
    model: 'DJI-Charge-Max-240',
    status: 'online',
    power: 240,
    lastMaintenance: '2026-05-22'
  },
  {
    id: 'D009',
    siteId: '3',
    siteName: '亦庄经济开发区站',
    type: 'charger',
    name: '充电桩 #02',
    model: 'DJI-Charge-Max-240',
    status: 'in-use',
    power: 240,
    lastMaintenance: '2026-05-20'
  },
  {
    id: 'D010',
    siteId: '3',
    siteName: '亦庄经济开发区站',
    type: 'charger',
    name: '充电桩 #03',
    model: 'DJI-Charge-Max-240',
    status: 'in-use',
    power: 240,
    lastMaintenance: '2026-05-19'
  },
  {
    id: 'D011',
    siteId: '3',
    siteName: '亦庄经济开发区站',
    type: 'charger',
    name: '充电桩 #04',
    model: 'DJI-Charge-Max-240',
    status: 'offline',
    power: 240,
    lastMaintenance: '2026-05-01'
  },
  {
    id: 'D012',
    siteId: '4',
    siteName: '海淀软件园站',
    type: 'battery-cabinet',
    name: '换电柜 #01',
    model: 'DJI-Swap-Cabinet-15',
    status: 'online',
    currentBattery: 12,
    lastMaintenance: '2026-05-25'
  },
  {
    id: 'D013',
    siteId: '4',
    siteName: '海淀软件园站',
    type: 'battery-cabinet',
    name: '换电柜 #02',
    model: 'DJI-Swap-Cabinet-15',
    status: 'online',
    currentBattery: 6,
    lastMaintenance: '2026-05-20'
  },
  {
    id: 'D014',
    siteId: '6',
    siteName: '通州副中心站',
    type: 'charger',
    name: '充电桩 #01',
    model: 'DJI-Charge-Pro-180',
    status: 'online',
    power: 180,
    lastMaintenance: '2026-05-23'
  },
  {
    id: 'D015',
    siteId: '6',
    siteName: '通州副中心站',
    type: 'battery-cabinet',
    name: '换电柜 #01',
    model: 'DJI-Swap-Cabinet-12',
    status: 'in-use',
    currentBattery: 10,
    lastMaintenance: '2026-05-15'
  }
];
