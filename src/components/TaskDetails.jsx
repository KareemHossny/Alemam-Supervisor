import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiUser, FiCheckCircle, FiClock, FiAlertCircle, FiEdit } from 'react-icons/fi';
import { supervisorAPI } from '../utils/api';

const TaskDetails = () => {
  const { taskId, taskType } = useParams();
  const navigate = useNavigate();
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [reviewData, setReviewData] = useState({
    status: 'pending',
    supervisorNote: ''
  });
  const [isReviewing, setIsReviewing] = useState(false);

  // استخدام useCallback لـ fetchTaskDetails
  const fetchTaskDetails = useCallback(async () => {
    try {
      let taskData = null;
      
      if (taskType === 'daily') {
        // الحصول على جميع المهام اليومية ثم فلترتها
        const response = await supervisorAPI.getDailyTasks('all');
        taskData = response.data.find(t => t._id === taskId);
      } else if (taskType === 'monthly') {
        // الحصول على جميع المهام الشهرية ثم فلترتها
        const response = await supervisorAPI.getMonthlyTasks('all');
        taskData = response.data.find(t => t._id === taskId);
      }
      
      if (taskData) {
        setTask(taskData);
        setReviewData({
          status: taskData.status,
          supervisorNote: taskData.supervisorNote || ''
        });
      } else {
        setMessage('المهمة غير موجودة');
      }
    } catch (err) {
      setMessage('فشل تحميل تفاصيل المهمة');
      console.error('Error fetching task details:', err);
    } finally {
      setLoading(false);
    }
  }, [taskId, taskType]); // إضافة taskId و taskType كـ dependencies

  useEffect(() => {
    fetchTaskDetails();
  }, [fetchTaskDetails]); // الآن fetchTaskDetails مستقرة بسبب useCallback

  const submitReview = async () => {
    if (!task) return;

    try {
      if (taskType === 'daily') {
        await supervisorAPI.reviewDailyTask(task._id, reviewData);
      } else if (taskType === 'monthly') {
        await supervisorAPI.reviewMonthlyTask(task._id, reviewData);
      }
      
      setMessage('تمت مراجعة المهمة بنجاح');
      setIsReviewing(false);
      fetchTaskDetails(); // Refresh task data
    } catch (err) {
      setMessage('فشل في مراجعة المهمة');
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FiClock className="w-5 h-5 text-orange-500" />,
      done: <FiCheckCircle className="w-5 h-5 text-green-500" />,
      failed: <FiAlertCircle className="w-5 h-5 text-rose-500" />
    };
    return icons[status] || icons.pending;
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'بانتظار المراجعة',
      done: 'تمت بنجاح',
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">جاري تحميل تفاصيل المهمة...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-600 mb-2">المهمة غير موجودة</h3>
          <p className="text-gray-500 mb-4">{message}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition-colors"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
              {taskType === 'daily' ? 'المهمة اليومية' : 'المهمة الشهرية'}
            </h1>
            <p className="text-gray-600">تفاصيل المهمة ومراجعتها</p>
          </div>
        </div>
        
        <span className={`px-4 py-2 rounded-full text-sm font-medium border flex items-center gap-2 ${getStatusColor(task.status)}`}>
          {getStatusIcon(task.status)}
          <span>{getStatusText(task.status)}</span>
        </span>
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

      {/* Task Details */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200/50 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{task.title}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-600">
              <FiCalendar className="w-5 h-5" />
              <span className="font-medium">التاريخ:</span>
              <span>{new Date(task.date).toLocaleDateString('ar-EG')}</span>
            </div>
            
            {task.createdBy && (
              <div className="flex items-center gap-3 text-gray-600">
                <FiUser className="w-5 h-5" />
                <span className="font-medium">المهندس:</span>
                <span>{task.createdBy.name}</span>
              </div>
            )}

            <div className="flex items-center gap-3 text-gray-600">
              <span className="font-medium">نوع المهمة:</span>
              <span>{taskType === 'daily' ? 'يومية' : 'شهرية'}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="font-medium text-gray-700">الحالة الحالية:</span>
              <div className="mt-1">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-2 w-fit ${getStatusColor(task.status)}`}>
                  {getStatusIcon(task.status)}
                  {getStatusText(task.status)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Engineer Notes */}
        {task.note && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">ملاحظات المهندس:</h4>
            <p className="text-gray-600 leading-relaxed">{task.note}</p>
          </div>
        )}

        {/* Supervisor Notes */}
        {task.supervisorNote && (
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">ملاحظاتك السابقة:</h4>
            <p className="text-blue-700 leading-relaxed">{task.supervisorNote}</p>
          </div>
        )}
      </div>

      {/* Review Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">مراجعة المهمة</h3>
          
          {task.status === 'pending' && !isReviewing && (
            <button
              onClick={() => setIsReviewing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              <FiEdit className="w-4 h-4" />
              <span>بدء المراجعة</span>
            </button>
          )}
        </div>

        {/* Review Form */}
        {isReviewing && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حالة المهمة
              </label>
              <select
                value={reviewData.status}
                onChange={(e) => setReviewData({...reviewData, status: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">بانتظار المراجعة</option>
                <option value="done">تمت ✅</option>
                <option value="failed">لم تتم ❌</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظاتك للمهندس
              </label>
              <textarea
                value={reviewData.supervisorNote}
                onChange={(e) => setReviewData({...reviewData, supervisorNote: e.target.value})}
                placeholder="أضف ملاحظاتك وتقييمك للمهمة..."
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={submitReview}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors font-semibold"
              >
                حفظ المراجعة
              </button>
              <button
                onClick={() => setIsReviewing(false)}
                className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors font-semibold"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        {!isReviewing && task.status !== 'pending' && (
          <div className="text-center py-8">
            <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-700 mb-2">تمت مراجعة هذه المهمة</h4>
            <p className="text-gray-600">يمكنك العودة إلى قائمة المهام أو تعديل المراجعة</p>
            <button
              onClick={() => setIsReviewing(true)}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              تعديل المراجعة
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetails;