export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'faculty' | 'admin';
  profileImage?: string;
}

export interface Student extends User {
  role: 'student';
  studentId: string;
  classIds: string[];
  totalAttendance: number;
  attendancePercentage: number;
}

export interface Faculty extends User {
  role: 'faculty';
  facultyId: string;
  assignedClasses: string[];
  department: string;
}

export interface Admin extends User {
  role: 'admin';
}

export interface Class {
  id: string;
  name: string;
  subject: string;
  facultyId: string;
  studentIds: string[];
  schedule: string;
  room: string;
  semester: string;
}

export interface AttendanceSession {
  id: string;
  classId: string;
  facultyId: string;
  date: string;
  startTime: string;
  endTime?: string;
  qrCode: string;
  isActive: boolean;
  attendees: string[];
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  sessionId: string;
  date: string;
  time: string;
  status: 'present' | 'absent' | 'late';
  method: 'qr' | 'manual' | 'face';
}

export interface Report {
  id: string;
  title: string;
  classId?: string;
  dateRange: {
    start: string;
    end: string;
  };
  generatedBy: string;
  generatedAt: string;
  data: AttendanceRecord[];
}