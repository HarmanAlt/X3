"""
Simplified Face Recognition Service for Windows
This version doesn't require dlib/CMake installation
"""

import base64
import numpy as np
from PIL import Image
import io

class FaceRecognitionService:
    """Simplified face recognition service for demo purposes"""
    
    def __init__(self):
        self.tolerance = 0.6
    
    def encode_face_from_base64(self, image_data):
        """Encode face from base64 image data (simplified version)"""
        try:
            # Remove data URL prefix if present
            if image_data.startswith('data:image/'):
                image_data = image_data.split(',')[1]
            
            # Decode base64 image
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # For demo purposes, return a dummy encoding
            # In a real implementation, you would use face_recognition library here
            return np.random.rand(128)  # Dummy 128-dimensional encoding
            
        except Exception as e:
            print(f"Error encoding face: {e}")
            return None
    
    def compare_faces(self, known_encodings, face_encoding_to_check):
        """Compare face encodings (simplified version)"""
        try:
            # For demo purposes, always return True
            # In a real implementation, you would compare the encodings
            return [True] * len(known_encodings)
        except Exception as e:
            print(f"Error comparing faces: {e}")
            return [False] * len(known_encodings)
    
    def face_distance(self, face_encodings, face_to_compare):
        """Calculate face distance (simplified version)"""
        try:
            # For demo purposes, return random distances
            # In a real implementation, you would calculate actual distances
            return np.random.rand(len(face_encodings)) * 0.5
        except Exception as e:
            print(f"Error calculating face distance: {e}")
            return np.ones(len(face_encodings))
    
    def numpy_array_from_list(self, encoding_list):
        """Convert list to numpy array"""
        return np.array(encoding_list)
