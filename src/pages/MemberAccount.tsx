import { useState, useMemo } from 'react';
import { Users, Wallet, Shield, Award, TrendingUp, CreditCard, Search, Plus, Download, ChevronRight, Star, X, ArrowUpRight, ArrowDownLeft, Edit3 } from 'lucide-react';
import { useAppStore } from '@/store';
import { getMemberLevelText, getMemberLevelColor, formatCurrency, formatDate } from '@/utils/format';
import type { Member } from '@/types';

export default function MemberAccount() {
  const { members, transactions, rechargeMember, refundDeposit, updateMemberLevel } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(members[0]?.id || null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(100);
  const [refundAmount, setRefundAmount] = useState(500);
  const [newLevel, setNewLevel] = useState<Member['level']>('normal');

  const selectedMember = useMemo(() => 
    members.find(m => m.id === selectedMemberId) || null, 
    [members, selectedMemberId]
  );

  const filteredTransactions = useMemo(() => 
    selectedMemberId 
      ? transactions.filter(t => t.memberId === selectedMemberId)
      : transactions,
    [transactions, selectedMemberId]
  );

  const stats = useMemo(() => {
    const total = members.length;
    const totalBalance = members.reduce((sum, m) => sum + m.balance, 0);
    const totalDeposit = members.reduce((sum, m) => sum + m.deposit, 0);
    const totalRevenue = members.reduce((sum, m) => sum + m.totalSpent, 0);
    const avgSpent = total > 0 ? Math.round(totalRevenue / total) : 0;
    return { total, totalBalance, totalDeposit, totalRevenue, avgSpent };
  }, [members]);

  const levelDistribution = useMemo(() => {
    return [
      { level: 'platinum', name: '铂金会员', count: members.filter(m => m.level === 'platinum').length, color: '#A855F7' },
      { level: 'gold', name: '黄金会员', count: members.filter(m => m.level === 'gold').length, color: '#F59E0B' },
      { level: 'silver', name: '白银会员', count: members.filter(m => m.level === 'silver').length, color: '#64748B' },
      { level: 'normal', name: '普通会员', count: members.filter(m => m.level === 'normal').length, color: '#9CA3AF' },
    ];
  }, [members]);

  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name.includes(searchQuery) || 
                          member.phone.includes(searchQuery);
    const matchesLevel = levelFilter === 'all' || member.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const handleRecharge = () => {
    if (selectedMember && rechargeAmount > 0) {
      rechargeMember(selectedMember.id, rechargeAmount);
      setShowRechargeModal(false);
      setRechargeAmount(100);
    }
  };

  const handleRefund = () => {
    if (selectedMember && refundAmount > 0 && refundAmount <= selectedMember.deposit) {
      refundDeposit(selectedMember.id, refundAmount);
      setShowRefundModal(false);
      setRefundAmount(500);
    }
  };

  const handleUpdateLevel = () => {
    if (selectedMember) {
      updateMemberLevel(selectedMember.id, newLevel);
      setShowLevelModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">会员账户</h1>
          <p className="text-slate-500 mt-1">管理会员信息和账户余额</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-200 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            导出
          </button>
          <button className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            新增会员
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-xs text-slate-500 mt-1">会员总数</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalBalance)}</p>
          <p className="text-xs text-slate-500 mt-1">账户总余额</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.totalDeposit)}</p>
          <p className="text-xs text-slate-500 mt-1">押金总额</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalRevenue)}</p>
          <p className="text-xs text-slate-500 mt-1">累计消费</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.avgSpent)}</p>
          <p className="text-xs text-slate-500 mt-1">客单价</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">会员列表</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
                />
              </div>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部等级</option>
                <option value="platinum">铂金</option>
                <option value="gold">黄金</option>
                <option value="silver">白银</option>
                <option value="normal">普通</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                onClick={() => setSelectedMemberId(member.id)}
                className={`p-4 cursor-pointer transition-all ${
                  selectedMember?.id === member.id
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : 'hover:bg-slate-50 border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    member.level === 'platinum' ? 'bg-gradient-to-br from-purple-500 to-blue-500' :
                    member.level === 'gold' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                    member.level === 'silver' ? 'bg-gradient-to-br from-slate-400 to-slate-500' :
                    'bg-slate-300'
                  }`}>
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800 truncate">{member.name}</p>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getMemberLevelColor(member.level)}`}>
                        {getMemberLevelText(member.level)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{member.phone}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 space-y-6">
          {selectedMember && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white ${
                    selectedMember.level === 'platinum' ? 'bg-gradient-to-br from-purple-500 to-blue-500' :
                    selectedMember.level === 'gold' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                    selectedMember.level === 'silver' ? 'bg-gradient-to-br from-slate-400 to-slate-500' :
                    'bg-slate-300'
                  }`}>
                    {selectedMember.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{selectedMember.name}</h3>
                    <p className="text-slate-500">{selectedMember.phone}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getMemberLevelColor(selectedMember.level)}`}>
                        {getMemberLevelText(selectedMember.level)}
                      </span>
                      <span className="text-xs text-slate-500">
                        折扣 {Math.round((1 - selectedMember.discountRate) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">注册时间</p>
                  <p className="text-sm text-slate-700">{formatDate(selectedMember.joinDate)}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(selectedMember.balance)}</p>
                  <p className="text-xs text-slate-500 mt-1">账户余额</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <p className="text-2xl font-bold text-yellow-600">{formatCurrency(selectedMember.deposit)}</p>
                  <p className="text-xs text-slate-500 mt-1">押金</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <p className="text-2xl font-bold text-purple-600">{selectedMember.points}</p>
                  <p className="text-xs text-slate-500 mt-1">积分</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <p className="text-2xl font-bold text-emerald-600">{selectedMember.totalOrders}</p>
                  <p className="text-xs text-slate-500 mt-1">订单数</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setShowRechargeModal(true)}
                  className="flex-1 py-2.5 bg-blue-500 text-white rounded-lg font-medium text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  充值
                </button>
                <button 
                  onClick={() => setShowRefundModal(true)}
                  className="flex-1 py-2.5 bg-green-500 text-white rounded-lg font-medium text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  退还押金
                </button>
                <button 
                  onClick={() => {
                    setNewLevel(selectedMember.level);
                    setShowLevelModal(true);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  调整等级
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">会员等级分布</h3>
            <div className="grid grid-cols-4 gap-4">
              {levelDistribution.map((item) => (
                <div key={item.level} className="p-4 rounded-xl border border-slate-200 text-center">
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <Award className="w-6 h-6" style={{ color: item.color }} />
                  </div>
                  <p className="text-2xl font-bold" style={{ color: item.color }}>{item.count}</p>
                  <p className="text-sm text-slate-600">{item.name}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">最近交易</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.amount > 0 ? 'bg-green-100' : tx.amount < 0 ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      {tx.amount > 0 ? (
                        <Plus className="w-4 h-4 text-green-600" />
                      ) : tx.amount < 0 ? (
                        <CreditCard className="w-4 h-4 text-red-600" />
                      ) : (
                        <Edit3 className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{tx.description}</p>
                      <p className="text-xs text-slate-500">{tx.createdAt}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${
                    tx.amount > 0 ? 'text-green-600' : tx.amount < 0 ? 'text-red-600' : 'text-slate-600'
                  }`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount !== 0 ? formatCurrency(tx.amount) : '-'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showRechargeModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">账户充值</h3>
              <button onClick={() => setShowRechargeModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-slate-500">当前余额</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(selectedMember.balance)}</p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">充值金额</label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[50, 100, 200, 500].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setRechargeAmount(amount)}
                    className={`py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                      rechargeAmount === amount
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    ¥{amount}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="自定义金额"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRechargeModal(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200"
              >
                取消
              </button>
              <button
                onClick={handleRecharge}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg"
              >
                确认充值
              </button>
            </div>
          </div>
        </div>
      )}

      {showRefundModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">退还押金</h3>
              <button onClick={() => setShowRefundModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4 p-4 bg-yellow-50 rounded-xl">
              <p className="text-sm text-slate-500">当前押金</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(selectedMember.deposit)}</p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">退还金额</label>
              <input
                type="number"
                value={refundAmount}
                max={selectedMember.deposit}
                onChange={(e) => setRefundAmount(Math.min(parseInt(e.target.value) || 0, selectedMember.deposit))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入退还金额"
              />
              <p className="text-xs text-slate-400 mt-2">最多可退还：{formatCurrency(selectedMember.deposit)}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRefundModal(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200"
              >
                取消
              </button>
              <button
                onClick={handleRefund}
                className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg"
              >
                确认退还
              </button>
            </div>
          </div>
        </div>
      )}

      {showLevelModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">调整会员等级</h3>
              <button onClick={() => setShowLevelModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">选择等级</label>
              <div className="space-y-2">
                {[
                  { value: 'normal', label: '普通会员', discount: '无折扣', color: 'bg-slate-100 text-slate-700 border-slate-300' },
                  { value: 'silver', label: '银卡会员', discount: '95折', color: 'bg-slate-50 text-slate-600 border-slate-400' },
                  { value: 'gold', label: '金卡会员', discount: '9折', color: 'bg-amber-50 text-amber-700 border-amber-400' },
                  { value: 'platinum', label: '铂金会员', discount: '85折', color: 'bg-purple-50 text-purple-700 border-purple-400' },
                ].map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setNewLevel(level.value as Member['level'])}
                    className={`w-full p-3 rounded-lg text-left border-2 transition-all flex items-center justify-between ${
                      newLevel === level.value
                        ? level.color + ' border-2'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="font-medium">{level.label}</span>
                    <span className="text-sm">{level.discount}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLevelModal(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200"
              >
                取消
              </button>
              <button
                onClick={handleUpdateLevel}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg"
              >
                确认调整
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
