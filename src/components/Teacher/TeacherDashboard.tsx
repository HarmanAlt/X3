import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { glassmorphismStyles } from '../../styles/glassmorphism';
import QRCode from 'qrcode';
import {
  QrCodeIcon,
  CameraIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  EyeSlashIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface AttendanceSession {
  id: string;
  classId: string;
  className: string;
  startTime: string;
  endTime?: string;
  isActive: boolean;
  attendanceCount: number;
  totalStudents: number;
  method: 'qr' | 'face';
}

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const { classes, students, attendanceRecords, setAttendanceRecords } = useApp();
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceMethod, setAttendanceMethod] = useState<'qr' | 'face'>('qr');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [realTimeAttendance, setRealTimeAttendance] = useState<any[]>([]);
  const [showQRCode, setShowQRCode] = useState(false);

  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (activeSession && isSessionActive) {
      // Update real-time attendance every 5 seconds
      const interval = setInterval(() => {
        updateRealTimeAttendance();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [activeSession, isSessionActive]);

  const generateQRCode = async (classId: string) => {
    try {
      const qrData = {
        classId,
        type: 'attendance',
        timestamp: new Date().toISOString(),
        teacherId: user?.id
      };

      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeUrl(qrCodeDataURL);
      setShowQRCode(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const startAttendanceSession = () => {
    if (!selectedClass) return;

    const selectedClassData = classes.find(c => c.id === selectedClass);
    if (!selectedClassData) return;

    const session: AttendanceSession = {
      id: Date.now().toString(),
      classId: selectedClass,
      className: selectedClassData.name,
      startTime: new Date().toISOString(),
      isActive: true,
      attendanceCount: 0,
      totalStudents: selectedClassData.studentIds.length,
      method: attendanceMethod
    };

    setActiveSession(session);
    setIsSessionActive(true);

    if (attendanceMethod === 'qr') {
      generateQRCode(selectedClass);
    }
  };

  const stopAttendanceSession = () => {
    if (activeSession) {
      setActiveSession(prev => prev ? { ...prev, isActive: false, endTime: new Date().toISOString() } : null);
      setIsSessionActive(false);
      setShowQRCode(false);
    }
  };

  const updateRealTimeAttendance = () => {
    if (!activeSession) return;

    const sessionAttendance = attendanceRecords.filter(record => 
      record.classId === activeSession.classId &&
      new Date(record.timestamp) >= new Date(activeSession.startTime)
    );

    setRealTimeAttendance(sessionAttendance);
    
    if (activeSession) {
      setActiveSession(prev => prev ? {
        ...prev,
        attendanceCount: sessionAttendance.length
      } : null);
    }
  };

  const downloadAttendanceReport = () => {
    if (!activeSession) return;

    const sessionAttendance = attendanceRecords.filter(record => 
      record.classId === activeSession.classId &&
      new Date(record.timestamp) >= new Date(activeSession.startTime)
    );

    const csvContent = [
      ['Student ID', 'Student Name', 'Method', 'Confidence', 'Timestamp', 'Photo'],
      ...sessionAttendance.map(record => [
        record.studentId,
        record.studentName,
        record.method,
        record.confidence.toString(),
        new Date(record.timestamp).toLocaleString(),
        record.photo ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${activeSession.className}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getAttendancePercentage = () => {
    if (!activeSession) return 0;
    return activeSession.totalStudents > 0 
      ? (activeSession.attendanceCount / activeSession.totalStudents) * 100 
      : 0;
  };

  return (
    <div className={`${glassmorphismStyles.background.primary} min-h-screen p-6`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className={`${glassmorphismStyles.card.base} ${glassmorphismStyles.card.hover} p-8`}>
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
              <UsersIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                Teacher Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage attendance sessions and monitor student participation
              </p>
            </div>
          </div>

          {/* Session Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Select Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className={`${glassmorphismStyles.input.base} w-full`}
                disabled={isSessionActive}
              >
                <option value="">Choose a class...</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - {cls.subject}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Attendance Method
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="qr"
                    checked={attendanceMethod === 'qr'}
                    onChange={(e) => setAttendanceMethod(e.target.value as 'qr' | 'face')}
                    className="mr-2"
                    disabled={isSessionActive}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">QR Code</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="face"
                    checked={attendanceMethod === 'face'}
                    onChange={(e) => setAttendanceMethod(e.target.value as 'qr' | 'face')}
                    className="mr-2"
                    disabled={isSessionActive}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Face Recognition</span>
                </label>
              </div>
            </div>

            <div className="flex items-end">
              {!isSessionActive ? (
                <button
                  onClick={startAttendanceSession}
                  disabled={!selectedClass}
                  className={`${glassmorphismStyles.button.primary} w-full ${
                    !selectedClass ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Start Session
                </button>
              ) : (
                <button
                  onClick={stopAttendanceSession}
                  className={`${glassmorphismStyles.button.secondary} w-full`}
                >
                  <StopIcon className="w-5 h-5 mr-2" />
                  Stop Session
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Active Session Info */}
        {activeSession && (
          <div className={`${glassmorphismStyles.card.base} ${glassmorphismStyles.card.hover} p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Active Session: {activeSession.className}
              </h2>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  isSessionActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`} />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {isSessionActive ? 'Active' : 'Stopped'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className={`${glassmorphismStyles.dashboard.statCard} text-center`}>
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                  {activeSession.attendanceCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Students Present
                </div>
              </div>

              <div className={`${glassmorphismStyles.dashboard.statCard} text-center`}>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {getAttendancePercentage().toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Attendance Rate
                </div>
              </div>

              <div className={`${glassmorphismStyles.dashboard.statCard} text-center`}>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {activeSession.totalStudents}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Total Students
                </div>
              </div>

              <div className={`${glassmorphismStyles.dashboard.statCard} text-center`}>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {activeSession.method === 'qr' ? 'QR' : 'Face'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Method
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={updateRealTimeAttendance}
                className={glassmorphismStyles.button.ghost}
              >
                <ArrowPathIcon className="w-5 h-5 mr-2" />
                Refresh
              </button>

              <button
                onClick={downloadAttendanceReport}
                className={glassmorphismStyles.button.secondary}
              >
                <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                Download Report
              </button>
            </div>
          </div>
        )}

        {/* QR Code Display */}
        {showQRCode && qrCodeUrl && (
          <div className={`${glassmorphismStyles.card.base} ${glassmorphismStyles.card.hover} p-6`}>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              QR Code for Attendance
            </h2>
            <div className="text-center">
              <div className="inline-block p-4 bg-white rounded-2xl shadow-lg">
                <img src={qrCodeUrl} alt="Attendance QR Code" className="w-64 h-64" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-4">
                Students should scan this QR code to mark their attendance
              </p>
            </div>
          </div>
        )}

        {/* Real-time Attendance List */}
        {activeSession && (
          <div className={`${glassmorphismStyles.card.base} ${glassmorphismStyles.card.hover} p-6`}>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Real-time Attendance
            </h2>
            
            <div className="space-y-3">
              {realTimeAttendance.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No attendance records yet
                </div>
              ) : (
                realTimeAttendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-white/20 dark:bg-gray-800/20 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        record.method === 'qr' 
                          ? 'bg-blue-100 dark:bg-blue-900/30' 
                          : 'bg-purple-100 dark:bg-purple-900/30'
                      }`}>
                        {record.method === 'qr' ? (
                          <QrCodeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <CameraIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100">
                          {record.studentName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(record.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">
                        Present
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(record.confidence * 100).toFixed(1)}% confidence
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Class Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`${glassmorphismStyles.card.base} ${glassmorphismStyles.card.hover} p-6`}>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
              Class Overview
            </h3>
            <div className="space-y-3">
              {classes.map((cls) => {
                const classAttendance = attendanceRecords.filter(record => record.classId === cls.id);
                const attendanceRate = cls.studentIds.length > 0 
                  ? (classAttendance.length / cls.studentIds.length) * 100 
                  : 0;

                return (
                  <div key={cls.id} className="flex items-center justify-between p-3 bg-white/20 dark:bg-gray-800/20 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">
                        {cls.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {cls.subject}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        {attendanceRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {classAttendance.length}/{cls.studentIds.length}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`${glassmorphismStyles.card.base} ${glassmorphismStyles.card.hover} p-6`}>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {attendanceRecords.slice(-5).reverse().map((record) => (
                <div key={record.id} className="flex items-center space-x-3 p-3 bg-white/20 dark:bg-gray-800/20 rounded-xl">
                  <div className={`p-2 rounded-lg ${
                    record.method === 'qr' 
                      ? 'bg-blue-100 dark:bg-blue-900/30' 
                      : 'bg-purple-100 dark:bg-purple-900/30'
                  }`}>
                    {record.method === 'qr' ? (
                      <QrCodeIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <CameraIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {record.studentName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {record.classId} • {new Date(record.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
