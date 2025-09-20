const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // Authentication
  async login(email: string, role: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  }

  async verifyToken() {
    return this.request('/api/auth/verify');
  }

  async enrollFace(image: string) {
    return this.request('/api/auth/enroll-face', {
      method: 'POST',
      body: JSON.stringify({ image }),
    });
  }

  async getFaceStatus() {
    return this.request('/api/auth/face-status');
  }

  async getProfile() {
    return this.request('/api/auth/profile');
  }

  // Attendance
  async markAttendanceFace(classId: number, image: string) {
    return this.request('/api/attendance/mark-face', {
      method: 'POST',
      body: JSON.stringify({ class_id: classId, image }),
    });
  }

  async markAttendanceQR(classId: number, qrToken: string) {
    return this.request('/api/attendance/mark-qr', {
      method: 'POST',
      body: JSON.stringify({ class_id: classId, qr_token: qrToken }),
    });
  }

  async getStudentAttendance(userId: number, params?: {
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/api/attendance/student/${userId}?${queryParams}`);
  }

  async getClassAttendance(classId: number) {
    return this.request(`/api/attendance/class/${classId}`);
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
    return this.request('/api/classes/create', {
      method: 'POST',
      body: JSON.stringify(classData),
    });
  }

  async getFacultyClasses(facultyId: number, activeOnly = false) {
    return this.request(`/api/classes/faculty/${facultyId}?active_only=${activeOnly}`);
  }

  async getActiveClasses() {
    return this.request('/api/classes/active');
  }

  async getUpcomingClasses(hoursAhead = 24) {
    return this.request(`/api/classes/upcoming?hours_ahead=${hoursAhead}`);
  }

  async generateQRCode(classId: number) {
    return this.request(`/api/classes/${classId}/generate-qr`, {
      method: 'POST',
    });
  }

  async getClassDetails(classId: number) {
    return this.request(`/api/classes/${classId}`);
  }

  async updateClassSettings(classId: number, settings: any) {
    return this.request(`/api/classes/${classId}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Dashboard
  async getDashboardOverview() {
    return this.request('/api/dashboard/overview');
  }

  async getStudentDashboard(userId: number) {
    return this.request(`/api/dashboard/student/${userId}`);
  }

  async getFacultyDashboard(userId: number) {
    return this.request(`/api/dashboard/faculty/${userId}`);
  }

  async getAdminDashboard() {
    return this.request('/api/dashboard/admin');
  }

  // Analytics
  async getAttendanceTrends(classId?: number, days = 30) {
    const params = classId ? `?class_id=${classId}&days=${days}` : `?days=${days}`;
    return this.request(`/api/analytics/trends${params}`);
  }

  async getRiskStudents(threshold = 60.0, days = 30) {
    return this.request(`/api/analytics/risk-students?threshold=${threshold}&days=${days}`);
  }

  // Reports
  async generateAttendanceReport(classId: number, startDate: string, endDate: string) {
    return this.request(`/api/reports/attendance?class_id=${classId}&start_date=${startDate}&end_date=${endDate}`);
  }

  async generateStudentReport(userId: number, startDate: string, endDate: string) {
    return this.request(`/api/reports/student?user_id=${userId}&start_date=${startDate}&end_date=${endDate}`);
  }
}

export const apiService = new ApiService();
