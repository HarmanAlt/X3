import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import {
  XMarkIcon,
  CameraIcon,
  QrCodeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ModernQRScannerProps {
  onScanSuccess: (data: string) => void;
  onClose: () => void;
}

const ModernQRScanner: React.FC<ModernQRScannerProps> = ({ onScanSuccess, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [qrScanner, setQrScanner] = useState<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [scanResult, setScanResult] = useState<string | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code detected:', result);
          setScanResult(result.data);
          setTimeout(() => {
            onScanSuccess(result.data);
            scanner.stop();
          }, 1500);
        },
        {
          onDecodeError: (error) => {
            // Ignore decode errors as they're common when no QR code is in view
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      
      setQrScanner(scanner);
      
      scanner.start().then(() => {
        setIsScanning(true);
        setError('');
      }).catch((err) => {
        console.error('Failed to start QR scanner:', err);
        setError('Failed to access camera. Please ensure camera permissions are granted.');
      });

      return () => {
        scanner.stop();
        scanner.destroy();
      };
    }
  }, [onScanSuccess]);

  const handleClose = () => {
    if (qrScanner) {
      qrScanner.stop();
      qrScanner.destroy();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <QrCodeIcon className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-bold">QR Code Scanner</h3>
                <p className="text-indigo-100">Position QR code in the frame</p>
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

        {/* Scanner Content */}
        <div className="p-6">
          {error ? (
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 mb-4 font-medium">{error}</p>
              <button
                onClick={handleClose}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-200"
              >
                Close
              </button>
            </div>
          ) : scanResult ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-gray-800 mb-2">Scan Successful!</h4>
              <p className="text-gray-600 mb-4">Attendance marked successfully</p>
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                <p className="text-sm text-green-700 font-mono break-all">{scanResult}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Camera Preview */}
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-64 bg-gray-900 rounded-2xl object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
                {!isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-2xl">
                    <div className="text-center text-white">
                      <CameraIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">Initializing camera...</p>
                    </div>
                  </div>
                )}
                
                {/* Scanning Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-4 border-white rounded-2xl relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-2xl"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-2xl"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-2xl"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-2xl"></div>
                      
                      {/* Scanning Line */}
                      <div className="absolute inset-x-0 top-1/2 h-0.5 bg-indigo-500 animate-pulse"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Hold your device steady and position the QR code within the frame
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Scanning for QR codes...</span>
                </div>
              </div>

              {/* Cancel Button */}
              <button
                onClick={handleClose}
                className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel Scanning
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernQRScanner;