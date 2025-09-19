import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Class, Student, Faculty, AttendanceSession, AttendanceRecord } from '../types';

interface AppContextType {
  classes: Class[];
  students: Student[];
  faculty: Faculty[];
  attendanceSessions: AttendanceSession[];
  attendanceRecords: AttendanceRecord[];
  activeSession: AttendanceSession | null;
  darkMode: boolean;
  colorTheme: 'blue' | 'purple' | 'green' | 'orange' | 'pink';
  setClasses: (classes: Class[]) => void;
  setStudents: (students: Student[]) => void;
  setFaculty: (faculty: Faculty[]) => void;
  setAttendanceSessions: (sessions: AttendanceSession[]) => void;
  setAttendanceRecords: (records: AttendanceRecord[]) => void;
  setActiveSession: (session: AttendanceSession | null) => void;
  toggleDarkMode: () => void;
  setColorTheme: (theme: 'blue' | 'purple' | 'green' | 'orange' | 'pink') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock data
const mockClasses: Class[] = [
  {
    id: 'CS101',
    name: 'Introduction to Computer Science',
    subject: 'Computer Science',
    facultyId: '2',
    studentIds: ['3', '4', '5'],
    schedule: 'Mon, Wed, Fri - 10:00 AM',
    room: 'Room 201',
    semester: 'Fall 2024'
  },
  {
    id: 'CS201',
    name: 'Data Structures',
    subject: 'Computer Science',
    facultyId: '2',
    studentIds: ['3', '6', '7'],
    schedule: 'Tue, Thu - 2:00 PM',
    room: 'Room 301',
    semester: 'Fall 2024'
  }
];

const mockStudents: Student[] = [
  {
    id: '3',
    email: 'kartik.smith@attendify.com',
    name: 'Kartik Smith',
    role: 'student',
    studentId: 'STU001',
    classIds: ['CS101', 'CS201'],
    totalAttendance: 45,
    attendancePercentage: 87.5
  },
  {
    id: '4',
    email: 'lokesh.dalal@attendify.com',
    name: 'Lokesh Dalal',
    role: 'student',
    studentId: 'STU002',
    classIds: ['CS101'],
    totalAttendance: 38,
    attendancePercentage: 92.3
  }
];

const mockFaculty: Faculty[] = [
  {
    id: '2',
    email: 'faculty@attendify.com',
    name: 'Dr. Bhawna Suri',
    role: 'faculty',
    facultyId: 'FAC001',
    assignedClasses: ['CS101', 'CS201'],
    department: 'Computer Science'
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<Class[]>(mockClasses);
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [faculty, setFaculty] = useState<Faculty[]>(mockFaculty);
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('attendify_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });
  const [colorTheme, setColorThemeState] = useState<'blue' | 'purple' | 'green' | 'orange' | 'pink'>(() => {
    const saved = localStorage.getItem('attendify_color_theme');
    return (saved as any) || 'blue';
  });

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('attendify_dark_mode', JSON.stringify(newMode));
    document.documentElement.classList.toggle('dark', newMode);
  };

  const setColorTheme = (theme: 'blue' | 'purple' | 'green' | 'orange' | 'pink') => {
    setColorThemeState(theme);
    localStorage.setItem('attendify_color_theme', theme);
    // Update CSS custom properties for theme colors
    const root = document.documentElement;
    const themeColors = {
      blue: { primary: '#3B82F6', secondary: '#1E40AF', accent: '#60A5FA' },
      purple: { primary: '#8B5CF6', secondary: '#7C3AED', accent: '#A78BFA' },
      green: { primary: '#10B981', secondary: '#059669', accent: '#34D399' },
      orange: { primary: '#F59E0B', secondary: '#D97706', accent: '#FBBF24' },
      pink: { primary: '#EC4899', secondary: '#DB2777', accent: '#F472B6' }
    };
    
    const colors = themeColors[theme];
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
  };

  // ✅ useEffect is now inside AppProvider
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
    setColorTheme(colorTheme);
  }, []);

  return (
    <AppContext.Provider value={{
      classes,
      students,
      faculty,
      attendanceSessions,
      attendanceRecords,
      activeSession,
      darkMode,
      colorTheme,
      setClasses,
      setStudents,
      setFaculty,
      setAttendanceSessions,
      setAttendanceRecords,
      setActiveSession,
      toggleDarkMode,
      setColorTheme
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
