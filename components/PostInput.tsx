
import React, { useState, useRef } from 'react';
import { SendIcon, SparklesIcon, ImageIcon, TrashIcon } from './Icons';
import { geminiService } from '../services/gemini';
import { User } from '../types';

interface PostInputProps {
  onPost: (content: string, imageUrl?: string, videoUrl?: string) => Promise<void>;
  currentUser: User;
}

export const PostInput: React.FC<PostInputProps> = ({ onPost, currentUser }) => {
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string | undefined>(undefined);
  const [mediaType, setMediaType] = useState<'image' | 'video' | undefined>(undefined);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isManifesting, setIsManifesting] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEnhance = async () => {
    if (!content.trim() || isEnhancing) return;
    setIsEnhancing(true);
    const enhanced = await geminiService.enhanceContent(content);
    setContent(enhanced);
    setIsEnhancing(false);
  };

  const handleManifestImage = async () => {
    if (!content.trim() || isManifesting) return;
    setIsManifesting(true);
    try {
      const img = await geminiService.generateImage(content);
      if (img) {
        setMediaUrl(img);
        setMediaType('image');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsManifesting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setMediaUrl(base64String);
      setMediaType(file.type.startsWith('video') ? 'video' : 'image');
    };
    reader.readAsDataURL(file);
  };

  const triggerMediaPicker = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isPosting) return;
    setIsPosting(true);
    await onPost(content, mediaType === 'image' ? mediaUrl : undefined, mediaType === 'video' ? mediaUrl : undefined);
    setContent('');
    setMediaUrl(undefined);
    setMediaType(undefined);
    setIsPosting(false);
  };

  return (
    <div className="bg-[#151515] border border-gray-800 rounded-xl overflow-hidden mb-8 shadow-2xl transition-all border-t-2 border-t-yellow-600/20">
      {mediaUrl && (
        <div className="relative group w-full h-auto max-h-[400px] bg-black overflow-hidden border-b border-gray-800">
          {mediaType === 'image' ? (
            <img src={mediaUrl} alt="التجسيد الرقمي" className="w-full h-full object-cover opacity-80" />
          ) : (
            <video src={mediaUrl} className="w-full h-full object-contain" controls />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-transparent to-transparent opacity-60 pointer-events-none"></div>
          <button 
            type="button"
            onClick={() => { setMediaUrl(undefined); setMediaType(undefined); }}
            className="absolute top-3 right-3 bg-black/80 hover:bg-red-500/90 p-2.5 rounded-full text-white transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm z-10"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start space-x-4 space-x-reverse">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-yellow-600 to-amber-800 flex items-center justify-center text-white font-bold shrink-0 shadow-[0_0_15px_rgba(217,119,6,0.2)] border border-yellow-500/20">
            {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} className="w-full h-full object-cover" alt={currentUser.name} />
            ) : (
              currentUser.name[0]
            )}
          </div>
          <form onSubmit={handleSubmit} className="flex-1 text-right">
            <textarea
              dir="rtl"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="بماذا تهتف روحك اليوم؟"
              className="w-full bg-transparent text-gray-100 placeholder-gray-600 border-none focus:ring-0 resize-none min-h-[90px] text-xl font-medium leading-relaxed"
            />
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-800/50">
              <button
                type="submit"
                disabled={!content.trim() || isPosting || isManifesting}
                className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold px-8 py-2.5 rounded-full flex items-center space-x-2 space-x-reverse disabled:opacity-50 transition-all shadow-lg hover:shadow-yellow-600/30 active:scale-95 group"
              >
                <span className="font-cinzel text-sm uppercase tracking-widest">نشر</span>
                <SendIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform rotate-180" />
              </button>

              <div className="flex items-center space-x-5 space-x-reverse">
                <button
                  type="button"
                  onClick={triggerMediaPicker}
                  disabled={isManifesting || isEnhancing || !!mediaUrl}
                  className="flex items-center space-x-2 space-x-reverse text-blue-500/70 hover:text-blue-400 disabled:opacity-30 transition-all"
                  title="تحميل من الاستوديو"
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">تحميل</span>
                  <ImageIcon className="w-5 h-5" />
                </button>
                
                <button
                  type="button"
                  onClick={handleManifestImage}
                  disabled={!content.trim() || isManifesting || isEnhancing || !!mediaUrl}
                  className="flex items-center space-x-2 space-x-reverse text-amber-500/70 hover:text-amber-400 disabled:opacity-30 transition-all"
                  title="تجسيد رؤية الذكاء الاصطناعي"
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">تجسيد</span>
                  <SparklesIcon className={`w-5 h-5 ${isManifesting ? 'animate-pulse' : ''} fill-current`} />
                </button>
                <button
                  type="button"
                  onClick={handleEnhance}
                  disabled={!content.trim() || isEnhancing || isManifesting}
                  className="flex items-center space-x-2 space-x-reverse text-yellow-500/70 hover:text-yellow-400 disabled:opacity-30 transition-all"
                  title="تحسين النص"
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">تحسين</span>
                  <SparklesIcon className={`w-5 h-5 ${isEnhancing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
