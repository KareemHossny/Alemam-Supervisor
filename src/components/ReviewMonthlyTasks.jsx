import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEye, FiCalendar, FiArrowLeft, FiCheckCircle, FiClock, FiAlertCircle, FiEdit, FiUser } from 'react-icons/fi';
import { supervisorAPI } from '../utils/api';

const ReviewMonthlyTasks = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [message, setMessage] = useState('');
  const [reviewingTask, setReviewingTask] = useState(null);
  const [reviewData, setReviewData] = useState({
    status: 'pending',
    supervisorNote: ''
  });

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  useEffect(() => {
    if (project && selectedMonth) {
      fetchTasks();
    }
  }, [selectedMonth, project]);

  const fetchProjectDetails = async () => {
    try {
      const response = await supervisorAPI.getMyProjects();
      const projectData = response.data.find(p => p._id === projectId);
      setProject(projectData);
    } catch (err) {
      setMessage('فشل تحميل تفاصيل المشروع');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await supervisorAPI.getMonthlyTasks(projectId);
      
      // Filter tasks based on selected month
      const filteredTasks = response.data.filter(task => {
        const taskMonth = new Date(task.date).toISOString().substring(0, 7);
        return taskMonth === selectedMonth;
      });
      
      setTasks(filteredTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setTasks([]);
    }
  };

  const startReview = (task) => {
    setReviewingTask(task);
    setReviewData({
      status: task.status,
      supervisorNote: task.supervisorNote || ''
    });
  };

  const cancelReview = () => {
    setReviewingTask(null);
    setReviewData({
      status: 'pending',
      supervisorNote: ''
    });
  };

  const submitReview = async () => {
    if (!reviewingTask) return;

    try {
      await supervisorAPI.reviewMonthlyTask(reviewingTask._id, reviewData);
      setMessage('تمت مراجعة المهمة بنجاح');
      setReviewingTask(null);
      fetchTasks();
    } catch (err) {
      setMessage('فشل في مراجعة المهمة');
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FiClock className="w-4 h-4 text-orange-500" />,
      done: <FiCheckCircle className="w-4 h-4 text-green-500" />,
      failed: <FiAlertCircle className="w-4 h-4 text-rose-500" />
    };
    return icons[status] || icons.pending;
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'بانتظار المراجعة',
      done: 'تمت',
      failed: 'لم تتم'
    };
    return texts[status] || 'بانتظار المراجعة';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-orange-100 text-orange-800 border-orange-200',
      done: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-rose-100 text-rose-800 border-rose-200'
    };
    return colors[status] || colors.pending;
  };

  const getMonthName = (monthString) => {
    const [year, month] = monthString.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">جاري تحميل تفاصيل المشروع...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard/review-tasks')}
            className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">مراجعة المهام الشهرية</h1>
            <p className="text-gray-600">
              {project?.name} - مراجعة مهام الفريق الشهرية
            </p>
          </div>
        </div>
        <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
          <FiEye className="w-6 h-6" />
        </div>
      </div>

      {/* Month Selection */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200/50 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
              اختر الشهر
            </label>
            <div className="relative group">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-2xl transition-all duration-300 bg-white text-gray-800 group-hover:border-orange-300 shadow-sm focus:border-orange-500 focus:ring-0 focus:outline-none text-right"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <FiCalendar className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 text-right">
            عرض {tasks.length} مهمة لشهر {getMonthName(selectedMonth)}
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-2xl border mb-6 ${
          message.includes('نجاح') 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          {message}
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200/50 p-12 text-center">
            <FiEye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد مهام</h3>
            <p className="text-gray-500">
              لا توجد مهام شهرية للشهر المحدد.
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200/50 p-4 sm:p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                      {task.title}
                    </h3>
                    <span
                      className={`mt-1 sm:mt-0 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border flex items-center gap-1 ${getStatusColor(task.status)}`}
                    >
                      {getStatusIcon(task.status)}
                      <span>{getStatusText(task.status)}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <FiCalendar className="w-4 h-4" />
                      <span>{new Date(task.date).toLocaleDateString('ar-EG')}</span>
                    </div>
                    {task.createdBy && (
                      <div className="flex items-center gap-1">
                        <FiUser className="w-4 h-4" />
                        <span className="font-medium">{task.createdBy.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {task.status === 'pending' && (
                  <button
                    onClick={() => startReview(task)}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-colors w-full sm:w-auto mt-2 sm:mt-0"
                  >
                    <FiEdit className="w-4 h-4" />
                    <span className="text-sm">مراجعة</span>
                  </button>
                )}
              </div>

              {task.note && (
                <div className="mb-4 p-3 sm:p-4 bg-gray-50 rounded-xl text-xs sm:text-sm break-words">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">ملاحظات المهندس:</h4>
                  <p className="text-gray-600">{task.note}</p>
                </div>
              )}

              {task.supervisorNote && (
                <div className="p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-200 text-xs sm:text-sm break-words">
                  <h4 className="text-xs sm:text-sm font-semibold text-blue-800 mb-1">ملاحظاتك السابقة:</h4>
                  <p className="text-blue-700">{task.supervisorNote}</p>
                </div>
              )}

              {/* Review Form */}
              {reviewingTask && reviewingTask._id === task._id && (
                <div className="mt-4 p-3 sm:p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <h4 className="text-xs sm:text-sm font-semibold text-orange-800 mb-3">مراجعة المهمة</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-orange-700 mb-2">
                        حالة المهمة
                      </label>
                      <select
                        value={reviewData.status}
                        onChange={(e) => setReviewData({...reviewData, status: e.target.value})}
                        className="w-full px-2 sm:px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-xs sm:text-sm"
                      >
                        <option value="pending">بانتظار المراجعة</option>
                        <option value="done">تمت ✅</option>
                        <option value="failed">لم تتم ❌</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-orange-700 mb-2">
                        ملاحظاتك
                      </label>
                      <textarea
                        value={reviewData.supervisorNote}
                        onChange={(e) => setReviewData({...reviewData, supervisorNote: e.target.value})}
                        placeholder="أضف ملاحظاتك للمهندس..."
                        rows="3"
                        className="w-full px-2 sm:px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-xs sm:text-sm"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button
                        onClick={submitReview}
                        className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-xs sm:text-sm"
                      >
                        حفظ المراجعة
                      </button>
                      <button
                        onClick={cancelReview}
                        className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors text-xs sm:text-sm"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewMonthlyTasks;