import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Plus, Edit, Trash2, User, Mail, BookOpen, Building, Upload, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const FacultySection: React.FC = () => {
  const { user } = useAuth();
  const { faculty, setFaculty, classes } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    facultyId: '',
    department: '',
    assignedClasses: []
  });

  const handleAddFaculty = () => {
    if (user?.role === 'admin') {
      const newFaculty = {
        id: `FAC${Date.now()}`,
        ...formData,
        role: 'faculty' as const
      };
      setFaculty([...faculty, newFaculty]);
      setShowAddModal(false);
      setFormData({ name: '', email: '', facultyId: '', department: '', assignedClasses: [] });
    }
  };

  const handleEditFaculty = () => {
    if (selectedFaculty && user?.role === 'admin') {
      const updatedFaculty = faculty.map(f => 
        f.id === selectedFaculty.id 
          ? { ...f, ...formData }
          : f
      );
      setFaculty(updatedFaculty);
      setShowEditModal(false);
      setSelectedFaculty(null);
      setFormData({ name: '', email: '', facultyId: '', department: '', assignedClasses: [] });
    }
  };

  const handleDeleteFaculty = (facultyId: string) => {
    if (user?.role === 'admin') {
      const updatedFaculty = faculty.filter(f => f.id !== facultyId);
      setFaculty(updatedFaculty);
    }
  };

  const openEditModal = (facultyMember: any) => {
    setSelectedFaculty(facultyMember);
    setFormData({
      name: facultyMember.name,
      email: facultyMember.email,
      facultyId: facultyMember.facultyId,
      department: facultyMember.department,
      assignedClasses: facultyMember.assignedClasses
    });
    setShowEditModal(true);
  };

  const openProfileModal = (facultyMember: any) => {
    setSelectedFaculty(facultyMember);
    setShowProfileModal(true);
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (result) => {
        const csvData = result.data as any[];
        const headers = csvData[0];
        const newFaculty = csvData.slice(1).map((row: any[], index: number) => {
          const facultyData: any = {};
          headers.forEach((header: string, headerIndex: number) => {
            facultyData[header.toLowerCase().replace(' ', '')] = row[headerIndex];
          });
          return {
            id: `CSV${Date.now()}${index}`,
            name: facultyData.name || '',
            email: facultyData.email || '',
            facultyId: facultyData.facultyid || facultyData.id || '',
            department: facultyData.department || '',
            role: 'faculty' as const,
            assignedClasses: facultyData.assignedclasses ? facultyData.assignedclasses.split(',') : []
          };
        }).filter((f: any) => f.name);

        setFaculty([...faculty, ...newFaculty]);
        setShowImportModal(false);
      },
      header: false,
      skipEmptyLines: true
    });
  };

  const exportToExcel = () => {
    const exportData = faculty.map(f => ({
      'Faculty ID': f.facultyId,
      'Name': f.name,
      'Email': f.email,
      'Department': f.department,
      'Assigned Classes': f.assignedClasses.map(id => classes.find(c => c.id === id)?.name || id).join(', ')
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Faculty');
    XLSX.writeFile(wb, `faculty_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredFaculty = faculty.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.facultyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Faculty</h2>
        <div className="flex space-x-2">
          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </button>
              <button
                onClick={exportToExcel}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Faculty
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search faculty..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFaculty.map((facultyMember) => (
          <div key={facultyMember.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <User className="h-12 w-12 text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full p-2" />
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {facultyMember.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ID: {facultyMember.facultyId}
                  </p>
                </div>
              </div>
              {user?.role === 'admin' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(facultyMember)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteFaculty(facultyMember.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                {facultyMember.email}
              </div>
              <div className="flex items-center">
                <Building className="h-4 w-4 mr-2" />
                {facultyMember.department}
              </div>
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                {facultyMember.assignedClasses.length} classes assigned
              </div>
            </div>

            <button
              onClick={() => openProfileModal(facultyMember)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              View Profile
            </button>
          </div>
        ))}
      </div>

      {/* Add Faculty Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Add New Faculty
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Faculty ID
                </label>
                <input
                  type="text"
                  value={formData.facultyId}
                  onChange={(e) => setFormData({...formData, facultyId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFaculty}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Add Faculty
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Faculty Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Edit Faculty
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Faculty ID
                </label>
                <input
                  type="text"
                  value={formData.facultyId}
                  onChange={(e) => setFormData({...formData, facultyId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEditFaculty}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Update Faculty
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Faculty Profile Modal */}
      {showProfileModal && selectedFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Faculty Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Personal Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {selectedFaculty.name}</p>
                  <p><span className="font-medium">Email:</span> {selectedFaculty.email}</p>
                  <p><span className="font-medium">Faculty ID:</span> {selectedFaculty.facultyId}</p>
                  <p><span className="font-medium">Department:</span> {selectedFaculty.department}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Assigned Classes</h4>
                <div className="space-y-2">
                  {selectedFaculty.assignedClasses.map((classId: string) => {
                    const classInfo = classes.find(c => c.id === classId);
                    return (
                      <div key={classId} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <p className="font-medium">{classInfo?.name || 'Unknown Class'}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {classInfo?.subject} • {classInfo?.schedule}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Import Faculty from CSV
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload a CSV file with the following columns:
                <br />Name, Email, Faculty ID, Department
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultySection;