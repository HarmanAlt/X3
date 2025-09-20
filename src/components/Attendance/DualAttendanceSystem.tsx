import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { faceRecognitionService } from '../../services/faceRecognition';
import { glassmorphismStyles } from '../../styles/glassmorphism';
import {
  QrCodeIcon,
  CameraIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  SparklesIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface AttendanceMode {
  id: 'qr' | 'face';
  name: string;
  icon: React.ComponentType<any>;
  description: string;
}

const attendanceModes: AttendanceMode[] = [
  {
    id: 'qr',
    name: 'QR Code Scanner',
    icon: QrCodeIcon,
    description: 'Scan QR code for quick attendance'
  },
  {
    id: 'face',
    name: 'Face Recognition',
    icon: CameraIcon,
    description: 'Use facial recognition for attendance'
  }
];

const DualAttendanceSystem: React.FC = () => {
  const { user } = useAuth();
  const { classes, attendanceRecords, setAttendanceRecords } = useApp();
  const [selectedMode, setSelectedMode] = useState<'qr' | 'face'>('qr');
  const [isScanning, setIsScanning] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<any>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrScannerRef = useRef<any>(null);

  useEffect(() => {
    if (selectedMode === 'face' && showCamera) {
      initializeFaceRecognition();
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [selectedMode, showCamera]);

  const initializeFaceRecognition = async () => {
    try {
      await faceRecognitionService.loadModels();
      
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: 640, 
            height: 480,
            facingMode: 'user'
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          startFaceDetection();
        }
      }
    } catch (error) {
      console.error('Error initializing face recognition:', error);
      setMessage('Camera access denied or not available');
      setAttendanceStatus('error');
    }
  };

  const startFaceDetection = () => {
    const detectFaces = async () => {
      if (videoRef.current && canvasRef.current) {
        try {
          const detections = await faceRecognitionService.detectFaces(videoRef.current);
          
          if (detections.length > 0) {
            setFaceDetected(true);
            
            // Try to recognize the face
            const result = await faceRecognitionService.recognizeFace(videoRef.current);
            setRecognitionResult(result);
            
            if (result.recognized && result.userId === user?.id) {
              await markAttendance('face', result.confidence);
            }
          } else {
            setFaceDetected(false);
            setRecognitionResult(null);
          }
          
          // Draw face detections
          await faceRecognitionService.drawFaceDetections(canvasRef.current, detections);
          
        } catch (error) {
          console.error('Face detection error:', error);
        }
      }
      
      if (showCamera) {
        requestAnimationFrame(detectFaces);
      }
    };
    
    detectFaces();
  };

  const initializeQRScanner = async () => {
    try {
      const QrScanner = (await import('qr-scanner')).default;
      
      if (videoRef.current) {
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            handleQRResult(result);
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );
        
        await qrScannerRef.current.start();
      }
    } catch (error) {
      console.error('QR Scanner initialization error:', error);
      setMessage('QR Scanner initialization failed');
      setAttendanceStatus('error');
    }
  };

  const handleQRResult = (result: string) => {
    try {
      const qrData = JSON.parse(result);
      if (qrData.classId === selectedClass && qrData.type === 'attendance') {
        markAttendance('qr', 1.0);
      } else {
        setMessage('Invalid QR code for this class');
        setAttendanceStatus('error');
      }
    } catch (error) {
      setMessage('Invalid QR code format');
      setAttendanceStatus('error');
    }
  };

  const markAttendance = async (method: 'qr' | 'face', confidence: number) => {
    try {
      const attendanceRecord = {
        id: Date.now().toString(),
        studentId: user?.id || '',
        studentName: user?.name || '',
        classId: selectedClass,
        method,
        confidence,
        timestamp: new Date().toISOString(),
        photo: method === 'face' ? await capturePhoto() : null
      };

      setAttendanceRecords([...attendanceRecords, attendanceRecord]);
      setMessage(`Attendance marked successfully using ${method === 'qr' ? 'QR Code' : 'Face Recognition'}`);
      setAttendanceStatus('success');
      
      // Stop scanning
      setIsScanning(false);
      setShowCamera(false);
      
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
      }
      
    } catch (error) {
      console.error('Error marking attendance:', error);
      setMessage('Failed to mark attendance');
      setAttendanceStatus('error');
    }
  };

  const capturePhoto = async (): Promise<string> => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        return canvas.toDataURL('image/jpeg', 0.8);
      }
    }
    return '';
  };

  const startScanning = async () => {
    if (!selectedClass) {
      setMessage('Please select a class first');
      setAttendanceStatus('error');
      return;
    }

    setIsScanning(true);
    setAttendanceStatus('idle');
    setMessage('');

    if (selectedMode === 'qr') {
      setShowCamera(true);
      await initializeQRScanner();
    } else {
      setShowCamera(true);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    setShowCamera(false);
    setFaceDetected(false);
    setRecognitionResult(null);
    
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div className={`${glassmorphismStyles.background.primary} min-h-screen p-6`}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className={`${glassmorphismStyles.card.base} ${glassmorphismStyles.card.hover} p-8`}>
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                Student Attendance Portal
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Choose your preferred attendance method
              </p>
            </div>
          </div>

          {/* Class Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Select Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className={`${glassmorphismStyles.input.base} w-full max-w-md`}
            >
              <option value="">Choose a class...</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - {cls.subject}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Attendance Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {attendanceModes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedMode === mode.id;
            
            return (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`${glassmorphismStyles.card.base} ${glassmorphismStyles.card.hover} p-6 text-left transition-all duration-300 ${
                  isSelected ? glassmorphismStyles.card.active : ''
                }`}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`p-3 rounded-xl ${
                    isSelected 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                    }`} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-semibold ${
                      isSelected 
                        ? 'text-indigo-600 dark:text-indigo-400' 
                        : 'text-gray-800 dark:text-gray-100'
                    }`}>
                      {mode.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {mode.description}
                    </p>
                  </div>
                </div>
                
                {isSelected && (
                  <div className="flex items-center text-indigo-600 dark:text-indigo-400">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Selected</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Control Panel */}
        <div className={`${glassmorphismStyles.card.base} ${glassmorphismStyles.card.hover} p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Attendance Control
            </h2>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                isScanning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`} />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {isScanning ? 'Scanning...' : 'Ready'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={startScanning}
              disabled={isScanning || !selectedClass}
              className={`${glassmorphismStyles.button.primary} ${
                isScanning || !selectedClass ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <CameraIcon className="w-5 h-5 mr-2" />
              Start {selectedMode === 'qr' ? 'QR Scanning' : 'Face Recognition'}
            </button>

            {isScanning && (
              <button
                onClick={stopScanning}
                className={glassmorphismStyles.button.secondary}
              >
                <XCircleIcon className="w-5 h-5 mr-2" />
                Stop Scanning
              </button>
            )}
          </div>

          {/* Status Messages */}
          {message && (
            <div className={`mt-4 p-4 rounded-xl ${
              attendanceStatus === 'success' 
                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                : attendanceStatus === 'error'
                ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
            }`}>
              <div className="flex items-center">
                {attendanceStatus === 'success' && <CheckCircleIcon className="w-5 h-5 mr-2" />}
                {attendanceStatus === 'error' && <XCircleIcon className="w-5 h-5 mr-2" />}
                {attendanceStatus === 'idle' && <ClockIcon className="w-5 h-5 mr-2" />}
                <span className="font-medium">{message}</span>
              </div>
            </div>
          )}
        </div>

        {/* Camera Feed */}
        {showCamera && (
          <div className={`${glassmorphismStyles.card.base} ${glassmorphismStyles.card.hover} p-6`}>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Camera Feed
            </h3>
            
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full max-w-2xl mx-auto rounded-xl shadow-lg"
                autoPlay
                muted
                playsInline
              />
              
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full rounded-xl pointer-events-none"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              
              {/* Face Recognition Status */}
              {selectedMode === 'face' && (
                <div className="absolute top-4 right-4 space-y-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    faceDetected 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-300'
                  }`}>
                    {faceDetected ? 'Face Detected' : 'No Face'}
                  </div>
                  
                  {recognitionResult && (
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      recognitionResult.recognized
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                    }`}>
                      {recognitionResult.recognized 
                        ? `Recognized (${(recognitionResult.confidence * 100).toFixed(1)}%)`
                        : 'Not Recognized'
                      }
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Attendance */}
        <div className={`${glassmorphismStyles.card.base} ${glassmorphismStyles.card.hover} p-6`}>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Recent Attendance Records
          </h3>
          
          <div className="space-y-3">
            {attendanceRecords
              .filter(record => record.studentId === user?.id)
              .slice(-5)
              .reverse()
              .map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-white/20 dark:bg-gray-800/20 rounded-xl">
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
                        {record.classId}
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
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DualAttendanceSystem;

