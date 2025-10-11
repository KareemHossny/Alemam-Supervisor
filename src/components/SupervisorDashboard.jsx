import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiMenu,
  FiX,
  FiLogOut,
  FiEye,
  FiUser,
  FiBarChart2,
  FiBriefcase,
  FiCheckCircle,
  FiClock
} from 'react-icons/fi';
import ReviewTasks from './ReviewTasks';
import ReviewDailyTasks from './ReviewDailyTasks';
import ReviewMonthlyTasks from './ReviewMonthlyTasks';
import { supervisorAPI } from '../utils/api';

const SupervisorDashboard = ({ onLogout, supervisorInfo }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    pendingReviews: 0,
    reviewedTasks: 0,
    totalEngineers: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const projectsResponse = await supervisorAPI.getMyProjects();
      const projects = projectsResponse.data;
      
      let pendingReviews = 0;
      let reviewedTasks = 0;
      let totalEngineers = new Set();

      // جمع البيانات من جميع المشاريع
      const tasksPromises = projects.map(async (project) => {
        try {
          const [dailyTasksResponse, monthlyTasksResponse] = await Promise.all([
            supervisorAPI.getDailyTasks(project._id),
            supervisorAPI.getMonthlyTasks(project._id)
          ]);
          
          const dailyTasks = dailyTasksResponse.data;
          const monthlyTasks = monthlyTasksResponse.data;
          
          // عد المهام
          const projectPendingReviews = dailyTasks.filter(task => task.status === 'pending').length + 
                                       monthlyTasks.filter(task => task.status === 'pending').length;
          
          const projectReviewedTasks = dailyTasks.filter(task => task.status === 'done' || task.status === 'failed').length + 
                                      monthlyTasks.filter(task => task.status === 'done' || task.status === 'failed').length;
          
          // جمع المهندسين
          const projectEngineers = new Set();
          
          dailyTasks.forEach(task => {
            if (task.createdBy?._id) projectEngineers.add(task.createdBy._id);
          });
          
          monthlyTasks.forEach(task => {
            if (task.createdBy?._id) projectEngineers.add(task.createdBy._id);
          });

          project.engineers?.forEach(engineer => {
            if (engineer._id) projectEngineers.add(engineer._id);
          });

          return {
            pendingReviews: projectPendingReviews,
            reviewedTasks: projectReviewedTasks,
            engineers: projectEngineers
          };
        } catch (error) {
          console.error(`Error fetching tasks for project ${project._id}:`, error);
          return {
            pendingReviews: 0,
            reviewedTasks: 0,
            engineers: new Set()
          };
        }
      });

      // انتظر اكتمال جميع الـ promises
      const results = await Promise.all(tasksPromises);

      // جمع النتائج
      results.forEach(result => {
        pendingReviews += result.pendingReviews;
        reviewedTasks += result.reviewedTasks;
        result.engineers.forEach(engineerId => totalEngineers.add(engineerId));
      });

      setStats({
        totalProjects: projects.length,
        pendingReviews,
        reviewedTasks,
        totalEngineers: totalEngineers.size
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supervisorAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      onLogout();
      navigate('/login');
    }
  };

  const menuItems = [
    {
      path: '/dashboard/review-tasks',
      label: 'مراجعة المهام',
      icon: FiEye,
      description: 'مراجعة المهام اليومية والشهرية'
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-100 flex" dir="rtl">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-80 bg-white/95 backdrop-blur-2xl shadow-2xl border-l border-gray-200/60 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div 
            className="p-4 sm:p-7 border-b border-gray-200/60 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/dashboard')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-r from-green-600 to-green-700 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-xl">
                  <FiUser className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-lg sm:text-2xl font-extrabold text-gray-800 leading-tight">بوابة المشرفين</h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">نظام إدارة المهام</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 sm:p-2 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors"
              >
                <FiX className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 sm:p-7 space-y-2 sm:space-y-3">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 group font-medium ${
                    active
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/25'
                      : 'text-gray-700 hover:bg-green-50 hover:shadow-lg hover:border hover:border-green-200/50'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:scale-110 ${
                    active ? 'text-white' : 'text-green-600'
                  }`} />
                  <div className="flex-1 text-right">
                    <div className={`font-semibold text-base sm:text-lg transition-colors ${
                      active ? 'text-white' : 'text-gray-900'
                    }`}>
                      {item.label}
                    </div>
                    <div className={`text-xs sm:text-sm transition-colors ${
                      active ? 'text-green-100' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 sm:p-7 border-t border-gray-200/60">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 sm:gap-3 w-full p-3 sm:p-4 text-red-700 hover:bg-rose-50 rounded-xl sm:rounded-2xl transition-all duration-300 group border border-transparent hover:border-rose-200 font-semibold text-sm sm:text-base"
            >
              <FiLogOut className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white/90 backdrop-blur-2xl border-b border-gray-200/60 shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 sm:p-3 hover:bg-gray-100 rounded-xl sm:rounded-2xl transition-colors"
              >
                <FiMenu className="w-5 h-5 sm:w-7 sm:h-7 text-gray-600" />
              </button>
              <div className="lg:block text-right">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-800">
                  {location.pathname === '/dashboard' ? 'لوحة التحكم' :
                   location.pathname.includes('review-tasks') ? 'مراجعة المهام' :
                   location.pathname.includes('review-daily') ? 'مراجعة المهام اليومية' : 
                   location.pathname.includes('review-monthly') ? 'مراجعة المهام الشهرية' : 'لوحة التحكم'}
                </h1>
                <p className="text-gray-500 text-sm sm:text-base lg:text-lg font-medium">
                  إدارة المهام ومراجعات الفريق بكفاءة
                </p>
              </div>
            </div>
            
            {/* Logout Button in Header */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-red-700 hover:bg-rose-50 hover:text-rose-700 rounded-xl sm:rounded-2xl transition-all duration-300 group border border-red-200 hover:border-rose-200 font-semibold shadow-sm text-sm sm:text-base"
            >
              <FiLogOut className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
              <span className="hidden xs:block">تسجيل الخروج</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 bg-transparent">
          <Routes>
            <Route path="review-tasks" element={<ReviewTasks />} />
            <Route path="review-daily-tasks/:projectId" element={<ReviewDailyTasks />} />
            <Route path="review-monthly-tasks/:projectId" element={<ReviewMonthlyTasks />} />
            <Route path="/" element={<SupervisorWelcomeSection stats={stats} loading={loading} supervisorInfo={supervisorInfo} />} />
          </Routes>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

// Welcome Section for Supervisor
const SupervisorWelcomeSection = ({ stats, loading, supervisorInfo }) => {
  return (
    <div className="max-w-7xl mx-auto w-full" dir="rtl">
      {/* Welcome Header */}
      <div className="text-center mb-8 sm:mb-12 lg:mb-16 px-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-gray-800 mb-3 sm:mb-4 leading-tight">
          أهلاً بعودتك،{' '}
          <span className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
            {supervisorInfo?.name || 'المشرف'}
          </span>
          . 👋
        </h1>
        <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 max-w-3xl mx-auto font-medium leading-relaxed">
          هنا يمكنك مراجعة مهام الفريق ومتابعة تقدم المشاريع تحت إشرافك.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16 px-2">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200/60 p-4 sm:p-6 lg:p-8 text-center hover:scale-105 transition-transform duration-300">
          <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-green-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6">
            <FiBriefcase className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-green-600" />
          </div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-800 mb-2 sm:mb-3">
            {loading ? '...' : stats.totalProjects}
          </h3>
          <p className="text-sm sm:text-base lg:text-xl text-gray-600 font-semibold">المشاريع</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">تحت إشرافك</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200/60 p-4 sm:p-6 lg:p-8 text-center hover:scale-105 transition-transform duration-300">
          <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-orange-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6">
            <FiClock className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-orange-600" />
          </div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-800 mb-2 sm:mb-3">
            {loading ? '...' : stats.pendingReviews}
          </h3>
          <p className="text-sm sm:text-base lg:text-xl text-gray-600 font-semibold">مهام بانتظار المراجعة</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">تتطلب انتباهك</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200/60 p-4 sm:p-6 lg:p-8 text-center hover:scale-105 transition-transform duration-300">
          <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-blue-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6">
            <FiCheckCircle className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-blue-600" />
          </div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-800 mb-2 sm:mb-3">
            {loading ? '...' : stats.reviewedTasks}
          </h3>
          <p className="text-sm sm:text-base lg:text-xl text-gray-600 font-semibold">مهام تمت مراجعتها</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">مكتملة المراجعة</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200/60 p-4 sm:p-6 lg:p-8 text-center hover:scale-105 transition-transform duration-300">
          <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-purple-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6">
            <FiUser className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-purple-600" />
          </div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-800 mb-2 sm:mb-3">
            {loading ? '...' : stats.totalEngineers}
          </h3>
          <p className="text-sm sm:text-base lg:text-xl text-gray-600 font-semibold">المهندسين</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">مديرون مشاريعك</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-5xl mx-auto px-2">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200/60 p-4 sm:p-6 lg:p-8">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-800 mb-4 sm:mb-6 lg:mb-8 flex items-center gap-2 sm:gap-3 lg:gap-4">
            <FiBarChart2 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-600" />
            الإجراءات السريعة
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <Link
              to="/dashboard/review-tasks"
              className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-gray-200/60 hover:border-green-400 hover:shadow-xl transition-all duration-300 group bg-white/60 hover:bg-green-50 font-semibold text-gray-800 hover:text-green-700"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-green-100 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <FiEye className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-600 group-hover:text-green-700 transition-colors" />
              </div>
              <div className="text-right flex-1">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold transition-colors">مراجعة المهام</div>
                <div className="text-gray-600 text-sm sm:text-base lg:text-lg mt-1">مراجعة المهام اليومية والشهرية</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;