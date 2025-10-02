import React, { useState } from 'react';
import { supervisorAPI } from '../utils/api';

const SupervisorLogin = ({ onLogin, serverOnline }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!serverOnline) {
      setError('السيرفر غير متاح. يرجى المحاولة مرة أخرى.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await supervisorAPI.login(formData);
      
      if (response.data.token) {
        // حفظ الـ Token ومعلومات المستخدم
        localStorage.setItem('supervisorToken', response.data.token);
        localStorage.setItem('supervisorInfo', JSON.stringify(response.data.user));
        onLogin(response.data.token, response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

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
      ></div>

      {/* Main Login Card */}
      <div className="w-full max-w-lg z-10">
        <div
          className="rounded-3xl shadow-2xl border border-white/50 overflow-hidden relative"
          style={{
            backgroundImage: `url('photo_2025-09-15_04-00-21.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Overlay for readability */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background: 'rgba(30,41,59,0.60)',
              backdropFilter: 'blur(0.5px)',
              WebkitBackdropFilter: 'blur(0.5px)'
            }}
          ></div>

          {/* Header Section */}
          <div className="p-8 text-center relative z-10">
            <div className="relative z-10">
              {/* Logo */}
              <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 ">
                <img 
                  src="/OIP (4).webp" 
                  alt="Company Logo" 
                  className="w-full h-full object-fit rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">بوابة المشرفين</h1>
              <p className="text-blue-100 text-lg">إدارة المهام والمراجعات</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8 relative z-10">
            {/* Server Status */}
            <div className={`mb-6 inline-flex items-center px-4 py-3 rounded-xl text-sm font-semibold w-full justify-center transition-all duration-300 ${
              serverOnline 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-lg shadow-emerald-500/10' 
                : 'bg-rose-50 text-rose-700 border border-rose-200 shadow-lg shadow-rose-500/10'
            }`}>
              <div className={`w-3 h-3 rounded-full ml-3 ${
                serverOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}></div>
              {serverOnline ? '✓ السيرفر متصل وجاهز' : '✗ السيرفر غير متصل'}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl animate-shake shadow-lg">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-rose-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div className="flex-1">
                      <span className="font-bold text-rose-800 text-sm block">مطلوب مصادقة</span>
                      <p className="text-rose-700 text-xs mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-blue-100 tracking-wide text-right">
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
                    disabled={!serverOnline}
                    placeholder="supervisor@company.com"
                    className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-xl transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white text-gray-800 placeholder-gray-400 group-hover:border-blue-300 shadow-sm focus:border-blue-500 focus:ring-0 focus:outline-none focus:shadow-lg focus:shadow-blue-500/20 text-right"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 transition-transform duration-300 group-hover:scale-110">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-blue-100 tracking-wide text-right">
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
                    disabled={!serverOnline}
                    placeholder="أدخل كلمة المرور"
                    className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-xl transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white text-gray-800 placeholder-gray-400 group-hover:border-blue-300 shadow-sm focus:border-blue-500 focus:ring-0 focus:outline-none focus:shadow-lg focus:shadow-blue-500/20 text-right"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 transition-transform duration-300 group-hover:scale-110">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading || !serverOnline}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 text-base tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed group transform hover:scale-[1.02] active:scale-[0.98] mt-2"
                style={{
                  boxShadow: "0 8px 25px -5px rgba(59, 130, 246, 0.4), 0 4px 6px -2px rgba(59, 130, 246, 0.1)",
                }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري المصادقة...</span>
                  </>
                ) : (
                  <>
                    <svg 
                      className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth={2.5} 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span>تسجيل الدخول إلى بوابة المشرفين</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Add custom animations to index.css */}
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

export default SupervisorLogin;