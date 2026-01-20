
import React, { useState, useEffect, useRef } from 'react';
import { Post, Comment, User, ReactionType } from '../types';
import { HeartIcon, CommentIcon, SendIcon, ViewIcon, SphinxLogo, SparklesIcon, VerifiedBadge } from './Icons';
import { apiService } from '../services/api';

// Sound URLs (Selected for Ancient Egyptian/Pharaonic atmosphere)
const REACTION_SOUNDS: Record<ReactionType, string> = {
  ankh: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Divine Bell (Sistrum)
  heart: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', // Ancient Harp Pluck
  wow: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Deep Ritual Drum
  haha: 'https://assets.mixkit.co/active_storage/sfx/1487/1487-preview.mp3', // Reed Flute Trill
  sad: 'https://assets.mixkit.co/active_storage/sfx/1118/1118-preview.mp3' // Atmospheric Nile Wind
};

interface PostCardProps {
  post: Post & { authorVerified?: 'none' | 'blue' | 'yellow' };
  currentUser: User;
  onPostUpdate: (updatedPost: Post) => void;
  onUserUpdate?: (updatedUser: User) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onPostUpdate, onUserUpdate }) => {
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const reactionTimeout = useRef<any>(null);

  useEffect(() => {
    apiService.incrementPostView(post.id);
  }, [post.id]);

  const isRtl = /[\u0600-\u06FF]/.test(post.content) || /[\u0600-\u06FF]/.test(newComment);
  const isCurrentlyFollowing = currentUser.following.includes(post.userId);
  const isSelf = currentUser.id === post.userId;

  const playReactionSound = (type: ReactionType) => {
    const audio = new Audio(REACTION_SOUNDS[type]);
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio playback blocked by browser settings', e));
  };

  const handleReaction = async (type: ReactionType) => {
    playReactionSound(type);
    try {
      const updatedPost = await apiService.reactToPost(post.id, type);
      onPostUpdate(updatedPost);
      setShowReactions(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollow = async () => {
    if (isFollowing) return;
    setIsFollowing(true);
    try {
      const updatedUser = await apiService.followUser(currentUser.id, post.userId);
      if (onUserUpdate) onUserUpdate(updatedUser);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFollowing(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isCommenting) return;
    setIsCommenting(true);
    try {
      const comment = await apiService.addComment(post.id, currentUser.name, newComment);
      onPostUpdate({ ...post, comments: [...post.comments, comment] });
      setNewComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsCommenting(false);
    }
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const avatarSrc = (isSelf ? currentUser.avatarUrl : undefined);

  const reactionMeta: Record<ReactionType, { emoji: string; label: string; color: string; glyph: string }> = {
    ankh: { emoji: '☥', label: 'حياة (Ankh)', color: 'text-yellow-500', glyph: '𓋹' },
    heart: { emoji: '❤️', label: 'حب (Ka)', color: 'text-red-500', glyph: '𓄣' },
    wow: { emoji: '👁️', label: 'دهشة (Ra)', color: 'text-blue-400', glyph: '𓁺' },
    haha: { emoji: '𓀠', label: 'فرح (Joy)', color: 'text-green-400', glyph: '𓀠' },
    sad: { emoji: '𓁹', label: 'حزن (Nile)', color: 'text-purple-400', glyph: '𓁹' }
  };

  const totalReactions = (Object.values(post.reactions || {}) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-[#151515] border border-gray-800 rounded-2xl overflow-hidden mb-8 hover:border-yellow-600/30 transition-all duration-500 group shadow-2xl hover:shadow-yellow-900/10 animate-fadeIn">
      {/* Media Content */}
      {post.imageUrl && (
        <div className="w-full h-80 overflow-hidden bg-gray-900 border-b border-gray-800 relative">
          <img src={post.imageUrl} alt="Chronicle" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-95" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-transparent to-transparent opacity-60"></div>
        </div>
      )}
      {post.videoUrl && (
        <div className="w-full h-auto overflow-hidden bg-gray-900 border-b border-gray-800 relative">
          <video src={post.videoUrl} className="w-full h-full object-contain max-h-[500px]" controls playsInline />
        </div>
      )}

      <div className="p-7">
        {/* Header */}
        <div className={`flex items-center mb-6 ${isRtl ? 'flex-row-reverse space-x-reverse' : 'space-x-4'}`}>
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-yellow-700 via-yellow-600 to-amber-900 flex items-center justify-center text-white font-bold text-2xl shadow-inner border border-yellow-500/20 shrink-0">
            {avatarSrc ? <img src={avatarSrc} className="w-full h-full object-cover" alt={post.authorName} /> : post.authorName[0]}
          </div>
          <div className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
            <div className={`flex items-center ${isRtl ? 'flex-row-reverse space-x-reverse' : 'space-x-3'}`}>
              <h4 className="font-bold text-gray-100 text-lg tracking-tight font-cinzel">{post.authorName}</h4>
              <VerifiedBadge type={post.authorVerified || 'none'} />
              {!isSelf && (
                <button onClick={handleFollow} disabled={isFollowing} className={`text-[9px] font-bold px-4 py-1.5 rounded-full transition-all border uppercase tracking-widest ${isCurrentlyFollowing ? 'border-gray-700 text-gray-500 hover:text-red-500' : 'border-yellow-600/40 text-yellow-600 hover:bg-yellow-600 hover:text-black'}`}>
                  {isFollowing ? '...' : (isCurrentlyFollowing ? 'إلغاء المتابعة' : 'متابعة')}
                </button>
              )}
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-bold">{formattedDate}</span>
          </div>
        </div>

        {/* Content */}
        <p dir={isRtl ? 'rtl' : 'ltr'} className={`text-gray-200 leading-relaxed mb-8 whitespace-pre-wrap text-xl ${isRtl ? 'text-right font-medium' : 'text-left font-light'}`}>
          {post.content}
        </p>

        {/* Interaction Bar */}
        <div className={`flex items-center pt-5 border-t border-gray-800/60 space-x-8 relative ${isRtl ? 'flex-row-reverse space-x-reverse' : ''}`}>
          
          {/* Reaction Menu */}
          <div className="relative" 
            onMouseEnter={() => { clearTimeout(reactionTimeout.current); setShowReactions(true); }} 
            onMouseLeave={() => { reactionTimeout.current = setTimeout(() => setShowReactions(false), 400); }}
          >
            <button className={`flex items-center space-x-2 transition-all duration-300 ${totalReactions > 0 ? 'text-yellow-600 scale-110' : 'text-gray-500 hover:text-yellow-600'}`}>
              <SphinxLogo className={`w-6 h-6 ${totalReactions > 0 ? 'fill-yellow-600/30' : ''}`} />
              <span className="text-sm font-bold font-mono">{totalReactions}</span>
            </button>

            {showReactions && (
              <div className="absolute bottom-full left-0 mb-4 bg-[#1a1a1a]/95 backdrop-blur-md border border-yellow-600/20 rounded-full py-2.5 px-5 flex items-center space-x-5 shadow-[0_10px_30px_rgba(0,0,0,0.8)] animate-fadeIn z-30">
                {(Object.keys(reactionMeta) as ReactionType[]).map(type => (
                  <button 
                    key={type} 
                    onClick={() => handleReaction(type)} 
                    className="transform transition-all hover:scale-150 active:scale-90 group relative flex flex-col items-center"
                  >
                    <span className={`text-2xl ${reactionMeta[type].color} hover:drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]`}>
                      {reactionMeta[type].emoji}
                    </span>
                    <div className="absolute bottom-full mb-3 bg-black/90 text-yellow-600 text-[9px] px-2 py-1 rounded border border-yellow-600/30 opacity-0 group-hover:opacity-100 whitespace-nowrap font-cinzel tracking-widest uppercase pointer-events-none">
                      {reactionMeta[type].label}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-2 text-gray-500 hover:text-yellow-600 transition-all duration-300">
            <CommentIcon className="w-6 h-6" />
            <span className="text-sm font-bold font-mono">{post.comments.length}</span>
          </button>

          <div className="flex items-center space-x-2 text-gray-700">
            <ViewIcon className="w-6 h-6" />
            <span className="text-sm font-bold font-mono">{post.views || 0}</span>
          </div>

          {/* Individual Reaction Counts (Small Glyphs) */}
          <div className={`flex flex-wrap gap-3 ${isRtl ? 'mr-auto' : 'ml-auto'}`}>
            {(Object.entries(post.reactions || {}) as [ReactionType, number][]).filter(([_, count]) => count > 0).map(([type, count]) => (
              <span key={type} className={`text-[11px] ${reactionMeta[type].color} bg-black/40 px-2 py-0.5 rounded-lg border border-gray-800/50 flex items-center space-x-1.5`}>
                <span className="text-[14px] leading-none">{reactionMeta[type].glyph}</span>
                <span className="font-mono font-bold">{count}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-8 pt-8 border-t border-gray-800/40 space-y-5 animate-fadeIn">
            <div className="space-y-4 max-h-72 overflow-y-auto pr-3 custom-scrollbar">
              {post.comments.length > 0 ? post.comments.map(comment => (
                <div key={comment.id} className={`flex items-start space-x-4 ${/[\u0600-\u06FF]/.test(comment.text) ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-[11px] font-bold text-gray-500 shrink-0">
                    {comment.authorName[0]}
                  </div>
                  <div className={`flex-1 bg-black/40 p-4 rounded-2xl border border-gray-800/40 ${/[\u0600-\u06FF]/.test(comment.text) ? 'text-right' : 'text-left'}`}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-gray-100">{comment.authorName}</span>
                      <span className="text-[9px] text-gray-600 uppercase tracking-tighter font-mono">
                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              )) : (
                <p className="text-center py-6 text-gray-700 text-[10px] uppercase tracking-widest italic">The scrolls of conversation are silent.</p>
              )}
            </div>

            <form onSubmit={handleAddComment} className={`flex items-center space-x-4 mt-6 ${isRtl ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className="w-10 h-10 rounded-full overflow-hidden bg-yellow-600/10 flex items-center justify-center border border-yellow-600/30 shrink-0">
                {currentUser.avatarUrl ? <img src={currentUser.avatarUrl} className="w-full h-full object-cover" alt={currentUser.name} /> : currentUser.name[0]}
              </div>
              <input 
                dir={isRtl ? 'rtl' : 'ltr'} 
                type="text" 
                value={newComment} 
                onChange={(e) => setNewComment(e.target.value)} 
                placeholder="أضف تعليقًا مباركًا..." 
                className="flex-1 bg-[#0a0a0a] border border-gray-800 rounded-full px-5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-yellow-600 transition-all placeholder-gray-700" 
              />
              <button 
                type="submit" 
                disabled={!newComment.trim() || isCommenting} 
                className="bg-yellow-600/10 hover:bg-yellow-600 text-yellow-600 hover:text-black font-bold px-5 py-2.5 rounded-full text-[10px] tracking-widest uppercase transition-all border border-yellow-600/30 flex items-center space-x-2"
              >
                <span>تعليق</span> 
                <SendIcon className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
