
import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Reel, User } from '../types';
import { HeartIcon, SendIcon } from './Icons';

interface ReelsProps {
  currentUser: User;
}

export const Reels: React.FC<ReelsProps> = ({ currentUser }) => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [reelUrl, setReelUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchReels = async () => {
    const res = await apiService.getReels();
    setReels(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchReels();
  }, []);

  const handleAddReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reelUrl.trim() || isPosting) return;
    setIsPosting(true);
    try {
      const newReel = await apiService.createReel({
        videoUrl: reelUrl,
        description: description || 'لا يوجد وصف.',
        authorName: currentUser.name
      });
      setReels([newReel, ...reels]);
      setReelUrl('');
      setDescription('');
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-10 h-10 border-2 border-yellow-600/10 border-t-yellow-600 rounded-full animate-spin"></div>
        <p className="text-gray-600 font-cinzel tracking-widest text-[10px] uppercase">استرجاع الرؤى البصرية...</p>
      </div>
    );
  }

  return (
    <div className="reels flex flex-col space-y-8 pb-32 max-w-xl mx-auto">
      <div className="flex flex-col items-center mb-6">
        <h2 className="text-gray-500 font-cinzel text-xs uppercase tracking-[0.5em] mb-4">الرؤى الأبدية</h2>
        
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-yellow-600/10 border border-yellow-600/20 text-yellow-600 px-6 py-2 rounded-full font-cinzel text-[10px] tracking-widest uppercase hover:bg-yellow-600 hover:text-black transition-all"
        >
          {showAddForm ? 'إغلاق التجسيد' : 'تجسيد رؤية (ريل)'}
        </button>

        {showAddForm && (
          <div className="w-full mt-6 bg-[#151515] border border-gray-800 rounded-2xl p-6 animate-fadeIn shadow-2xl">
            <form onSubmit={handleAddReel} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 mr-1">رابط الفيديو (URL)</label>
                <input 
                  type="text"
                  value={reelUrl}
                  onChange={(e) => setReelUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-yellow-600 transition-all text-right"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 mr-1">الوصف المصاحب</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="أخبر العالم عن هذه الرؤية..."
                  className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-yellow-600 transition-all h-20 resize-none text-right"
                />
              </div>
              <button 
                type="submit"
                disabled={!reelUrl.trim() || isPosting}
                className="w-full bg-yellow-600 text-black font-bold py-3 rounded-xl font-cinzel text-xs tracking-widest uppercase disabled:opacity-50 flex items-center justify-center space-x-2 space-x-reverse"
              >
                <span>نشر الرؤية</span>
                <SendIcon className="w-4 h-4 rotate-180" />
              </button>
            </form>
          </div>
        )}
      </div>
      
      {reels.length > 0 ? reels.map(r => (
        <div key={r.id} className="relative group rounded-2xl overflow-hidden bg-black border border-gray-800 shadow-xl transition-all hover:border-yellow-600/20">
          <video 
            src={r.videoUrl} 
            className="w-full aspect-[9/16] object-cover" 
            controls 
            loop
            playsInline
          />
          <div className="p-4 bg-gradient-to-b from-transparent to-[#111]">
            <div className="flex justify-between items-start flex-row-reverse">
              <div className="flex-1 text-right">
                <div className="flex items-center space-x-2 space-x-reverse mb-2 justify-start">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-700 to-amber-900 flex items-center justify-center text-white font-bold text-[10px] border border-yellow-500/20">
                    {r.authorName[0]}
                  </div>
                  <span className="text-gray-200 font-bold text-sm tracking-tight">{r.authorName}</span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{r.description}</p>
              </div>
              <div className="flex flex-col items-center mr-4">
                <button className="flex flex-col items-center text-gray-400 hover:text-red-500 transition-colors">
                  <HeartIcon className="w-6 h-6" />
                  <span className="text-[10px] font-mono mt-1">{r.likes}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )) : (
        <div className="text-center py-20 border border-dashed border-gray-800 rounded-2xl opacity-50">
          <p className="font-cinzel text-xs tracking-widest text-gray-500">لا توجد رؤى في الأرشيف حالياً.</p>
        </div>
      )}
    </div>
  );
};
