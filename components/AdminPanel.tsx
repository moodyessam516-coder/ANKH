
import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { User } from '../types';
import { VerifiedBadge, SphinxLogo } from './Icons';

export const AdminPanel: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    setLoading(true);
    const users = await apiService.getPendingVerifications();
    setPendingUsers(users);
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAction = async (userId: string, action: 'approve' | 'reject') => {
    await apiService.adminActionOnVerification(userId, action);
    loadRequests();
  };

  if (loading) return <div className="text-center py-20 animate-pulse text-yellow-600">جاري استحضار سجلات الانتظار...</div>;

  return (
    <div className="max-w-2xl mx-auto pb-32 animate-fadeIn">
      <div className="flex items-center space-x-4 space-x-reverse mb-8 bg-yellow-600/10 p-6 rounded-3xl border border-yellow-600/20">
        <SphinxLogo className="w-12 h-12 text-yellow-600" />
        <div>
          <h2 className="text-2xl font-cinzel font-bold text-yellow-600">محراب الإدارة</h2>
          <p className="text-gray-500 text-xs">أنت صانع القرار في الشبكة الأزلية</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-gray-400 font-cinzel text-sm uppercase tracking-widest mb-4">طلبات التوثيق المعلقة ({pendingUsers.length})</h3>
        
        {pendingUsers.length === 0 ? (
          <div className="bg-[#151515] p-12 rounded-3xl text-center border border-gray-800">
            <p className="text-gray-600 italic">لا يوجد أرواح تنتظر التوثيق حالياً.</p>
          </div>
        ) : (
          pendingUsers.map(u => (
            <div key={u.id} className="bg-[#151515] border border-gray-800 p-5 rounded-2xl flex items-center justify-between group hover:border-yellow-600/30 transition-all">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden flex items-center justify-center border border-gray-700">
                  {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full object-cover" /> : u.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-gray-200">{u.name}</h4>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="text-[10px] text-gray-500">نوع الطلب:</span>
                    <VerifiedBadge type={u.verified?.includes('blue') ? 'blue' : 'yellow'} className="w-3 h-3" />
                    <span className={`text-[10px] font-bold ${u.verified?.includes('blue') ? 'text-blue-400' : 'text-yellow-500'}`}>
                      {u.verified?.includes('blue') ? 'ختم قديم' : 'ختم الفرعون'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 space-x-reverse">
                <button 
                  onClick={() => handleAction(u.id, 'approve')}
                  className="bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all border border-green-500/20"
                >
                  قبول
                </button>
                <button 
                  onClick={() => handleAction(u.id, 'reject')}
                  className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all border border-red-500/20"
                >
                  رفض
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
