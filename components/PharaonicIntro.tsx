
import React, { useEffect, useState } from 'react';
import { AnkhLogo, SphinxLogo } from './Icons';

interface PharaonicIntroProps {
  onFinish: () => void;
}

export const PharaonicIntro: React.FC<PharaonicIntroProps> = ({ onFinish }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // تشغيل الصوت الفرعوني
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    audio.volume = 0.4;
    audio.play().catch(e => console.log("Audio waiting for interaction"));

    const timers = [
      setTimeout(() => setStage(1), 500),   // ظهور الشعار
      setTimeout(() => setStage(2), 1500),  // ظهور النص
      setTimeout(() => setStage(3), 3500),  // بدء الاختفاء
      setTimeout(() => onFinish(), 4500),   // النهاية
    ];

    return () => timers.forEach(clearTimeout);
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center transition-opacity duration-1000 ${stage === 3 ? 'opacity-0' : 'opacity-100'}`}>
      {/* Mystical Background Patterns */}
      <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/egyptian-hieroglyphs.png")` }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-900/10 to-transparent"></div>
      </div>

      {/* Central Animation */}
      <div className="relative">
        {/* Glow Effect */}
        <div className={`absolute inset-0 bg-yellow-600 rounded-full blur-[100px] transition-all duration-1000 ${stage >= 1 ? 'opacity-20 scale-150' : 'opacity-0 scale-50'}`}></div>
        
        <div className={`relative transition-all duration-1000 transform ${stage >= 1 ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-150 rotate-12'}`}>
          <AnkhLogo className="w-32 h-32 text-yellow-600 drop-shadow-[0_0_30px_rgba(202,138,4,0.6)]" />
        </div>
      </div>

      <div className={`mt-12 text-center transition-all duration-1000 ${stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h1 className="text-5xl font-cinzel font-bold text-yellow-600 tracking-[0.4em] mb-4">ANKH</h1>
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-yellow-600/50 to-transparent mx-auto mb-4"></div>
        <p className="text-gray-500 font-cinzel text-xs uppercase tracking-[0.6em] animate-pulse">محراب التواصل الأزلي</p>
      </div>

      {/* Loading Bar (Ritual Line) */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-0.5 bg-gray-900 overflow-hidden rounded-full">
        <div className="h-full bg-yellow-600 animate-[ritual_4s_ease-in-out_forwards]"></div>
      </div>

      <style>{`
        @keyframes ritual {
          0% { width: 0%; opacity: 0; }
          20% { width: 10%; opacity: 1; }
          100% { width: 100%; opacity: 1; }
        }
      `}</style>
    </div>
  );
};
