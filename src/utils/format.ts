export const formatCurrency = (amount: number): string => {
  return `¥${amount.toFixed(2)}`;
};

export const formatPercent = (value: number): string => {
  return `${value}%`;
};

export const formatCapacity = (capacity: number): string => {
  return `${capacity} mAh`;
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} 分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} 小时 ${mins} 分钟` : `${hours} 小时`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateTime = (dateStr: string): string => {
  return `${formatDate(dateStr)} ${formatTime(dateStr)}`;
};

export const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'online': '在线',
    'offline': '离线',
    'fault': '故障',
    'in-use': '使用中',
    'available': '可用',
    'charging': '充电中',
    'maintenance': '维护中',
    'retired': '已报废',
    'pending': '待确认',
    'confirmed': '已确认',
    'in-progress': '进行中',
    'completed': '已完成',
    'cancelled': '已取消',
    'no-show': '未到店',
    'active': '运营中',
    'open': '待处理',
    'processing': '处理中',
    'resolved': '已解决',
    'closed': '已关闭'
  };
  return statusMap[status] || status;
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'online': 'bg-green-100 text-green-700',
    'offline': 'bg-gray-100 text-gray-700',
    'fault': 'bg-red-100 text-red-700',
    'in-use': 'bg-blue-100 text-blue-700',
    'available': 'bg-green-100 text-green-700',
    'charging': 'bg-blue-100 text-blue-700',
    'maintenance': 'bg-yellow-100 text-yellow-700',
    'retired': 'bg-gray-100 text-gray-700',
    'pending': 'bg-yellow-100 text-yellow-700',
    'confirmed': 'bg-blue-100 text-blue-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    'completed': 'bg-green-100 text-green-700',
    'cancelled': 'bg-gray-100 text-gray-700',
    'no-show': 'bg-red-100 text-red-700',
    'active': 'bg-green-100 text-green-700',
    'open': 'bg-red-100 text-red-700',
    'processing': 'bg-yellow-100 text-yellow-700',
    'resolved': 'bg-green-100 text-green-700',
    'closed': 'bg-gray-100 text-gray-700'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-700';
};

export const getPriorityText = (priority: string): string => {
  const priorityMap: Record<string, string> = {
    'low': '低',
    'medium': '中',
    'high': '高',
    'urgent': '紧急'
  };
  return priorityMap[priority] || priority;
};

export const getPriorityColor = (priority: string): string => {
  const colorMap: Record<string, string> = {
    'low': 'bg-gray-100 text-gray-700',
    'medium': 'bg-yellow-100 text-yellow-700',
    'high': 'bg-orange-100 text-orange-700',
    'urgent': 'bg-red-100 text-red-700'
  };
  return colorMap[priority] || 'bg-gray-100 text-gray-700';
};

export const getMemberLevelText = (level: string): string => {
  const levelMap: Record<string, string> = {
    'normal': '普通会员',
    'silver': '白银会员',
    'gold': '黄金会员',
    'platinum': '铂金会员'
  };
  return levelMap[level] || level;
};

export const getMemberLevelColor = (level: string): string => {
  const colorMap: Record<string, string> = {
    'normal': 'bg-gray-100 text-gray-700 border-gray-200',
    'silver': 'bg-slate-100 text-slate-700 border-slate-300',
    'gold': 'bg-amber-50 text-amber-700 border-amber-200',
    'platinum': 'bg-gradient-to-r from-blue-50 to-purple-50 text-purple-700 border-purple-200'
  };
  return colorMap[level] || 'bg-gray-100 text-gray-700 border-gray-200';
};

export const getServiceTypeText = (type: string): string => {
  return type === 'charging' ? '充电' : '换电';
};

export const getTicketTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    'device-fault': '设备故障',
    'battery-issue': '电池问题',
    'timeout-occupancy': '超时占位',
    'other': '其他'
  };
  return typeMap[type] || type;
};
