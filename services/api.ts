
import { User, Post, Comment, Reel, ReactionType } from '../types';

const STORAGE_KEYS = {
  USERS: 'ankh_users',
  POSTS: 'ankh_posts',
  AUTH: 'ankh_auth',
  REELS: 'ankh_reels'
};

const getStorage = <T,>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setStorage = <T,>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

const initialReactions = { ankh: 0, heart: 0, wow: 0, haha: 0, sad: 0 };

export const apiService = {
  register: async (userData: any): Promise<string> => {
    const users = getStorage<any[]>(STORAGE_KEYS.USERS, []);
    
    if (users.find(u => u.email === userData.email)) {
      throw new Error("هذا البريد الإلكتروني مسجل بالفعل");
    }

    const newUser: User = { 
      ...userData, 
      id: Math.random().toString(36).substr(2, 9),
      followers: [],
      following: [],
      joinedAt: new Date().toISOString(),
      verified: 'none'
    };
    users.push(newUser);
    setStorage(STORAGE_KEYS.USERS, users);
    return "User created";
  },

  login: async (credentials: any): Promise<{ token: string; user: User }> => {
    const users = getStorage<any[]>(STORAGE_KEYS.USERS, []);
    
    // حساب المسؤول الافتراضي (صانع البرنامج)
    if (credentials.email === 'admin@ankh.io' && credentials.password === 'Ankh@Creator2025!') {
      let adminUser = users.find(u => u.id === 'admin');
      if (!adminUser) {
        adminUser = {
          id: 'admin',
          name: 'صانع البرنامج',
          email: 'admin@ankh.io',
          birthDate: '1990-01-01',
          followers: [],
          following: [],
          joinedAt: new Date().toISOString(),
          verified: 'yellow',
          bio: 'أنا صانع هذه الشبكة الأزلية.'
        };
        users.push(adminUser);
        setStorage(STORAGE_KEYS.USERS, users);
      }
      return { token: "master_key_ankh", user: adminUser };
    }

    const user = users.find(u => u.email === credentials.email);
    if (!user) throw new Error("المستخدم غير موجود");
    if (user.password !== credentials.password) throw new Error("كلمة المرور خاطئة");
    
    return { token: "mock_" + user.id, user };
  },

  updateUserProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
    const users = getStorage<any[]>(STORAGE_KEYS.USERS, []);
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error("المستخدم غير موجود");
    
    users[index] = { ...users[index], ...updates };
    setStorage(STORAGE_KEYS.USERS, users);
    return users[index];
  },

  requestVerification: async (userId: string, type: 'blue' | 'yellow'): Promise<User> => {
    const status = type === 'blue' ? 'pending_blue' : 'pending_yellow';
    return await apiService.updateUserProfile(userId, { verified: status as any });
  },

  getPendingVerifications: async (): Promise<User[]> => {
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, []);
    return users.filter(u => u.verified?.startsWith('pending_'));
  },

  adminActionOnVerification: async (userId: string, action: 'approve' | 'reject'): Promise<void> => {
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, []);
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return;

    if (action === 'approve') {
      const current = users[index].verified;
      users[index].verified = current === 'pending_yellow' ? 'yellow' : 'blue';
    } else {
      users[index].verified = 'none';
    }

    setStorage(STORAGE_KEYS.USERS, users);
  },

  followUser: async (currentUserId: string, targetUserId: string): Promise<User> => {
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, []);
    const cIndex = users.findIndex(u => u.id === currentUserId);
    const tIndex = users.findIndex(u => u.id === targetUserId);
    if (cIndex === -1 || tIndex === -1) throw new Error("خطأ في المتابعة");
    
    const isFollowing = users[cIndex].following.includes(targetUserId);
    if (isFollowing) {
      users[cIndex].following = users[cIndex].following.filter(id => id !== targetUserId);
      users[tIndex].followers = users[tIndex].followers.filter(id => id !== currentUserId);
    } else {
      users[cIndex].following.push(targetUserId);
      users[tIndex].followers.push(currentUserId);
    }
    setStorage(STORAGE_KEYS.USERS, users);
    return users[cIndex];
  },

  createPost: async (postData: any): Promise<Post> => {
    const posts = getStorage<Post[]>(STORAGE_KEYS.POSTS, []);
    const newPost = { id: Math.random().toString(36).substr(2, 9), ...postData, reactions: {...initialReactions}, views: 0, comments: [], createdAt: new Date().toISOString() };
    posts.unshift(newPost);
    setStorage(STORAGE_KEYS.POSTS, posts);
    return newPost;
  },

  getPosts: async (): Promise<Post[]> => {
    const posts = getStorage<Post[]>(STORAGE_KEYS.POSTS, []);
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, []);
    return posts.map(p => ({ ...p, authorVerified: users.find(u => u.id === p.userId)?.verified || 'none' }));
  },

  getUserPosts: async (userId: string) => (await apiService.getPosts()).filter(p => p.userId === userId),
  getReels: async () => getStorage<Reel[]>(STORAGE_KEYS.REELS, []),
  createReel: async (data: any) => {
    const reels = getStorage<Reel[]>(STORAGE_KEYS.REELS, []);
    const r = { id: Math.random().toString(36).substr(2, 9), ...data, likes: 0, views: 0 };
    reels.unshift(r); setStorage(STORAGE_KEYS.REELS, reels); return r;
  },
  reactToPost: async (id: string, r: ReactionType) => {
    const posts = getStorage<Post[]>(STORAGE_KEYS.POSTS, []);
    const i = posts.findIndex(p => p.id === id);
    if (i !== -1) { posts[i].reactions[r]++; setStorage(STORAGE_KEYS.POSTS, posts); return posts[i]; }
    throw new Error("Post not found");
  },
  incrementPostView: async (id: string) => {
    const posts = getStorage<Post[]>(STORAGE_KEYS.POSTS, []);
    const i = posts.findIndex(p => p.id === id);
    if (i !== -1) { posts[i].views++; setStorage(STORAGE_KEYS.POSTS, posts); }
  },
  addComment: async (id: string, name: string, text: string) => {
    const posts = getStorage<Post[]>(STORAGE_KEYS.POSTS, []);
    const i = posts.findIndex(p => p.id === id);
    const c = { id: Math.random().toString(36).substr(2, 9), authorName: name, text, createdAt: new Date().toISOString() };
    posts[i].comments.push(c); setStorage(STORAGE_KEYS.POSTS, posts); return c;
  }
};
