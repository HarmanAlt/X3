import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, Download, Calendar, Users, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';

const ReportsSection: React.FC = () => {
  const { classes, students, attendanceRecords, faculty } = useApp();
  const [reportType, setReportType] = useState('attendance');
  const [selectedClass, setSelectedClass] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [reportData, setReportData] = useState<any[]>([]);
  const [showReport, setShowReport] = useState(false);

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
    }
  ];

  const allRecords = attendanceRecords.length > 0 ? attendanceRecords : mockAttendanceRecords;

  const generateReport = () => {
    let filteredData = [];

    switch (reportType) {
      case 'attendance':
        filteredData = allRecords.filter(record => {
          const matchesClass = !selectedClass || record.classId === selectedClass;
          const recordDate = new Date(record.date);
          const startDate = dateRange.start ? new Date(dateRange.start) : null;
          const endDate = dateRange.end ? new Date(dateRange.end) : null;
          
          const matchesDate = (!startDate || recordDate >= startDate) && 
                             (!endDate || recordDate <= endDate);
          
          return matchesClass && matchesDate;
        }).map(record => {
          const student = students.find(s => s.id === record.studentId);
          const classInfo = classes.find(c => c.id === record.classId);
          
          return {
            studentName: student?.name || 'Unknown',
            studentId: student?.studentId || 'N/A',
            className: classInfo?.name || 'Unknown',
            date: record.date,
            time: record.time,
            status: record.status,
            method: record.method
          };
        });
        break;

      case 'class_summary':
        const classSummary = classes.map(cls => {
          const classRecords = allRecords.filter(r => r.classId === cls.id);
          const totalSessions = new Set(classRecords.map(r => r.sessionId)).size;
          const presentCount = classRecords.filter(r => r.status === 'present').length;
          const absentCount = classRecords.filter(r => r.status === 'absent').length;
          const lateCount = classRecords.filter(r => r.status === 'late').length;
          
          return {
            className: cls.name,
            subject: cls.subject,
            totalStudents: cls.studentIds.length,
            totalSessions,
            presentCount,
            absentCount,
            lateCount,
            attendanceRate: totalSessions > 0 ? ((presentCount / (totalSessions * cls.studentIds.length)) * 100).toFixed(2) : '0'
          };
        });
        filteredData = classSummary;
        break;

      case 'student_summary':
        const studentSummary = students.map(student => {
          const studentRecords = allRecords.filter(r => r.studentId === student.id);
          const presentCount = studentRecords.filter(r => r.status === 'present').length;
          const absentCount = studentRecords.filter(r => r.status === 'absent').length;
          const lateCount = studentRecords.filter(r => r.status === 'late').length;
          const totalSessions = studentRecords.length;
          
          return {
            studentName: student.name,
            studentId: student.studentId,
            totalSessions,
            presentCount,
            absentCount,
            lateCount,
            attendanceRate: totalSessions > 0 ? ((presentCount / totalSessions) * 100).toFixed(2) : '0'
          };
        });
        filteredData = studentSummary;
        break;
    }

    setReportData(filteredData);
    setShowReport(true);
  };

  const downloadPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Attendance Report", 14, 20);

  // Convert your React table to PDF
  (doc as any).autoTable({
    head: [["Student Name", "Roll No", "Class", "Attendance (%)"]],
    body: students.map((s) => [
      s.name,
      s.rollNumber,
      s.className,
      `${s.attendancePercentage}%`,
    ]),
    startY: 30,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  doc.save("attendance-report.pdf");
};


  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${reportType}_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Generate Report
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="attendance">Attendance Records</option>
              <option value="class_summary">Class Summary</option>
              <option value="student_summary">Student Summary</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Class (Optional)
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={generateReport}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </button>
          
          {showReport && (
            <>
              <button
                onClick={downloadPDF}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </button>
              
              <button
                onClick={downloadExcel}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Excel
              </button>
            </>
          )}
        </div>
      </div>

      {showReport && reportData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Report Results ({reportData.length} records)
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {reportType === 'attendance' && (
                    <>
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
                    </>
                  )}
                  
                  {reportType === 'class_summary' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Students
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Sessions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Present
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Absent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Attendance Rate
                      </th>
                    </>
                  )}
                  
                  {reportType === 'student_summary' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Sessions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Present
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Absent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Late
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Rate %
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {reportData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    {reportType === 'attendance' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {row.studentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {row.className}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {row.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {row.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            row.status === 'present' ? 'bg-green-100 text-green-800' :
                            row.status === 'absent' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {row.method}
                        </td>
                      </>
                    )}
                    
                    {reportType === 'class_summary' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {row.className}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {row.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {row.totalStudents}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {row.totalSessions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {row.presentCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {row.absentCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            parseFloat(row.attendanceRate) >= 75 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {row.attendanceRate}%
                          </span>
                        </td>
                      </>
                    )}
                    
                    {reportType === 'student_summary' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {row.studentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {row.studentId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {row.totalSessions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {row.presentCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {row.absentCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {row.lateCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            parseFloat(row.attendanceRate) >= 75 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {row.attendanceRate}%
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsSection;
