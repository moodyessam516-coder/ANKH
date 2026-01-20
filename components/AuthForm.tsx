
import React, { useState } from 'react';
import { AuthView } from '../types';
import { SphinxLogo } from './Icons';

interface AuthFormProps {
  onLogin: (credentials: any) => Promise<void>;
  onRegister: (data: any) => Promise<void>;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onLogin, onRegister }) => {
  const [view, setView] = useState<AuthView>(AuthView.LOGIN);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    birthDate: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validatePassword = (pass: string) => {
    // Strong password regex: min 8 chars, 1 letter, 1 number, 1 special char
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return regex.test(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (view === AuthView.LOGIN) {
        await onLogin({ email: formData.email, password: formData.password });
      } else {
        // Validation for registration
        if (!formData.birthDate) {
          throw new Error("يرجى إدخال تاريخ ميلادك للمضي قدماً.");
        }
        
        if (!validatePassword(formData.password)) {
          throw new Error("كلمة المرور ضعيفة. يجب أن تحتوي على 8 أحرف على الأقل، أرقام، ورموز خاصة (@$!%*#?&).");
        }

        await onRegister(formData);
        setView(AuthView.LOGIN);
      }
    } catch (err: any) {
      setError(err.message || 'فشلت عملية التحقق');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a]">
      <div className="max-w-md w-full bg-[#151515] border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-yellow-600/10 rounded-full flex items-center justify-center mb-4 border border-yellow-600/30">
            <SphinxLogo className="w-10 h-10 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-cinzel font-bold text-yellow-600 tracking-widest">ANKH</h1>
          <p className="text-gray-500 text-sm mt-2">اتصل بالشبكة الأزلية</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-xs mb-6 text-center leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {view === AuthView.REGISTER && (
            <>
              <div>
                <label className="block text-gray-400 text-[10px] uppercase tracking-wider font-bold mb-1 mr-1">الهوية (الاسم الكامل)</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-600 text-white transition-all text-right text-sm"
                  placeholder="الاسم أو اللقب"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-gray-400 text-[10px] uppercase tracking-wider font-bold mb-1 mr-1">تاريخ الميلاد</label>
                <input
                  type="date"
                  required
                  className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-600 text-white transition-all text-right text-sm appearance-none"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-gray-400 text-[10px] uppercase tracking-wider font-bold mb-1 mr-1">الختم الإلكتروني (البريد)</label>
            <input
              type="email"
              required
              className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-600 text-white transition-all text-right text-sm"
              placeholder="البريد الإلكتروني"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-gray-400 text-[10px] uppercase tracking-wider font-bold mb-1 mr-1">مفتاح السر (كلمة المرور)</label>
            <input
              type="password"
              required
              className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-600 text-white transition-all text-right text-sm"
              placeholder="كلمة المرور"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            {view === AuthView.REGISTER && (
              <p className="text-[9px] text-gray-600 mt-1 mr-1">يجب أن تكون 8 أحرف على الأقل، تشمل أرقام ورموز خاصة.</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded-xl transition-all shadow-lg shadow-yellow-600/10 active:scale-95 disabled:opacity-50 font-cinzel text-sm uppercase tracking-widest mt-6"
          >
            {isLoading ? 'جاري التحقق...' : view === AuthView.LOGIN ? 'الصعود إلى الجوهر' : 'إنشاء الختم المقدس'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          {view === AuthView.LOGIN ? (
            <p>
              جديد في الأخوية؟{' '}
              <button onClick={() => setView(AuthView.REGISTER)} className="text-yellow-600 font-bold hover:underline">
                ابدأ رحلتك
              </button>
            </p>
          ) : (
            <p>
              لديك ختم بالفعل؟{' '}
              <button onClick={() => setView(AuthView.LOGIN)} className="text-yellow-600 font-bold hover:underline">
                ادخل إلى الجوهر
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
