import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SupervisorLogin from './components/SupervisorLogin';
import SupervisorDashboard from './components/SupervisorDashboard';
import { checkServerStatus, getSupervisorInfo } from './utils/api';

function App() {
  const [serverOnline, setServerOnline] = useState(false);
  const [supervisorInfo, setSupervisorInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkServerConnection();
    checkExistingAuth();
  }, []);

  const checkServerConnection = async () => {
    const status = await checkServerStatus();
    setServerOnline(status);
    setLoading(false);
  };

  const checkExistingAuth = () => {
    const info = getSupervisorInfo();
    if (info) {
      setSupervisorInfo(info);
    }
  };

  const handleLogin = (token, user) => {
    setSupervisorInfo(user);
  };

  const handleLogout = () => {
    setSupervisorInfo(null);
    localStorage.removeItem('supervisorToken');
    localStorage.removeItem('supervisorInfo');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100" dir="rtl">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-lg">جاري التحقق من اتصال السيرفر...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Route - Supervisor Login */}
          <Route 
            path="/login" 
            element={
              !supervisorInfo ? (
                <SupervisorLogin 
                  onLogin={handleLogin} 
                  serverOnline={serverOnline} 
                />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />
          
          {/* Protected Routes - Supervisor Dashboard */}
          <Route 
            path="/dashboard/*" 
            element={
              supervisorInfo ? (
                <SupervisorDashboard 
                  onLogout={handleLogout} 
                  supervisorInfo={supervisorInfo} 
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* Default redirect */}
          <Route 
            path="/" 
            element={
              <Navigate to={supervisorInfo ? "/dashboard" : "/login"} replace />
            } 
          />
          
          {/* 404 fallback */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - الصفحة غير موجودة</h1>
                  <p className="text-gray-600 mb-6">الصفحة التي تبحث عنها غير موجودة.</p>
                  <a 
                    href="/dashboard" 
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    العودة للرئيسية
                  </a>
                </div>
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;