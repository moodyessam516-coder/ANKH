
import React from 'react';

export const Messages: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
      <div className="w-20 h-20 bg-yellow-600/10 rounded-full flex items-center justify-center mb-6 border border-yellow-600/30">
        <span className="text-4xl">💬</span>
      </div>
      <h2 className="text-2xl font-cinzel font-bold text-yellow-600 mb-2">الهمسات الأزلية</h2>
      <p className="text-gray-500 max-w-xs text-sm leading-relaxed">
        الشبكة التخاطرية قيد المزامنة حالياً. الرسائل المباشرة ستصل في العهد القادم.
      </p>
      
      <div className="mt-12 space-y-4 w-full max-w-sm">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center space-x-4 space-x-reverse p-4 rounded-2xl bg-[#111] border border-gray-800 opacity-40">
            <div className="w-12 h-12 rounded-full bg-gray-800"></div>
            <div className="flex-1 text-right">
              <div className="h-3 w-24 bg-gray-800 rounded mb-2"></div>
              <div className="h-2 w-full bg-gray-800 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
