import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { X, Camera } from 'lucide-react';

interface QRCodeScannerProps {
  onScanSuccess: (data: string) => void;
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScanSuccess, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [qrScanner, setQrScanner] = useState<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (videoRef.current) {
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code detected:', result);
          onScanSuccess(result.data);
          scanner.stop();
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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Scan QR Code
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {error ? (
          <div className="text-center py-8">
            <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 bg-gray-200 rounded-lg object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg">
                  <div className="text-center">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Initializing camera...</p>
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Position the QR code within the camera frame to mark your attendance
            </p>
            
            <div className="flex justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeScanner;