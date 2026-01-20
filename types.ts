
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  bio?: string;
  avatarUrl?: string;
  birthDate: string;
  followers: string[];
  following: string[];
  joinedAt: string;
  verified?: 'none' | 'blue' | 'yellow' | 'pending_blue' | 'pending_yellow';
}

export interface Comment {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export type ReactionType = 'ankh' | 'heart' | 'wow' | 'haha' | 'sad';

export interface Post {
  id: string;
  userId: string;
  authorName: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  likes: number;
  reactions: Record<ReactionType, number>;
  views: number;
  comments: Comment[];
  createdAt: string;
}

export interface Reel {
  id: string;
  videoUrl: string;
  description: string;
  authorName: string;
  likes: number;
  views: number;
}

export enum AppView {
  HOME = 'home',
  REELS = 'reels',
  CREATE = 'create',
  MESSAGES = 'messages',
  PROFILE = 'profile',
  ADMIN = 'admin',
}

export enum AuthView {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
}
