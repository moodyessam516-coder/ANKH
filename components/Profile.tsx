
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { User, Post, AppView } from '../types';
import { apiService } from '../services/api';
import { geminiService } from '../services/gemini';
import { PostCard } from './PostCard';
import { ViewIcon, HeartIcon, CameraIcon, SparklesIcon, ImageIcon, VerifiedBadge, AnkhLogo, SphinxLogo } from './Icons';

interface ProfileProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUserUpdate }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState(user.bio || '');
  const [isRequestingVerification, setIsRequestingVerification] = useState(false);
  const [isManifestingAvatar, setIsManifestingAvatar] = useState(false);
  const [avatarPrompt, setAvatarPrompt] = useState('');
  const [status, setStatus] = useState('');
  const [activeTab, setActiveTab] = useState<'posts' | 'achievements'>('posts');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      const userPosts = await apiService.getUserPosts(user.id);
      setPosts(userPosts);
      setLoading(false);
    };
    fetchProfileData();
  }, [user.id]);

  const stats = useMemo(() => {
    // Explicit type annotations added to prevent 'unknown' type inference which caused the error:
    // Operator '+' cannot be applied to types 'unknown' and 'unknown'.
    const totalViews = posts.reduce((acc: number, p: Post) => acc + (p.views || 0), 0);
    const totalReactions = posts.reduce((acc: number, p: Post) => {
      const reactionsCount = Object.values(p.reactions || {}).reduce((a: number, b: number) => a + b, 0);
      return acc + reactionsCount;
    }, 0);
    return {
      posts: posts.length,
      views: totalViews,
      reactions: totalReactions
    };
  }, [posts]);

  const handleUpdateBio = async () => {
    try {
      const updated = await apiService.updateUserProfile(user.id, { bio: newBio });
      onUserUpdate(updated);
      setIsEditingBio(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleManifestAvatar = async () => {
    if (isManifestingAvatar) return;
    setIsManifestingAvatar(true);
    setStatus('جاري تجسيد الرمز الأسطوري...');
    try {
      const prompt = avatarPrompt || `A mystical ancient Egyptian futuristic avatar for a user named ${user.name}`;
      const img = await geminiService.generateImage(prompt);
      if (img) {
        const updated = await apiService.updateUserProfile(user.id, { avatarUrl: img });
        onUserUpdate(updated);
        setIsEditingAvatar(false);
        setAvatarPrompt('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsManifestingAvatar(false);
      setStatus('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('جاري نقش الصورة في السجلات...');
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const updated = await apiService.updateUserProfile(user.id, { avatarUrl: base64String });
        onUserUpdate(updated);
        setIsEditingAvatar(false);
        setStatus('');
      } catch (err) {
        console.error(err);
        setStatus('فشل تحديث الصورة');
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleRequestVerification = async (type: 'blue' | 'yellow') => {
    setStatus(`جاري إرسال الطلب للمجلس الأعلى...`);
    try {
      const updated = await apiService.requestVerification(user.id, type);
      onUserUpdate(updated);
      setIsRequestingVerification(false);
      setStatus('');
    } catch (err) {
      console.error(err);
      setStatus('فشل إرسال الطلب');
    }
  };

  const isPending = user.verified?.startsWith('pending_');
  const actualVerifiedType = user.verified === 'blue' || user.verified === 'yellow' ? user.verified : 'none';

  return (
    <div className="max-w-2xl mx-auto pb-32 animate-fadeIn px-2">
      {/* Cover and Profile Header Section */}
      <div className="relative bg-[#151515] border border-gray-800 rounded-[2.5rem] overflow-hidden mb-8 shadow-2xl transition-all">
        {/* Mystical Cover Pattern */}
        <div className="h-40 w-full bg-gradient-to-r from-[#0d0d0d] via-[#1a1306] to-[#0d0d0d] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/egyptian-hieroglyphs.png")` }}></div>
          <div className="absolute -bottom-1 left-0 right-0 h-20 bg-gradient-to-t from-[#151515] to-transparent"></div>
        </div>

        <div className="px-8 pb-8 -mt-16 relative">
          <div className="flex flex-col md:flex-row items-end md:items-center space-y-4 md:space-y-0 md:space-x-8 md:space-x-reverse">
            {/* Avatar Section */}
            <div className="relative group shrink-0 mx-auto md:mx-0">
              <div className="w-32 h-32 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-yellow-700 via-yellow-500 to-amber-900 shadow-2xl">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#151515] flex items-center justify-center text-white font-bold text-5xl border-4 border-[#151515]">
                  {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : user.name[0]}
                </div>
              </div>
              <button 
                onClick={() => setIsEditingAvatar(!isEditingAvatar)} 
                className={`absolute bottom-1 left-1 p-2.5 rounded-full shadow-2xl transition-all z-10 hover:scale-110 active:scale-90 ${isEditingAvatar ? 'bg-red-500 text-white' : 'bg-yellow-600 text-black'}`}
              >
                {isEditingAvatar ? <span className="text-xs font-bold px-1">X</span> : <CameraIcon className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Identity Info */}
            <div className="flex-1 text-center md:text-right w-full">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center space-x-3 space-x-reverse justify-center md:justify-start mb-1">
                  <h2 className="text-3xl font-cinzel font-bold text-gray-100 tracking-tight">{user.name}</h2>
                  <VerifiedBadge type={actualVerifiedType as any} className="w-6 h-6" />
                </div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-yellow-600/60 font-bold bg-yellow-600/5 px-3 py-1 rounded-full border border-yellow-600/10">
                  عضو منذ {new Date(user.joinedAt).getFullYear()}
                </div>
              </div>

              {isEditingBio ? (
                <div className="mt-3 flex flex-col items-center md:items-start">
                  <textarea 
                    value={newBio} 
                    onChange={(e) => setNewBio(e.target.value)}
                    className="w-full bg-black/50 border border-gray-800 rounded-xl p-3 text-sm text-gray-300 text-right focus:border-yellow-600 outline-none resize-none"
                    placeholder="اكتب بيانك الشخصي..."
                    rows={2}
                  />
                  <div className="mt-2 flex space-x-2 space-x-reverse">
                    <button onClick={handleUpdateBio} className="text-[10px] bg-yellow-600 text-black px-4 py-1.5 rounded-full font-bold uppercase tracking-widest">حفظ</button>
                    <button onClick={() => setIsEditingBio(false)} className="text-[10px] bg-gray-800 text-gray-400 px-4 py-1.5 rounded-full font-bold uppercase tracking-widest">إلغاء</button>
                  </div>
                </div>
              ) : (
                <div className="group/bio flex flex-col items-center md:items-start mt-2">
                  <p className="text-gray-400 text-sm font-light leading-relaxed max-w-md italic">
                    {user.bio || 'لم يتم نقش البيان الشخصي لهذه الروح بعد.'}
                    <button onClick={() => setIsEditingBio(true)} className="mr-2 opacity-0 group-hover/bio:opacity-100 transition-opacity text-yellow-600 text-xs">✎</button>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Verification Status Banner */}
          {isPending && (
            <div className="mt-6 bg-yellow-600/5 border border-yellow-600/20 px-4 py-3 rounded-2xl flex items-center justify-center space-x-3 space-x-reverse animate-pulse">
              <span className="text-lg">📜</span>
              <p className="text-xs text-yellow-600 font-bold tracking-wide uppercase">طلب التوثيق قيد المراجعة في المحراب الأعظم</p>
            </div>
          )}

          {/* Dynamic Statistics Grid */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-8">
            <div className="bg-black/40 border border-gray-800/50 p-3 rounded-2xl text-center group hover:border-yellow-600/30 transition-all">
              <span className="block text-yellow-600 font-cinzel text-xl font-bold group-hover:scale-110 transition-transform">{user.followers.length}</span>
              <span className="text-[8px] uppercase tracking-widest text-gray-600 font-bold">تابعون</span>
            </div>
            <div className="bg-black/40 border border-gray-800/50 p-3 rounded-2xl text-center group hover:border-yellow-600/30 transition-all">
              <span className="block text-yellow-600 font-cinzel text-xl font-bold group-hover:scale-110 transition-transform">{user.following.length}</span>
              <span className="text-[8px] uppercase tracking-widest text-gray-600 font-bold">يتابع</span>
            </div>
            <div className="bg-black/40 border border-gray-800/50 p-3 rounded-2xl text-center group hover:border-yellow-600/30 transition-all">
              <span className="block text-yellow-600 font-cinzel text-xl font-bold group-hover:scale-110 transition-transform">{stats.posts}</span>
              <span className="text-[8px] uppercase tracking-widest text-gray-600 font-bold">سجلات</span>
            </div>
            <div className="bg-black/40 border border-gray-800/50 p-3 rounded-2xl text-center group hover:border-yellow-600/30 transition-all col-span-1 md:col-span-1">
              <span className="block text-blue-400 font-cinzel text-xl font-bold group-hover:scale-110 transition-transform">{stats.views}</span>
              <span className="text-[8px] uppercase tracking-widest text-gray-600 font-bold">مشاهدات</span>
            </div>
            <div className="bg-black/40 border border-gray-800/50 p-3 rounded-2xl text-center group hover:border-yellow-600/30 transition-all col-span-1 md:col-span-1">
              <span className="block text-red-500 font-cinzel text-xl font-bold group-hover:scale-110 transition-transform">{stats.reactions}</span>
              <span className="text-[8px] uppercase tracking-widest text-gray-600 font-bold">تفاعلات</span>
            </div>
          </div>

          {!isPending && actualVerifiedType === 'none' && (
            <div className="mt-6 flex justify-center md:justify-start">
              <button 
                onClick={() => setIsRequestingVerification(!isRequestingVerification)}
                className="text-[10px] text-yellow-600/60 hover:text-yellow-600 transition-all uppercase font-bold tracking-[0.2em] px-4 py-2 bg-yellow-600/5 rounded-full border border-yellow-600/10 hover:border-yellow-600/30"
              >
                طلب علامة التوثيق المقدسة
              </button>
            </div>
          )}
        </div>

        {/* Edit Avatar Interactive Menu */}
        {isEditingAvatar && (
          <div className="px-8 pb-8 animate-fadeIn">
            <div className="bg-[#0a0a0a] rounded-[2rem] p-6 border border-gray-800/60 shadow-inner">
              <h4 className="font-cinzel text-[10px] uppercase tracking-[0.4em] text-yellow-600 mb-6 text-center">تحديث الرمز المقدس</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={triggerFilePicker}
                  className="bg-gray-800/30 hover:bg-gray-800/50 border border-gray-800 p-5 rounded-2xl flex flex-col items-center justify-center transition-all group"
                >
                  <ImageIcon className="w-8 h-8 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">تحميل من الجهاز</span>
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

                <div className="bg-yellow-600/5 border border-yellow-600/10 p-5 rounded-2xl flex flex-col">
                  <div className="flex items-center space-x-2 space-x-reverse mb-3">
                    <SparklesIcon className="w-4 h-4 text-yellow-600" />
                    <span className="text-[10px] text-yellow-600 font-bold uppercase tracking-widest">تجسيد بالذكاء الاصطناعي</span>
                  </div>
                  <input 
                    type="text" 
                    value={avatarPrompt}
                    onChange={(e) => setAvatarPrompt(e.target.value)}
                    placeholder="اوصف رمزك الأسطوري..."
                    className="w-full bg-black border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-300 focus:outline-none focus:border-yellow-600 transition-all text-right mb-3"
                  />
                  <button 
                    onClick={handleManifestAvatar}
                    disabled={isManifestingAvatar}
                    className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                  >
                    {isManifestingAvatar ? 'جاري التجسيد...' : 'توليد الرمز'}
                  </button>
                </div>
              </div>
              
              {status && <p className="mt-4 text-[9px] text-center uppercase tracking-widest text-yellow-600/70 animate-pulse font-mono">{status}</p>}
            </div>
          </div>
        )}

        {isRequestingVerification && (
          <div className="px-8 pb-8 animate-fadeIn">
            <div className="bg-[#0a0a0a] rounded-[2rem] p-8 border border-gray-800/60 text-center">
              <h4 className="font-cinzel text-[10px] uppercase tracking-[0.4em] text-yellow-600 mb-6">مراسم اختيار الختم الأبدي</h4>
              <div className="grid grid-cols-2 gap-6">
                <button onClick={() => handleRequestVerification('blue')} className="group bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 p-8 rounded-3xl flex flex-col items-center transition-all">
                  <VerifiedBadge type="blue" className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
                  <span className="text-blue-400 font-cinzel text-[11px] tracking-[0.3em] uppercase font-bold">الختم القديم</span>
                  <span className="text-[8px] text-gray-600 mt-2 uppercase tracking-widest">للمبدعين والمؤثرين</span>
                </button>
                <button onClick={() => handleRequestVerification('yellow')} className="group bg-yellow-500/5 hover:bg-yellow-500/10 border border-yellow-500/20 p-8 rounded-3xl flex flex-col items-center transition-all">
                  <VerifiedBadge type="yellow" className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
                  <span className="text-yellow-500 font-cinzel text-[11px] tracking-[0.3em] uppercase font-bold">ختم الفرعون</span>
                  <span className="text-[8px] text-gray-600 mt-2 uppercase tracking-widest">للمسؤولين والشركاء</span>
                </button>
              </div>
              {status && <p className="mt-6 text-[9px] uppercase tracking-widest text-yellow-600/70 animate-pulse font-mono">{status}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Content Navigation Tabs */}
      <div className="flex items-center justify-center mb-10 border-b border-gray-800/50">
        <button 
          onClick={() => setActiveTab('posts')}
          className={`px-8 py-4 font-cinzel text-[10px] uppercase tracking-[0.4em] relative transition-all ${activeTab === 'posts' ? 'text-yellow-500' : 'text-gray-500 hover:text-gray-300'}`}
        >
          سجلاتك
          {activeTab === 'posts' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-600 animate-fadeIn"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('achievements')}
          className={`px-8 py-4 font-cinzel text-[10px] uppercase tracking-[0.4em] relative transition-all ${activeTab === 'achievements' ? 'text-yellow-500' : 'text-gray-500 hover:text-gray-300'}`}
        >
          إنجازات
          {activeTab === 'achievements' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-600 animate-fadeIn"></div>}
        </button>
      </div>

      {/* Dynamic Tab Content */}
      <div className="space-y-6">
        {activeTab === 'posts' ? (
          loading ? (
            <div className="flex flex-col items-center py-20">
              <div className="w-12 h-12 border-2 border-yellow-600/20 border-t-yellow-600 rounded-full animate-spin mb-4"></div>
              <p className="text-[10px] uppercase tracking-widest text-gray-600 font-cinzel">جاري استحضار الأرشيف...</p>
            </div>
          ) : posts.length > 0 ? (
            posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post as any} 
                currentUser={user} 
                onPostUpdate={(upd) => setPosts(prev => prev.map(p => p.id === upd.id ? upd : p))} 
                onUserUpdate={onUserUpdate} 
              />
            ))
          ) : (
            <div className="text-center py-24 bg-[#111] rounded-3xl border border-dashed border-gray-800">
              <AnkhLogo className="w-12 h-12 mx-auto mb-4 text-gray-800" />
              <p className="text-gray-600 font-cinzel text-xs tracking-widest uppercase">الأرشيف لا يزال فارغاً من السجلات.</p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
            <AchievementCard title="الروح المبكرة" description="أحد الأوائل الذين دخلوا عالم ANKH" icon="✨" date={user.joinedAt} />
            {stats.posts >= 1 && <AchievementCard title="الكاتب الأبدي" description="نشرت أول سجل لك في الشبكة" icon="🖋️" date={posts[posts.length-1]?.createdAt} />}
            {stats.views >= 100 && <AchievementCard title="صوت مسموع" description="تجاوزت سجلاتك 100 مشاهدة" icon="👁️" />}
            {user.followers.length >= 5 && <AchievementCard title="زعيم القبيلة" description="يتبعك أكثر من 5 أرواح في رحلتك" icon="👑" />}
          </div>
        )}
      </div>
    </div>
  );
};

const AchievementCard = ({ title, description, icon, date }: { title: string, description: string, icon: string, date?: string }) => (
  <div className="bg-[#151515] border border-gray-800 p-6 rounded-[2rem] flex items-center space-x-5 space-x-reverse group hover:border-yellow-600/30 transition-all">
    <div className="w-16 h-16 rounded-2xl bg-black/50 flex items-center justify-center text-3xl border border-gray-800 group-hover:bg-yellow-600/10 group-hover:border-yellow-600/20 transition-all">
      {icon}
    </div>
    <div className="flex-1 text-right">
      <h4 className="font-cinzel text-sm text-yellow-600 font-bold mb-1">{title}</h4>
      <p className="text-[10px] text-gray-500 leading-relaxed font-light">{description}</p>
      {date && <p className="text-[8px] text-gray-700 mt-2 font-mono uppercase">{new Date(date).toLocaleDateString()}</p>}
    </div>
  </div>
);
