// Mock API service - no backend needed
const API_BASE_URL = 'mock://api';

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Mock request - return empty object for now
    console.log('🔍 Mock API Service - Request to:', endpoint);
    return Promise.resolve({} as T);
  }

  // Authentication
  async login(email: string, role: string) {
    // Mock login for now since backend is not working
    const validRole = ['student', 'faculty', 'admin'].includes(role) ? role as 'student' | 'faculty' | 'admin' : 'student';
    
    return Promise.resolve({
      success: true,
      data: {
        user: {
          id: '1',
          email: email,
          name: email.split('@')[0].replace('.', ' ').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          role: validRole
        },
        access_token: 'mock-token-' + Date.now(),
        token_type: 'Bearer',
        expires_in: 86400
      },
      message: 'Login successful (mock data)'
    });
  }

  async verifyToken() {
    return Promise.resolve({
      success: true,
      data: {
        user: {
          id: '1',
          email: 'admin@attendify.com',
          name: 'System Admin',
          role: 'admin'
        }
      }
    });
  }

  async enrollFace(image: string) {
    return Promise.resolve({
      success: true,
      message: 'Face enrolled successfully (mock)'
    });
  }

  async getFaceStatus() {
    return Promise.resolve({
      success: true,
      data: {
        enrolled: true,
        confidence: 0.95
      }
    });
  }

  async getProfile() {
    return Promise.resolve({
      success: true,
      data: {
        user: {
          id: '1',
          email: 'admin@attendify.com',
          name: 'System Admin',
          role: 'admin'
        }
      }
    });
  }

  // Attendance
  async markAttendanceFace(classId: number, image: string) {
    return Promise.resolve({
      success: true,
      message: 'Attendance marked successfully (mock)',
      data: {
        attendance_id: Math.floor(Math.random() * 1000),
        timestamp: new Date().toISOString()
      }
    });
  }

  async markAttendanceQR(classId: number, qrToken: string) {
    return Promise.resolve({
      success: true,
      message: 'Attendance marked successfully (mock)',
      data: {
        attendance_id: Math.floor(Math.random() * 1000),
        timestamp: new Date().toISOString()
      }
    });
  }

  async getStudentAttendance(userId: number, params?: {
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }) {
    return Promise.resolve({
      success: true,
      data: {
        attendances: [
          {
            id: 1,
            class_id: 1,
            class_name: 'CS101',
            date: '2024-01-15',
            status: 'present',
            timestamp: '2024-01-15T10:00:00Z'
          },
          {
            id: 2,
            class_id: 1,
            class_name: 'CS101',
            date: '2024-01-16',
            status: 'present',
            timestamp: '2024-01-16T10:00:00Z'
          }
        ],
        total: 2
      }
    });
  }

  async getClassAttendance(classId: number) {
    return Promise.resolve({
      success: true,
      data: {
        class_id: classId,
        class_name: 'CS101',
        attendances: [
          {
            student_id: 1,
            student_name: 'John Doe',
            status: 'present',
            timestamp: '2024-01-15T10:00:00Z'
          },
          {
            student_id: 2,
            student_name: 'Jane Smith',
            status: 'absent',
            timestamp: null
          }
        ]
      }
    });
  }

  // Classes
  async createClass(classData: {
    name: string;
    subject?: string;
    start_time: string;
    end_time?: string;
    room?: string;
    schedule?: string;
    semester?: string;
    max_students?: number;
    face_recognition_enabled?: boolean;
    qr_code_enabled?: boolean;
    attendance_window_minutes?: number;
  }) {
    return Promise.resolve({
      success: true,
      data: {
        id: Math.floor(Math.random() * 1000),
        ...classData,
        created_at: new Date().toISOString()
      },
      message: 'Class created successfully (mock)'
    });
  }

  async getFacultyClasses(facultyId: number, activeOnly = false) {
    return Promise.resolve({
      success: true,
      data: {
        classes: [
          {
            id: 1,
            name: 'CS101 - Introduction to Programming',
            subject: 'Computer Science',
            start_time: '09:00',
            end_time: '10:30',
            room: 'Room 101',
            schedule: 'Mon, Wed, Fri',
            semester: 'Fall 2024',
            max_students: 30,
            face_recognition_enabled: true,
            qr_code_enabled: true
          },
          {
            id: 2,
            name: 'MATH201 - Calculus II',
            subject: 'Mathematics',
            start_time: '11:00',
            end_time: '12:30',
            room: 'Room 205',
            schedule: 'Tue, Thu',
            semester: 'Fall 2024',
            max_students: 25,
            face_recognition_enabled: false,
            qr_code_enabled: true
          }
        ]
      }
    });
  }

  async getActiveClasses() {
    return Promise.resolve({
      success: true,
      data: {
        classes: [
          {
            id: 1,
            name: 'CS101 - Introduction to Programming',
            subject: 'Computer Science',
            start_time: '09:00',
            end_time: '10:30',
            room: 'Room 101',
            is_active: true
          }
        ]
      }
    });
  }

  async getUpcomingClasses(hoursAhead = 24) {
    return Promise.resolve({
      success: true,
      data: {
        classes: [
          {
            id: 1,
            name: 'CS101 - Introduction to Programming',
            subject: 'Computer Science',
            start_time: '09:00',
            end_time: '10:30',
            room: 'Room 101',
            start_datetime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
          }
        ]
      }
    });
  }

  async generateQRCode(classId: number) {
    return Promise.resolve({
      success: true,
      data: {
        qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        qr_token: 'qr_' + Math.random().toString(36).substr(2, 9),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      }
    });
  }

  async getClassDetails(classId: number) {
    return Promise.resolve({
      success: true,
      data: {
        id: classId,
        name: 'CS101 - Introduction to Programming',
        subject: 'Computer Science',
        start_time: '09:00',
        end_time: '10:30',
        room: 'Room 101',
        schedule: 'Mon, Wed, Fri',
        semester: 'Fall 2024',
        max_students: 30,
        face_recognition_enabled: true,
        qr_code_enabled: true,
        attendance_window_minutes: 15
      }
    });
  }

  async updateClassSettings(classId: number, settings: any) {
    return Promise.resolve({
      success: true,
      data: {
        id: classId,
        ...settings,
        updated_at: new Date().toISOString()
      },
      message: 'Class settings updated successfully (mock)'
    });
  }

  // Dashboard
  async getDashboardOverview() {
    // Mock data for now since backend is not working
    return Promise.resolve({
      success: true,
      data: {
        user: {
          id: '1',
          email: 'admin@attendify.com',
          name: 'System Admin',
          role: 'admin'
        },
        statistics: {
          total_students: 150,
          total_faculty: 25,
          total_admins: 3,
          attendance_rate: 87.5,
          active_classes: 8
        }
      },
      message: 'Dashboard data retrieved successfully (mock data)'
    });
  }

  async getStudentDashboard(userId: number) {
    return Promise.resolve({
      success: true,
      data: {
        user: {
          id: userId,
          name: 'John Doe',
          email: 'john.doe@student.com',
          role: 'student'
        },
        attendance_summary: {
          total_classes: 20,
          attended: 18,
          attendance_rate: 90.0
        },
        recent_attendance: [
          {
            class_name: 'CS101',
            date: '2024-01-15',
            status: 'present'
          },
          {
            class_name: 'MATH201',
            date: '2024-01-14',
            status: 'present'
          }
        ]
      }
    });
  }

  async getFacultyDashboard(userId: number) {
    return Promise.resolve({
      success: true,
      data: {
        user: {
          id: userId,
          name: 'Dr. Jane Smith',
          email: 'jane.smith@faculty.com',
          role: 'faculty'
        },
        classes: [
          {
            id: 1,
            name: 'CS101',
            total_students: 30,
            attendance_rate: 87.5
          }
        ],
        today_stats: {
          classes_today: 2,
          total_attendance: 45,
          average_attendance: 90.0
        }
      }
    });
  }

  async getAdminDashboard() {
    return Promise.resolve({
      success: true,
      data: {
        overview: {
          total_students: 150,
          total_faculty: 25,
          total_classes: 12,
          overall_attendance_rate: 87.5
        },
        recent_activity: [
          {
            type: 'attendance',
            message: 'John Doe marked present in CS101',
            timestamp: '2024-01-15T10:30:00Z'
          }
        ]
      }
    });
  }

  // Analytics
  async getAttendanceTrends(classId?: number, days = 30) {
    return Promise.resolve({
      success: true,
      data: {
        trends: [
          { date: '2024-01-01', attendance_rate: 85.0, target: 80.0, efficiency: 92 },
          { date: '2024-01-02', attendance_rate: 87.5, target: 80.0, efficiency: 95 },
          { date: '2024-01-03', attendance_rate: 90.0, target: 80.0, efficiency: 98 },
          { date: '2024-01-04', attendance_rate: 88.2, target: 80.0, efficiency: 94 },
          { date: '2024-01-05', attendance_rate: 91.5, target: 80.0, efficiency: 97 }
        ],
        average_attendance: 87.5,
        target_achievement: 109.4
      }
    });
  }

  async getRiskStudents(threshold = 60.0, days = 30) {
    return Promise.resolve({
      success: true,
      data: {
        risk_students: [
          {
            id: '1',
            name: 'Alice Johnson',
            attendance_rate: 55.0,
            missed_classes: 8,
            risk_level: 'critical',
            trend: 'down'
          },
          {
            id: '2',
            name: 'Bob Wilson',
            attendance_rate: 45.0,
            missed_classes: 12,
            risk_level: 'critical',
            trend: 'down'
          },
          {
            id: '3',
            name: 'Carol Davis',
            attendance_rate: 68.0,
            missed_classes: 6,
            risk_level: 'high',
            trend: 'stable'
          }
        ],
        total_at_risk: 3,
        critical_count: 2,
        high_count: 1
      }
    });
  }

  async getAnalyticsOverview() {
    return Promise.resolve({
      success: true,
      data: {
        overall_attendance: 87.5,
        total_students: 150,
        at_risk_students: 12,
        classes_this_week: 45,
        daily_patterns: [
          { day: 'Monday', attendance: 88, classes: 12 },
          { day: 'Tuesday', attendance: 85, classes: 15 },
          { day: 'Wednesday', attendance: 92, classes: 18 },
          { day: 'Thursday', attendance: 87, classes: 14 },
          { day: 'Friday', attendance: 83, classes: 10 }
        ],
        hourly_patterns: [
          { hour: '8:00', attendance: 75, classes: 3 },
          { hour: '9:00', attendance: 88, classes: 8 },
          { hour: '10:00', attendance: 92, classes: 12 },
          { hour: '11:00', attendance: 89, classes: 10 },
          { hour: '12:00', attendance: 82, classes: 6 },
          { hour: '13:00', attendance: 85, classes: 4 },
          { hour: '14:00', attendance: 90, classes: 9 },
          { hour: '15:00', attendance: 87, classes: 7 }
        ],
        ai_insights: [
          { type: 'prediction', title: 'Predicted Absentees Tomorrow', value: '8 students', confidence: 87 },
          { type: 'trend', title: 'Attendance Trend', value: 'Improving', confidence: 92 },
          { type: 'peak', title: 'Peak Attendance Time', value: '10:00 AM', confidence: 89 },
          { type: 'risk', title: 'High Risk Classes', value: 'PHY101, MATH301', confidence: 85 }
        ]
      }
    });
  }

  async getTopPerformers(limit = 10) {
    return Promise.resolve({
      success: true,
      data: {
        performers: [
          { name: 'Emma Wilson', attendance: 98, streak: 15, improvement: '+5%' },
          { name: 'Michael Brown', attendance: 96, streak: 12, improvement: '+3%' },
          { name: 'Sarah Davis', attendance: 94, streak: 10, improvement: '+7%' },
          { name: 'James Miller', attendance: 93, streak: 8, improvement: '+2%' },
          { name: 'Lisa Garcia', attendance: 91, streak: 6, improvement: '+4%' }
        ]
      }
    });
  }

  async getClassPerformance() {
    return Promise.resolve({
      success: true,
      data: {
        class_performance: [
          { subject: 'Computer Science', avgAttendance: 87, students: 45, trend: 'up' },
          { subject: 'Mathematics', avgAttendance: 82, students: 38, trend: 'stable' },
          { subject: 'Physics', avgAttendance: 79, students: 32, trend: 'down' },
          { subject: 'English', avgAttendance: 85, students: 41, trend: 'up' },
          { subject: 'Chemistry', avgAttendance: 81, students: 29, trend: 'stable' }
        ]
      }
    });
  }

  // Reports
  async generateAttendanceReport(classId: number, startDate: string, endDate: string) {
    return Promise.resolve({
      success: true,
      data: {
        report_url: 'mock://reports/attendance.pdf',
        generated_at: new Date().toISOString(),
        class_id: classId,
        period: { start: startDate, end: endDate }
      }
    });
  }

  async generateStudentReport(userId: number, startDate: string, endDate: string) {
    return Promise.resolve({
      success: true,
      data: {
        report_url: 'mock://reports/student.pdf',
        generated_at: new Date().toISOString(),
        user_id: userId,
        period: { start: startDate, end: endDate }
      }
    });
  }
}

export const apiService = new ApiService();
