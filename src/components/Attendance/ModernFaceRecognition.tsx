import React, { useRef, useState, useEffect } from 'react';
import {
  XMarkIcon,
  CameraIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface ModernFaceRecognitionProps {
  onRecognitionSuccess: (studentData: any) => void;
  onClose: () => void;
}

const ModernFaceRecognition: React.FC<ModernFaceRecognitionProps> = ({ 
  onRecognitionSuccess, 
  onClose 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [recognitionResult, setRecognitionResult] = useState<any>(null);
  const [confidence, setConfidence] = useState(0);
  const [scanningProgress, setScanningProgress] = useState(0);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera access is not supported in this browser');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraStream(stream);
      setIsScanning(true);
      
      // Simulate face recognition process
      simulateFaceRecognition();
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError('Camera access denied or not available. Please allow camera permissions and try again.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsScanning(false);
  };

  const simulateFaceRecognition = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      setScanningProgress(Math.min(progress, 100));
      
      if (progress >= 100) {
        clearInterval(interval);
        // Simulate successful recognition
        setTimeout(() => {
          const mockStudent = {
            id: 'STU001',
            name: 'John Smith',
            confidence: 95.8
          };
          setRecognitionResult(mockStudent);
          setConfidence(mockStudent.confidence);
          
          setTimeout(() => {
            onRecognitionSuccess(mockStudent);
          }, 2000);
        }, 500);
      }
    }, 200);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UserIcon className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-bold">Face Recognition</h3>
                <p className="text-green-100">AI-powered attendance check-in</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Recognition Content */}
        <div className="p-6">
          {error ? (
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 mb-4 font-medium">{error}</p>
              <button
                onClick={handleClose}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-200"
              >
                Close
              </button>
            </div>
          ) : recognitionResult ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-gray-800 mb-2">Recognition Successful!</h4>
              <p className="text-gray-600 mb-6">Student identified with high confidence</p>
              
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {recognitionResult.name.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                </div>
                <h5 className="text-lg font-bold text-gray-800 mb-2">{recognitionResult.name}</h5>
                <p className="text-gray-600 mb-3">Student ID: {recognitionResult.id}</p>
                <div className="flex items-center justify-center space-x-2">
                  <SparklesIcon className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-600">
                    {confidence}% Confidence
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Camera Preview */}
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-64 bg-gray-900 rounded-2xl object-cover"
                />
                
                {!isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-2xl">
                    <div className="text-center text-white">
                      <CameraIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">Initializing camera...</p>
                    </div>
                  </div>
                )}

                {/* Face Detection Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      {/* Face Detection Frame */}
                      <div className="w-48 h-56 border-4 border-green-400 rounded-3xl relative">
                        <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-2xl"></div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-2xl"></div>
                        <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-2xl"></div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-2xl"></div>
                        
                        {/* Scanning Animation */}
                        <div className="absolute inset-0 bg-green-400/10 rounded-3xl animate-pulse"></div>
                      </div>
                      
                      {/* Progress Indicator */}
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-full">
                        <div className="bg-white/90 rounded-full p-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${scanningProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  Position your face in the frame
                </h4>
                <p className="text-gray-600 mb-4">
                  Look directly at the camera and stay still for best results
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Analyzing facial features... {Math.round(scanningProgress)}%</span>
                </div>
              </div>

              {/* Cancel Button */}
              <button
                onClick={handleClose}
                className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel Recognition
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernFaceRecognition;