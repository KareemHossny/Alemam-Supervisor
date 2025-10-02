import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiBriefcase, FiUsers, FiClock, FiCheckCircle } from 'react-icons/fi';
import { supervisorAPI } from '../utils/api';

const ReviewTasks = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projectStats, setProjectStats] = useState({});

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await supervisorAPI.getMyProjects();
      const projectsData = response.data;
      setProjects(projectsData);

      // Fetch stats for each project
      const stats = {};
      for (const project of projectsData) {
        try {
          const [dailyTasksResponse, monthlyTasksResponse] = await Promise.all([
            supervisorAPI.getDailyTasks(project._id),
            supervisorAPI.getMonthlyTasks(project._id)
          ]);
          
          const dailyTasks = dailyTasksResponse.data;
          const monthlyTasks = monthlyTasksResponse.data;
          
          const pendingTasks = [...dailyTasks, ...monthlyTasks].filter(task => task.status === 'pending').length;
          const reviewedTasks = [...dailyTasks, ...monthlyTasks].filter(task => task.status !== 'pending').length;
          
          stats[project._id] = {
            pending: pendingTasks,
            reviewed: reviewedTasks,
            total: dailyTasks.length + monthlyTasks.length
          };
        } catch (error) {
          console.error(`Error fetching tasks for project ${project._id}:`, error);
          stats[project._id] = { pending: 0, reviewed: 0, total: 0 };
        }
      }
      setProjectStats(stats);
    } catch (err) {
      setError('فشل تحميل المشاريع');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">جاري تحميل المشاريع...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiBriefcase className="w-8 h-8 text-rose-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">خطأ في تحميل المشاريع</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchProjects}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-semibold"
          >
            حاول مرة أخرى
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">مراجعة المهام</h1>
          <p className="text-gray-600">مراجعة المهام اليومية والشهرية للفريق</p>
        </div>
        <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl flex items-center justify-center text-white shadow-lg">
          <FiEye className="w-6 h-6" />
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200/50 p-12 text-center">
          <FiBriefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد مشاريع</h3>
          <p className="text-gray-500">لم يتم تعيينك كمشرف على أي مشاريع بعد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {projects.map((project) => {
            const stats = projectStats[project._id] || { pending: 0, reviewed: 0, total: 0 };
            
            return (
              <div
                key={project._id}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Project Header */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                    {project.name}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {project.scopeOfWork}
                  </p>
                </div>

                {/* Project Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <FiClock className="w-4 h-4 text-blue-600" />
                      <span className="text-lg font-bold text-blue-700">{stats.pending}</span>
                    </div>
                    <div className="text-xs text-blue-600">بانتظار المراجعة</div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <FiCheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-lg font-bold text-green-700">{stats.reviewed}</span>
                    </div>
                    <div className="text-xs text-green-600">تمت مراجعتها</div>
                  </div>
                  
                  <div className="text-center p-3 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <FiBriefcase className="w-4 h-4 text-purple-600" />
                      <span className="text-lg font-bold text-purple-700">{stats.total}</span>
                    </div>
                    <div className="text-xs text-purple-600">إجمالي المهام</div>
                  </div>
                </div>

                {/* Engineers List */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiUsers className="w-4 h-4 text-gray-500" />
                    <h4 className="text-sm font-semibold text-gray-700">المهندسين:</h4>
                  </div>
                  <div className="space-y-1">
                    {project.engineers?.slice(0, 3).map((engineer) => (
                      <div key={engineer._id} className="text-xs text-gray-600 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {engineer.name}
                      </div>
                    ))}
                    {project.engineers?.length > 3 && (
                      <div className="text-xs text-gray-500">
                        + {project.engineers.length - 3} آخرين
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link
                    to={`/dashboard/review-daily-tasks/${project._id}`}
                    className="flex items-center justify-center gap-2 w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-semibold"
                  >
                    <FiEye className="w-4 h-4" />
                    مراجعة المهام اليومية
                  </Link>
                  
                  <Link
                    to={`/dashboard/review-monthly-tasks/${project._id}`}
                    className="flex items-center justify-center gap-2 w-full p-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-colors font-semibold"
                  >
                    <FiEye className="w-4 h-4" />
                    مراجعة المهام الشهرية
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReviewTasks;