
import React, { useState, useEffect, useCallback } from 'react';
import { User, Post, AppView } from './types';
import { apiService } from './services/api';
import { AuthForm } from './components/AuthForm';
import { PostCard } from './components/PostCard';
import { PostInput } from './components/PostInput';
import { SphinxLogo, UserIcon, VerifiedBadge } from './components/Icons';
import { Navbar } from './components/Navbar';
import { Reels } from './components/Reels';
import { Messages } from './components/Messages';
import { CreateContent } from './components/CreateContent';
import { Profile } from './components/Profile';
import { AdminPanel } from './components/AdminPanel';
import { PharaonicIntro } from './components/PharaonicIntro';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [showIntro, setShowIntro] = useState(true);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getPosts();
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('ankh_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    fetchPosts();
  }, [fetchPosts]);

  const handleLogin = async (credentials: any) => {
    const { user } = await apiService.login(credentials);
    setUser(user);
    localStorage.setItem('ankh_user', JSON.stringify(user));
  };

  const handleRegister = async (data: any) => {
    await apiService.register(data);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ankh_user');
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('ankh_user', JSON.stringify(updatedUser));
  };

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const handleCreatePost = async (content: string, imageUrl?: string, videoUrl?: string) => {
    if (!user) return;
    try {
      const newPost = await apiService.createPost({ userId: user.id, authorName: user.name, content, imageUrl, videoUrl });
      setPosts([newPost, ...posts]);
    } catch (err) { console.error(err); }
  };

  if (showIntro) return <PharaonicIntro onFinish={() => setShowIntro(false)} />;

  if (!user) return <AuthForm onLogin={handleLogin} onRegister={handleRegister} />;

  const isAdmin = user.id === 'admin';

  const renderView = () => {
    switch (currentView) {
      case AppView.REELS: return <Reels currentUser={user} />;
      case AppView.CREATE: return <CreateContent currentUser={user} onComplete={() => { setCurrentView(AppView.HOME); fetchPosts(); }} />;
      case AppView.MESSAGES: return <Messages />;
      case AppView.PROFILE: return <Profile user={user} onUserUpdate={handleUserUpdate} />;
      case AppView.ADMIN: return isAdmin ? <AdminPanel /> : <Profile user={user} onUserUpdate={handleUserUpdate} />;
      case AppView.HOME:
      default:
        return (
          <div className="space-y-6 pb-32">
            <PostInput onPost={handleCreatePost} currentUser={user} />
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-gray-500 uppercase tracking-widest text-[10px] font-bold">أحدث السجلات</h2>
              <button onClick={fetchPosts} className="text-[10px] text-yellow-600/50 hover:text-yellow-600 transition-colors uppercase font-bold tracking-widest">تزامن السجلات</button>
            </div>
            {isLoading && posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <div className="w-10 h-10 border-2 border-yellow-600/10 border-t-yellow-600 rounded-full animate-spin"></div>
                <p className="text-gray-600 font-cinzel tracking-widest text-[10px] uppercase">جاري فك رموز اللفائف...</p>
              </div>
            ) : (
              posts.map(post => <PostCard key={post.id} post={post as any} currentUser={user} onPostUpdate={handlePostUpdate} onUserUpdate={handleUserUpdate} />)
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-gray-800 shadow-2xl shadow-yellow-600/5">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 space-x-reverse cursor-pointer" onClick={() => setCurrentView(AppView.HOME)}>
            <SphinxLogo className="w-8 h-8 text-yellow-600" />
            <h1 className="text-2xl font-cinzel font-bold text-yellow-600 tracking-tighter hidden sm:block">ANKH</h1>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            {isAdmin && (
              <button onClick={() => setCurrentView(AppView.ADMIN)} className="text-yellow-600 bg-yellow-600/10 px-3 py-1 rounded-full text-[10px] font-bold border border-yellow-600/20 hover:bg-yellow-600 hover:text-black transition-all">
                محراب الإدارة
              </button>
            )}
            <div className="flex items-center space-x-2 space-x-reverse bg-gray-900 px-3 py-1.5 rounded-full border border-gray-800 cursor-pointer" onClick={() => setCurrentView(AppView.PROFILE)}>
              <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center text-[10px] text-gray-300 font-bold border border-gray-600">
                {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : user.name[0]}
              </div>
              <div className="flex flex-col items-start leading-tight">
                <div className="flex items-center space-x-1 space-x-reverse">
                  <span className="text-sm font-medium text-gray-300">{user.name}</span>
                  <VerifiedBadge type={(user.verified?.startsWith('pending') ? 'none' : user.verified) as any} className="w-3 h-3" />
                </div>
                <span className="text-[8px] text-yellow-600/50 uppercase tracking-widest">{user.followers.length} تابعاً</span>
              </div>
            </div>
            <button onClick={handleLogout} className="text-gray-600 hover:text-red-500 text-xs uppercase font-bold tracking-widest transition-colors">زفير (خروج)</button>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 pt-12">
        {currentView === AppView.HOME && (
          <div className="text-center mb-10 animate-fadeIn">
            <h1 className="text-6xl font-cinzel font-bold text-yellow-600 tracking-[0.2em] mb-4">ANKH</h1>
            <p className="palestine text-2xl font-bold">ندعم فلسطين 🇵🇸</p>
          </div>
        )}
        {renderView()}
      </main>

      <Navbar setPage={setCurrentView} currentPage={currentView} isAdmin={isAdmin} />

      <footer className="mt-16 text-center text-gray-900 py-12 mb-32 opacity-40">
        <SphinxLogo className="w-5 h-5 mx-auto mb-2" />
        <span className="font-cinzel text-[10px] tracking-[0.4em] uppercase">بروتوكول الشبكة الأزلية</span>
      </footer>
    </div>
  );
};

export default App;
