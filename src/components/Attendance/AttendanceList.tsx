import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Filter, Search, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const AttendanceList: React.FC = () => {
  const { user } = useAuth();
  const { attendanceRecords, classes, students } = useApp();
  const [filterDate, setFilterDate] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock attendance data for demonstration
  const mockAttendanceRecords = [
    {
      id: '1',
      studentId: '3',
      classId: 'CS101',
      sessionId: 'session_1',
      date: new Date().toISOString().split('T')[0],
      time: '10:30 AM',
      status: 'present' as const,
      method: 'qr' as const
    },
    {
      id: '2',
      studentId: '4',
      classId: 'CS101',
      sessionId: 'session_1',
      date: new Date().toISOString().split('T')[0],
      time: '10:32 AM',
      status: 'late' as const,
      method: 'face' as const
    },
    {
      id: '3',
      studentId: '3',
      classId: 'CS201',
      sessionId: 'session_2',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      time: '2:00 PM',
      status: 'present' as const,
      method: 'qr' as const
    },
    {
      id: '4',
      studentId: '5',
      classId: 'CS101',
      sessionId: 'session_1',
      date: new Date().toISOString().split('T')[0],
      time: '-',
      status: 'absent' as const,
      method: 'manual' as const
    }
  ];

  const allRecords = attendanceRecords.length > 0 ? attendanceRecords : mockAttendanceRecords;

  const filteredRecords = allRecords.filter(record => {
    const student = students.find(s => s.id === record.studentId);
    const classInfo = classes.find(c => c.id === record.classId);
    
    const matchesDate = !filterDate || record.date === filterDate;
    const matchesClass = !filterClass || record.classId === filterClass;
    const matchesStatus = !filterStatus || record.status === filterStatus;
    const matchesSearch = !searchTerm || 
      student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classInfo?.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesDate && matchesClass && matchesStatus && matchesSearch;
  });

  const exportToExcel = () => {
    const exportData = filteredRecords.map(record => {
      const student = students.find(s => s.id === record.studentId);
      const classInfo = classes.find(c => c.id === record.classId);
      
      return {
        'Student Name': student?.name || 'Unknown',
        'Student ID': student?.studentId || 'N/A',
        'Class': classInfo?.name || 'Unknown',
        'Date': record.date,
        'Time': record.time,
        'Status': record.status,
        'Method': record.method
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Records');
    XLSX.writeFile(wb, `attendance_records_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'late':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'absent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'late':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (user?.role === 'student') {
    const studentRecords = filteredRecords.filter(record => record.studentId === user.id);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            My Attendance History
          </h3>
          <button
            onClick={exportToExcel}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>

        <div className="space-y-4">
          {studentRecords.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No attendance records found
            </p>
          ) : (
            studentRecords.map((record) => {
              const classInfo = classes.find(c => c.id === record.classId);
              return (
                <div key={record.id} className="border dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {classInfo?.name || 'Unknown Class'}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {record.date}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {record.time}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                      {getStatusIcon(record.status)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Attendance Records
        </h3>
        <button
          onClick={exportToExcel}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
        >
          <Download className="h-4 w-4 mr-2" />
          Export to Excel
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search student or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Class
          </label>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setFilterDate('');
              setFilterClass('');
              setFilterStatus('');
              setSearchTerm('');
            }}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear
          </button>
        </div>
      </div>

      {/* Records Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Class
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Method
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No attendance records found
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => {
                const student = students.find(s => s.id === record.studentId);
                const classInfo = classes.find(c => c.id === record.classId);
                
                return (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {student?.name || 'Unknown Student'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {student?.studentId || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {classInfo?.name || 'Unknown Class'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {record.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {record.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                        {getStatusIcon(record.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <span className="capitalize">{record.method}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceList;