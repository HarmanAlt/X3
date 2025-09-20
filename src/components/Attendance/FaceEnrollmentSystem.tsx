import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { faceRecognitionService } from '../../services/faceRecognition';
import { glassmorphismStyles } from '../../styles/glassmorphism';
import {
  CameraIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  SparklesIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface EnrollmentStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

const FaceEnrollmentSystem: React.FC = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [faceDetected, setFaceDetected] = useState(false);
  const [enrollmentProgress, setEnrollmentProgress] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photoCanvasRef = useRef<HTMLCanvasElement>(null);

  const enrollmentSteps: EnrollmentStep[] = [
    {
      id: 1,
      title: 'Camera Setup',
      description: 'Position your face in the camera frame',
      completed: false
    },
    {
      id: 2,
      title: 'Face Detection',
      description: 'Ensure your face is clearly visible',
      completed: false
    },
    {
      id: 3,
      title: 'Photo Capture',
      description: 'Capture multiple angles of your face',
      completed: false
    },
    {
      id: 4,
      title: 'Enrollment Complete',
      description: 'Your face has been enrolled successfully',
      completed: false
    }
  ];

  useEffect(() => {
    if (showCamera) {
      initializeCamera();
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [showCamera]);

  const initializeCamera = async () => {
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
      console.error('Error initializing camera:', error);
      setMessage('Camera access denied or not available');
      setEnrollmentStatus('error');
    }
  };

  const startFaceDetection = () => {
    const detectFaces = async () => {
      if (videoRef.current && canvasRef.current) {
        try {
          const detections = await faceRecognitionService.detectFaces(videoRef.current);
          
          if (detections.length > 0) {
            setFaceDetected(true);
            setEnrollmentSteps(prev => prev.map(step => 
              step.id === 2 ? { ...step, completed: true } : step
            ));
          } else {
            setFaceDetected(false);
            setEnrollmentSteps(prev => prev.map(step => 
              step.id === 2 ? { ...step, completed: false } : step
            ));
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

  const capturePhoto = async (): Promise<string> => {
    if (videoRef.current && photoCanvasRef.current) {
      const canvas = photoCanvasRef.current;
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

  const enrollFace = async () => {
    if (!faceDetected) {
      setMessage('Please ensure your face is clearly visible in the camera');
      setEnrollmentStatus('error');
      return;
    }

    setIsEnrolling(true);
    setEnrollmentStatus('idle');
    setMessage('Enrolling your face...');

    try {
      // Capture multiple photos for better recognition
      const photos: string[] = [];
      for (let i = 0; i < 5; i++) {
        const photo = await capturePhoto();
        photos.push(photo);
        setEnrollmentProgress((i + 1) * 20);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setCapturedPhotos(photos);

      // Enroll face using the first photo
      if (videoRef.current) {
        await faceRecognitionService.enrollFace(videoRef.current, user?.id || '');
      }

      setEnrollmentSteps(prev => prev.map(step => 
        step.id === 3 ? { ...step, completed: true } : step
      ));

      setMessage('Face enrollment completed successfully!');
      setEnrollmentStatus('success');
      setShowPreview(true);

    } catch (error) {
      console.error('Face enrollment error:', error);
      setMessage('Face enrollment failed. Please try again.');
      setEnrollmentStatus('error');
    } finally {
      setIsEnrolling(false);
    }
  };

  const startEnrollment = () => {
    setShowCamera(true);
    setEnrollmentSteps(prev => prev.map(step => 
      step.id === 1 ? { ...step, completed: true } : step
    ));
  };

  const resetEnrollment = () => {
    setCurrentStep(0);
    setIsEnrolling(false);
    setEnrollmentStatus('idle');
    setMessage('');
    setFaceDetected(false);
    setEnrollmentProgress(0);
    setShowCamera(false);
    setCapturedPhotos([]);
    setShowPreview(false);
    setEnrollmentSteps(prev => prev.map(step => ({ ...step, completed: false })));
  };

  return (
    <div className={`${glassmorphismStyles.background.primary} min-h-screen p-6`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className={`${glassmorphismStyles.card.base} ${glassmorphismStyles.card.hover} p-8`}>
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                Face Enrollment System
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Register your face for attendance recognition
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {enrollmentSteps.map((step, index) => (
              <div key={step.id} className="text-center">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                  step.completed 
                    ? 'bg-green-500 text-white' 
                    : index === currentStep
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}>
                  {step.completed ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    <span className="font-semibold">{step.id}</span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">
                  {step.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className={`${glassmorphismStyles.card.base} ${glassmorphismStyles.card.hover} p-6`}>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Enrollment Instructions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                ✅ Do's:
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Ensure good lighting</li>
                <li>• Look directly at the camera</li>
                <li>• Keep your face centered</li>
                <li>• Remove glasses if possible</li>
                <li>• Maintain a neutral expression</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                ❌ Don'ts:
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Don't wear hats or masks</li>
                <li>• Avoid extreme angles</li>
                <li>• Don't move during capture</li>
                <li>• Avoid backlighting</li>
                <li>• Don't use filters or effects</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Camera Section */}
        {showCamera && (
          <div className={`${glassmorphismStyles.card.base} ${glassmorphismStyles.card.hover} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Camera Feed
              </h2>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  faceDetected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`} />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {faceDetected ? 'Face Detected' : 'No Face'}
                </span>
              </div>
            </div>

            <div className="relative mb-6">
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

              {/* Face Detection Overlay */}
              {faceDetected && (
                <div className="absolute top-4 left-4 bg-green-500/80 text-white px-3 py-1 rounded-full text-sm font-medium">
                  ✓ Face Detected
                </div>
              )}
            </div>

            {/* Enrollment Progress */}
            {isEnrolling && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enrollment Progress
                  </span>
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    {enrollmentProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${enrollmentProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex items-center space-x-4">
              {!isEnrolling && (
                <button
                  onClick={enrollFace}
                  disabled={!faceDetected}
                  className={`${glassmorphismStyles.button.primary} ${
                    !faceDetected ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <CameraIcon className="w-5 h-5 mr-2" />
                  Start Enrollment
                </button>
              )}

              <button
                onClick={resetEnrollment}
                className={glassmorphismStyles.button.secondary}
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {message && (
          <div className={`${glassmorphismStyles.card.base} p-4 ${
            enrollmentStatus === 'success' 
              ? 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : enrollmentStatus === 'error'
              ? 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              : 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
          }`}>
            <div className="flex items-center">
              {enrollmentStatus === 'success' && <CheckCircleIcon className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />}
              {enrollmentStatus === 'error' && <XCircleIcon className="w-5 h-5 mr-2 text-red-600 dark:text-red-400" />}
              <span className={`font-medium ${
                enrollmentStatus === 'success' 
                  ? 'text-green-800 dark:text-green-300'
                  : enrollmentStatus === 'error'
                  ? 'text-red-800 dark:text-red-300'
                  : 'text-blue-800 dark:text-blue-300'
              }`}>
                {message}
              </span>
            </div>
          </div>
        )}

        {/* Photo Preview */}
        {showPreview && capturedPhotos.length > 0 && (
          <div className={`${glassmorphismStyles.card.base} ${glassmorphismStyles.card.hover} p-6`}>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Captured Photos
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {capturedPhotos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo}
                    alt={`Enrollment photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg shadow-md"
                  />
                  <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Start Button */}
        {!showCamera && (
          <div className="text-center">
            <button
              onClick={startEnrollment}
              className={`${glassmorphismStyles.button.primary} text-lg px-8 py-4`}
            >
              <SparklesIcon className="w-6 h-6 mr-2" />
              Start Face Enrollment
            </button>
          </div>
        )}

        {/* Hidden canvas for photo capture */}
        <canvas
          ref={photoCanvasRef}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default FaceEnrollmentSystem;

