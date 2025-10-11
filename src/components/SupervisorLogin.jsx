import React, { useState, useCallback, useMemo } from 'react';
import { supervisorAPI } from '../utils/api';

const SupervisorLogin = ({ onLogin, serverOnline }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // استخدام useCallback لمنع إعادة إنشاء الدالة في كل render
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!serverOnline) {
      setError('السيرفر غير متاح. يرجى المحاولة مرة أخرى.');
      return;
    }

    // التحقق من صحة البيانات قبل الإرسال
    if (!formData.email || !formData.password) {
      setError('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await supervisorAPI.login(formData);
      
      if (response.data?.token) {
        // استخدام try/catch لحفظ البيانات في localStorage
        try {
          localStorage.setItem('supervisorToken', response.data.token);
          localStorage.setItem('supervisorInfo', JSON.stringify(response.data.user));
          onLogin(response.data.token, response.data.user);
        } catch (storageError) {
          console.error('خطأ في حفظ البيانات:', storageError);
          setError('خطأ في حفظ بيانات الجلسة. يرجى المحاولة مرة أخرى.');
        }
      } else {
        throw new Error('لا يوجد token في الاستجابة');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message 
        || err.message 
        || 'فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [formData, serverOnline, onLogin]);

  // استخدام useCallback للدوال المعالجة
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trim()
    }));
    if (error) setError('');
  }, [error]);

  // استخدام useMemo للقيم المشتقة
  const isFormValid = useMemo(() => 
    formData.email && formData.password && serverOnline,
    [formData.email, formData.password, serverOnline]
  );

  const serverStatusConfig = useMemo(() => ({
    online: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      shadow: 'shadow-lg shadow-emerald-500/10',
      dot: 'bg-emerald-500 animate-pulse'
    },
    offline: {
      bg: 'bg-rose-50',
      text: 'text-rose-700', 
      border: 'border-rose-200',
      shadow: 'shadow-lg shadow-rose-500/10',
      dot: 'bg-rose-500'
    }
  }), []);

  const status = serverOnline ? 'online' : 'offline';

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
      {/* Overlay */}
      <div 
        className="fixed inset-0 w-full h-full z-0"
        style={{
          background: 'linear-gradient(135deg, rgba(30,58,138,0.55) 0%, rgba(2,6,23,0.65) 100%)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)'
        }}
        aria-hidden="true"
      />

      {/* Main Login Card */}
      <div className="w-full max-w-lg z-10">
        <div
          className="rounded-3xl shadow-2xl border border-white/50 overflow-hidden relative bg-cover bg-center bg-no-repeat min-h-[600px]"
          style={{
            backgroundImage: `url('photo_2025-09-15_04-00-21.jpg')`,
          }}
          role="img"
          aria-label="خلفية تسجيل الدخول"
        >
          {/* Overlay for readability */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background: 'rgba(30,41,59,0.60)',
              backdropFilter: 'blur(0.5px)',
              WebkitBackdropFilter: 'blur(0.5px)'
            }}
            aria-hidden="true"
          />

          {/* Header Section */}
          <div className="p-4 sm:p-6 md:p-8 text-center relative z-10">
            <div className="relative z-10">
              {/* Logo with better error handling */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                <img 
                  src="/OIP (4).webp" 
                  alt="شعار الشركة" 
                  className="w-full h-full object-cover rounded-lg"
                  loading="eager"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    // عرض بديل إذا فشل تحميل الصورة
                    const fallback = document.createElement('div');
                    fallback.className = 'w-full h-full flex items-center justify-center text-white text-xs';
                    fallback.textContent = 'LOGO';
                    e.target.parentNode.appendChild(fallback);
                  }}
                />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
                بوابة المشرفين
              </h1>
              <p className="text-blue-100 text-sm sm:text-lg opacity-90">
                إدارة المهام والمراجعات
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-4 sm:p-6 md:p-8 relative z-10">
            {/* Server Status */}
            <div 
              className={`mb-4 sm:mb-6 inline-flex items-center px-3 py-2 sm:px-4 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold w-full justify-center transition-all duration-300 ${
                serverStatusConfig[status].bg
              } ${serverStatusConfig[status].text} ${
                serverStatusConfig[status].border
              } ${serverStatusConfig[status].shadow}`}
              role="status"
              aria-live="polite"
            >
              <div 
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ml-2 sm:ml-3 ${
                  serverStatusConfig[status].dot
                }`}
              />
              {serverOnline ? '✓ السيرفر متصل وجاهز' : '✗ السيرفر غير متصل'}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6" noValidate>
              {/* Error Message */}
              {error && (
                <div 
                  className="p-3 sm:p-4 bg-rose-50 border border-rose-200 rounded-xl animate-shake shadow-lg"
                  role="alert"
                  aria-live="assertive"
                >
                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div className="flex-1 text-right">
                      <span className="font-bold text-rose-800 text-xs sm:text-sm block">
                        مطلوب مصادقة
                      </span>
                      <p className="text-rose-700 text-xs mt-1 leading-relaxed">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Email Field */}
              <div className="space-y-2">
                <label 
                  htmlFor="email" 
                  className="block text-xs sm:text-sm font-semibold text-blue-100 tracking-wide text-right"
                >
                  البريد الإلكتروني
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={!serverOnline || loading}
                    placeholder="supervisor@company.com"
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 pr-10 sm:pr-12 border-2 border-gray-200 rounded-xl transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white text-gray-800 placeholder-gray-400 group-hover:border-blue-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-right text-sm sm:text-base"
                    aria-required="true"
                    aria-invalid={!!error}
                  />
                  <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 transition-transform duration-300 group-hover:scale-110">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label 
                  htmlFor="password" 
                  className="block text-xs sm:text-sm font-semibold text-blue-100 tracking-wide text-right"
                >
                  كلمة المرور
                </label>
                <div className="relative group">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={!serverOnline || loading}
                    placeholder="أدخل كلمة المرور"
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 pr-10 sm:pr-12 border-2 border-gray-200 rounded-xl transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white text-gray-800 placeholder-gray-400 group-hover:border-blue-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-right text-sm sm:text-base"
                    aria-required="true"
                    aria-invalid={!!error}
                    minLength={6}
                  />
                  <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 transition-transform duration-300 group-hover:scale-110">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 sm:py-4 rounded-xl shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed group transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none disabled:hover:scale-100 mt-2"
                style={{
                  boxShadow: "0 8px 25px -5px rgba(59, 130, 246, 0.4), 0 4px 6px -2px rgba(59, 130, 246, 0.1)",
                }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs sm:text-sm">جاري المصادقة...</span>
                  </>
                ) : (
                  <>
                    <svg 
                      className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition-transform duration-200" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth={2.5} 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span className="text-xs sm:text-sm">تسجيل الدخول إلى بوابة المشرفين</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default React.memo(SupervisorLogin);