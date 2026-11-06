import React, { useState } from 'react';
import {
  X,
  User,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    login,
    register,
    resetPassword,
  } = useStore();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Password reset state
  const [newPassword, setNewPassword] = useState('');
  const [stepForgot, setStepForgot] = useState<'request' | 'reset'>('request');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setErrorMsg('');
    setSuccessMsg('');
    setMode('login');
    setStepForgot('request');
  };

  // Strict email validation supporting any valid domain (.com, .ma, .fr, .net, etc.)
  const isValidEmail = (emailStr: string): boolean => {
    const trimmed = emailStr.trim();
    if (!trimmed || trimmed.length < 5) return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(trimmed);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setErrorMsg('يرجى إدخال البريد الإلكتروني.');
      return;
    }

    if (!cleanEmail.includes('@')) {
      setErrorMsg('صيغة البريد الإلكتروني غير صحيحة: الرمز @ مفقود في العنوان.');
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setErrorMsg('صيغة البريد الإلكتروني غير مكتملة أو غير صالحة. يرجى كتابة عنوان صحيح (مثال: name@gmail.com أو contact@store.ma).');
      return;
    }

    if (!password) {
      setErrorMsg('يرجى إدخال كلمة المرور.');
      return;
    }

    setLoading(true);
    const result = login(email, password);
    setLoading(false);

    if (result.success) {
      if (result.role === 'admin') {
        setSuccessMsg('تم التحقق بنجاح! مرحباً بك مدير المتجر. جاري فتح لوحة التحكم...');
        setTimeout(() => {
          handleClose();
        }, 700);
      } else {
        setSuccessMsg('تم تسجيل الدخول بنجاح! مرحباً بك في دار الأواني.');
        setTimeout(() => {
          handleClose();
        }, 700);
      }
    } else {
      setErrorMsg(result.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة.');
    }
  };


  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password.length < 6) {
      setErrorMsg('كلمة المرور يجب أن تكون 6 أحرف أو أرقام على الأقل.');
      return;
    }

    setLoading(true);
    const result = register(name, email, password, phone);
    setLoading(false);

    if (result.success) {
      setSuccessMsg('تم إنشاء حسابك بنجاح! مرحباً بك في دار الأواني.');
      setTimeout(() => {
        handleClose();
      }, 1000);
    } else {
      setErrorMsg(result.message || 'حدث خطأ أثناء إنشاء الحساب.');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (stepForgot === 'request') {
      const result = resetPassword(email);
      if (result.success) {
        setSuccessMsg(result.message);
        setStepForgot('reset');
      } else {
        setErrorMsg(result.message);
      }
    } else {
      if (newPassword.length < 6) {
        setErrorMsg('كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف.');
        return;
      }
      const result = resetPassword(email, newPassword);
      if (result.success) {
        setSuccessMsg(result.message);
        setTimeout(() => {
          setMode('login');
          setStepForgot('request');
          setSuccessMsg('');
        }, 1500);
      } else {
        setErrorMsg(result.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 text-right">
      <div
        className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 p-2 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-600 transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Icon & Heading */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
            أ
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-stone-900">
            {mode === 'login' && 'تسجيل الدخول'}
            {mode === 'register' && 'إنشاء حساب جديد'}
            {mode === 'forgot' && 'استرجاع كلمة المرور'}
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            {mode === 'login' && 'أدخل بريدك الإلكتروني وكلمة المرور للمتابعة'}
            {mode === 'register' && 'سجل حسابك لتتبع طلبياتك وحفظ عناوين التوصيل'}
            {mode === 'forgot' && 'أدخل عنوان بريدك المسجل لإعادة تعيين كلمة المرور'}
          </p>
        </div>

        {/* Notifications Banners */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs font-semibold text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                البريد الإلكتروني (Gmail) *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  dir="ltr"
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-amber-600 focus:outline-none text-left"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-stone-700">
                  كلمة المرور *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-[11px] font-semibold text-amber-700 hover:text-amber-900"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  dir="ltr"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-amber-600 focus:outline-none text-left"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>تسجيل الدخول</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-4 border-t border-stone-100 text-center">
              <p className="text-stone-500 text-xs">
                ليس لديك حساب بعد؟{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="font-bold text-amber-700 hover:text-amber-900 underline mr-1"
                >
                  إنشاء حساب جديد
                </button>
              </p>
            </div>
          </form>
        )}

        {/* 2. REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                الاسم الكامل *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="مثال: يوسف العلمي"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-amber-600 focus:outline-none"
                />
                <User className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                البريد الإلكتروني (Gmail) *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  dir="ltr"
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-amber-600 focus:outline-none text-left"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                رقم الهاتف (للتوصيل) *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  dir="ltr"
                  placeholder="06 XX XX XX XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-amber-600 focus:outline-none text-left"
                />
                <Phone className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                كلمة المرور (6 أحرف على الأقل) *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  dir="ltr"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-amber-600 focus:outline-none text-left"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>إنشاء الحساب الآن</span>
            </button>

            <div className="pt-4 border-t border-stone-100 text-center">
              <p className="text-stone-500 text-xs">
                لديك حساب بالفعل؟{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="font-bold text-amber-700 hover:text-amber-900 underline mr-1"
                >
                  تسجيل الدخول
                </button>
              </p>
            </div>
          </form>
        )}

        {/* 3. FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                أدخل البريد الإلكتروني (Gmail) المسجل *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  dir="ltr"
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-amber-600 focus:outline-none text-left"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {stepForgot === 'reset' && (
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  أدخل كلمة المرور الجديدة *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    dir="ltr"
                    placeholder="كلمة المرور الجديدة..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-amber-600 focus:outline-none text-left"
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{stepForgot === 'request' ? 'إرسال رابط الاسترجاع' : 'تعيين كلمة المرور الجديدة'}</span>
            </button>

            <div className="pt-4 border-t border-stone-100 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="font-bold text-stone-600 hover:text-stone-900"
              >
                العودة إلى تسجيل الدخول
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
