
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { geminiService } from '../services/gemini';
import { apiService } from '../services/api';
import { SendIcon, SparklesIcon, ImageIcon, TrashIcon } from './Icons';

interface CreateContentProps {
  currentUser: User;
  onComplete: () => void;
}

export const CreateContent: React.FC<CreateContentProps> = ({ currentUser, onComplete }) => {
  const [type, setType] = useState<'post' | 'reel'>('post');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEnhance = async () => {
    if (!content.trim() || isProcessing) return;
    setIsProcessing(true);
    setStatus('جاري تحسين النص...');
    const enhanced = await geminiService.enhanceContent(content);
    setContent(enhanced);
    setIsProcessing(false);
    setStatus('');
  };

  const handleManifestMedia = async () => {
    if (!content.trim() || isProcessing) return;
    setIsProcessing(true);
    try {
      if (type === 'post') {
        setStatus('جاري تجسيد صورة السجل...');
        const img = await geminiService.generateImage(content);
        if (img) {
          setMediaUrl(img);
          setMediaType('image');
        }
      } else {
        const video = await geminiService.generateVideo(content, (msg) => setStatus(msg));
        if (video) {
          setMediaUrl(video);
          setMediaType('video');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
      setStatus('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('جاري تحميل الوسائط...');
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setMediaUrl(base64String);
      setMediaType(file.type.startsWith('video') ? 'video' : 'image');
      setIsProcessing(false);
      setStatus('');
    };
    reader.readAsDataURL(file);
  };

  const triggerMediaPicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'post' ? 'image/*,video/*' : 'video/*';
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isProcessing) return;
    setIsProcessing(true);
    setStatus('جاري النشر في السجلات...');
    
    try {
      if (type === 'post') {
        await apiService.createPost({
          userId: currentUser.id,
          authorName: currentUser.name,
          content,
          imageUrl: mediaType === 'image' ? (mediaUrl || undefined) : undefined,
          videoUrl: mediaType === 'video' ? (mediaUrl || undefined) : undefined
        });
      } else {
        await apiService.createReel({
          videoUrl: mediaUrl || '',
          description: content,
          authorName: currentUser.name
        });
      }
      onComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
      setStatus('');
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-fadeIn">
      <div className="bg-[#151515] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="flex border-b border-gray-800">
          <button 
            onClick={() => { setType('post'); setMediaUrl(null); setMediaType(null); }}
            className={`flex-1 py-4 font-cinzel text-[10px] tracking-[0.3em] uppercase transition-all ${type === 'post' ? 'bg-yellow-600/10 text-yellow-600' : 'text-gray-500 hover:text-gray-300'}`}
          >
            سجل (بوست)
          </button>
          <button 
            onClick={() => { setType('reel'); setMediaUrl(null); setMediaType(null); }}
            className={`flex-1 py-4 font-cinzel text-[10px] tracking-[0.3em] uppercase transition-all ${type === 'reel' ? 'bg-yellow-600/10 text-yellow-600' : 'text-gray-500 hover:text-gray-300'}`}
          >
            رؤية (ريل)
          </button>
        </div>

        <div className="p-6">
          {mediaUrl && (
            <div className="relative group w-full aspect-[9/16] max-h-[400px] mb-6 rounded-2xl overflow-hidden bg-black border border-gray-800">
              {mediaType === 'image' ? (
                <img src={mediaUrl} className="w-full h-full object-cover opacity-90" alt="الوسائط المختارة" />
              ) : (
                <video src={mediaUrl} className="w-full h-full object-cover" controls />
              )}
              <button 
                onClick={() => { setMediaUrl(null); setMediaType(null); }}
                className="absolute top-4 left-4 bg-black/80 p-2 rounded-full hover:bg-red-500 transition-all z-10"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <textarea 
                dir="rtl"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={type === 'post' ? "بماذا تهتف روحك؟" : "صف رؤيتك للعالم..."}
                className="w-full bg-[#0a0a0a] border border-gray-800 rounded-2xl p-5 text-xl font-medium text-gray-100 placeholder-gray-700 min-h-[150px] focus:outline-none focus:border-yellow-600 transition-all resize-none text-right"
                disabled={isProcessing}
              />
              
              <div className="absolute right-4 bottom-4 flex items-center space-x-3 space-x-reverse">
                <button
                  type="button"
                  onClick={handleEnhance}
                  disabled={!content.trim() || isProcessing}
                  className="p-2 text-yellow-500/50 hover:text-yellow-500 disabled:opacity-20 transition-all"
                  title="تحسين بالذكاء الاصطناعي"
                >
                  <SparklesIcon className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleManifestMedia}
                  disabled={!content.trim() || isProcessing || !!mediaUrl}
                  className="p-2 text-amber-500/50 hover:text-amber-500 disabled:opacity-20 transition-all"
                  title="تجسيد وسائط بالذكاء الاصطناعي"
                >
                  <SparklesIcon className="w-5 h-5 fill-current" />
                </button>
                <button
                  type="button"
                  onClick={triggerMediaPicker}
                  disabled={isProcessing || !!mediaUrl}
                  className="p-2 text-blue-500/50 hover:text-blue-500 disabled:opacity-20 transition-all"
                  title="تحميل من الجهاز"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            {status && (
              <div className="flex items-center justify-center space-x-3 space-x-reverse text-yellow-600/70 text-[10px] uppercase font-bold tracking-widest animate-pulse">
                <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                <span>{status}</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={!content.trim() || isProcessing}
              className="w-full bg-yellow-600 text-black font-bold py-4 rounded-2xl font-cinzel text-xs tracking-[0.4em] uppercase disabled:opacity-50 transition-all shadow-xl hover:shadow-yellow-600/20 active:scale-95 flex items-center justify-center space-x-3 space-x-reverse"
            >
              <span>{type === 'post' ? 'نشر السجل' : 'نشر الرؤية'}</span>
              <SendIcon className="w-4 h-4 rotate-180" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
