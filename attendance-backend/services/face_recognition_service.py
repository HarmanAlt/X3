import face_recognition
import cv2
import numpy as np
import base64
from PIL import Image
import io
from typing import List, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class FaceRecognitionService:
    """Service for face recognition operations"""
    
    def __init__(self, tolerance: float = 0.6, model: str = 'hog'):
        """
        Initialize face recognition service
        
        Args:
            tolerance: Face recognition tolerance (lower = more strict)
            model: Face detection model ('hog' or 'cnn')
        """
        self.tolerance = tolerance
        self.model = model
    
    def encode_face_from_base64(self, base64_image: str) -> Optional[np.ndarray]:
        """
        Encode face from base64 image string
        
        Args:
            base64_image: Base64 encoded image string
            
        Returns:
            Face encoding array or None if no face detected
        """
        try:
            # Remove data URL prefix if present
            if base64_image.startswith('data:image/'):
                base64_image = base64_image.split(',')[1]
            
            # Decode base64 to bytes
            image_bytes = base64.b64decode(base64_image)
            
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert PIL Image to RGB numpy array
            image_array = np.array(image)
            
            # Convert RGB to BGR for OpenCV
            if len(image_array.shape) == 3:
                image_array = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
            
            return self.encode_face(image_array)
            
        except Exception as e:
            logger.error(f"Error encoding face from base64: {str(e)}")
            return None
    
    def encode_face(self, image_array: np.ndarray) -> Optional[np.ndarray]:
        """
        Encode face from image array
        
        Args:
            image_array: Image as numpy array
            
        Returns:
            Face encoding array or None if no face detected
        """
        try:
            # Detect face locations
            face_locations = face_recognition.face_locations(image_array, model=self.model)
            
            if not face_locations:
                logger.warning("No face detected in image")
                return None
            
            if len(face_locations) > 1:
                logger.warning(f"Multiple faces detected ({len(face_locations)}), using first one")
            
            # Get face encodings
            face_encodings = face_recognition.face_encodings(image_array, face_locations)
            
            if not face_encodings:
                logger.warning("Could not encode face")
                return None
            
            return face_encodings[0]
            
        except Exception as e:
            logger.error(f"Error encoding face: {str(e)}")
            return None
    
    def compare_faces(self, known_encodings: List[np.ndarray], unknown_encoding: np.ndarray) -> bool:
        """
        Compare unknown face with known encodings
        
        Args:
            known_encodings: List of known face encodings
            unknown_encoding: Unknown face encoding to compare
            
        Returns:
            True if face matches, False otherwise
        """
        try:
            if not known_encodings or unknown_encoding is None:
                return False
            
            # Compare faces
            matches = face_recognition.compare_faces(
                known_encodings, 
                unknown_encoding, 
                tolerance=self.tolerance
            )
            
            return any(matches)
            
        except Exception as e:
            logger.error(f"Error comparing faces: {str(e)}")
            return False
    
    def face_distance(self, known_encodings: List[np.ndarray], unknown_encoding: np.ndarray) -> List[float]:
        """
        Calculate face distances
        
        Args:
            known_encodings: List of known face encodings
            unknown_encoding: Unknown face encoding
            
        Returns:
            List of distances
        """
        try:
            if not known_encodings or unknown_encoding is None:
                return [1.0]  # Maximum distance
            
            return face_recognition.face_distance(known_encodings, unknown_encoding)
            
        except Exception as e:
            logger.error(f"Error calculating face distance: {str(e)}")
            return [1.0]
    
    def detect_faces(self, image_array: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """
        Detect face locations in image
        
        Args:
            image_array: Image as numpy array
            
        Returns:
            List of face locations (top, right, bottom, left)
        """
        try:
            return face_recognition.face_locations(image_array, model=self.model)
        except Exception as e:
            logger.error(f"Error detecting faces: {str(e)}")
            return []
    
    def detect_face_landmarks(self, image_array: np.ndarray) -> List[dict]:
        """
        Detect face landmarks
        
        Args:
            image_array: Image as numpy array
            
        Returns:
            List of face landmarks
        """
        try:
            face_locations = self.detect_faces(image_array)
            if not face_locations:
                return []
            
            landmarks = face_recognition.face_landmarks(image_array, face_locations)
            
            result = []
            for i, landmark in enumerate(landmarks):
                result.append({
                    'face_location': face_locations[i],
                    'landmarks': landmark
                })
            
            return result
            
        except Exception as e:
            logger.error(f"Error detecting face landmarks: {str(e)}")
            return []
    
    def detect_face_expressions(self, image_array: np.ndarray) -> List[dict]:
        """
        Detect face expressions
        
        Args:
            image_array: Image as numpy array
            
        Returns:
            List of face expressions
        """
        try:
            face_locations = self.detect_faces(image_array)
            if not face_locations:
                return []
            
            encodings = face_recognition.face_encodings(image_array, face_locations)
            if not encodings:
                return []
            
            # Note: face_recognition library doesn't have built-in expression detection
            # This is a placeholder for future implementation
            # You might want to integrate with other libraries like OpenCV or MediaPipe
            
            result = []
            for i, encoding in enumerate(encodings):
                result.append({
                    'face_location': face_locations[i],
                    'encoding': encoding,
                    'expressions': {
                        'happy': 0.0,  # Placeholder
                        'sad': 0.0,    # Placeholder
                        'angry': 0.0,  # Placeholder
                        'surprised': 0.0,  # Placeholder
                        'neutral': 1.0  # Placeholder
                    }
                })
            
            return result
            
        except Exception as e:
            logger.error(f"Error detecting face expressions: {str(e)}")
            return []
    
    def detect_liveness(self, image_array: np.ndarray) -> dict:
        """
        Basic liveness detection
        
        Args:
            image_array: Image as numpy array
            
        Returns:
            Liveness detection results
        """
        try:
            # This is a basic implementation
            # In production, you'd want more sophisticated liveness detection
            
            faces = self.detect_faces(image_array)
            landmarks = self.detect_face_landmarks(image_array)
            
            liveness_score = 0.0
            liveness_factors = []
            
            if faces:
                liveness_score += 0.3
                liveness_factors.append('face_detected')
            
            if landmarks:
                liveness_score += 0.3
                liveness_factors.append('landmarks_detected')
                
                # Check for eye landmarks (basic blink detection)
                for landmark in landmarks:
                    if 'left_eye' in landmark['landmarks'] and 'right_eye' in landmark['landmarks']:
                        liveness_score += 0.2
                        liveness_factors.append('eyes_detected')
                        break
            
            # Check image quality
            gray = cv2.cvtColor(image_array, cv2.COLOR_BGR2GRAY)
            blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
            
            if blur_score > 100:  # Threshold for sharpness
                liveness_score += 0.2
                liveness_factors.append('good_image_quality')
            
            return {
                'liveness_score': min(1.0, liveness_score),
                'is_live': liveness_score > 0.7,
                'factors': liveness_factors,
                'blur_score': blur_score
            }
            
        except Exception as e:
            logger.error(f"Error detecting liveness: {str(e)}")
            return {
                'liveness_score': 0.0,
                'is_live': False,
                'factors': [],
                'blur_score': 0.0
            }
    
    def numpy_array_from_list(self, encoding_list: List[float]) -> np.ndarray:
        """
        Convert list to numpy array
        
        Args:
            encoding_list: List of encoding values
            
        Returns:
            Numpy array
        """
        try:
            return np.array(encoding_list, dtype=np.float64)
        except Exception as e:
            logger.error(f"Error converting list to numpy array: {str(e)}")
            return np.array([])
    
    def validate_image_quality(self, image_array: np.ndarray) -> dict:
        """
        Validate image quality for face recognition
        
        Args:
            image_array: Image as numpy array
            
        Returns:
            Quality validation results
        """
        try:
            height, width = image_array.shape[:2]
            
            # Check image size
            min_size = 100
            size_valid = height >= min_size and width >= min_size
            
            # Check aspect ratio
            aspect_ratio = width / height
            aspect_valid = 0.5 <= aspect_ratio <= 2.0
            
            # Check brightness
            gray = cv2.cvtColor(image_array, cv2.COLOR_BGR2GRAY)
            brightness = np.mean(gray)
            brightness_valid = 50 <= brightness <= 200
            
            # Check contrast
            contrast = np.std(gray)
            contrast_valid = contrast > 30
            
            # Check blur
            blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
            blur_valid = blur_score > 50
            
            quality_score = sum([
                size_valid,
                aspect_valid,
                brightness_valid,
                contrast_valid,
                blur_valid
            ]) / 5.0
            
            return {
                'quality_score': quality_score,
                'is_valid': quality_score > 0.6,
                'checks': {
                    'size_valid': size_valid,
                    'aspect_valid': aspect_valid,
                    'brightness_valid': brightness_valid,
                    'contrast_valid': contrast_valid,
                    'blur_valid': blur_valid
                },
                'metrics': {
                    'width': width,
                    'height': height,
                    'aspect_ratio': aspect_ratio,
                    'brightness': brightness,
                    'contrast': contrast,
                    'blur_score': blur_score
                }
            }
            
        except Exception as e:
            logger.error(f"Error validating image quality: {str(e)}")
            return {
                'quality_score': 0.0,
                'is_valid': False,
                'checks': {},
                'metrics': {}
            }


