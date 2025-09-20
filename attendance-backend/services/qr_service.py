import qrcode
import secrets
import json
from datetime import datetime, timedelta
from typing import Dict, Optional
import io
import base64
from PIL import Image
import logging

logger = logging.getLogger(__name__)

class QRService:
    """Service for QR code generation and validation"""
    
    def __init__(self, size: int = 10, border: int = 4):
        """
        Initialize QR service
        
        Args:
            size: QR code size
            border: QR code border size
        """
        self.size = size
        self.border = border
    
    def generate_class_qr(self, class_id: int, faculty_id: int, 
                         duration_minutes: int = 30) -> Dict:
        """
        Generate QR code for class session
        
        Args:
            class_id: Class session ID
            faculty_id: Faculty member ID
            duration_minutes: QR code validity duration in minutes
            
        Returns:
            Dictionary containing QR data and image
        """
        try:
            # Create unique token
            token = secrets.token_urlsafe(32)
            expires_at = datetime.utcnow() + timedelta(minutes=duration_minutes)
            
            # Create QR data
            qr_data = {
                'class_id': class_id,
                'faculty_id': faculty_id,
                'token': token,
                'expires_at': expires_at.isoformat(),
                'type': 'attendance',
                'generated_at': datetime.utcnow().isoformat()
            }
            
            # Generate QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=self.size,
                border=self.border,
            )
            
            qr.add_data(json.dumps(qr_data))
            qr.make(fit=True)
            
            # Create QR code image
            qr_image = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to base64
            buffer = io.BytesIO()
            qr_image.save(buffer, format='PNG')
            qr_base64 = base64.b64encode(buffer.getvalue()).decode()
            
            return {
                'success': True,
                'qr_data': qr_data,
                'qr_image': f"data:image/png;base64,{qr_base64}",
                'token': token,
                'expires_at': expires_at.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating QR code: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def validate_qr(self, qr_token: str, qr_data: str) -> Dict:
        """
        Validate QR code token
        
        Args:
            qr_token: QR token to validate
            qr_data: QR data string from database
            
        Returns:
            Validation result
        """
        try:
            if not qr_data:
                return {
                    'valid': False,
                    'error': 'No QR data found'
                }
            
            # Parse QR data
            try:
                data = json.loads(qr_data)
            except json.JSONDecodeError:
                return {
                    'valid': False,
                    'error': 'Invalid QR data format'
                }
            
            # Check token match
            if data.get('token') != qr_token:
                return {
                    'valid': False,
                    'error': 'Invalid QR token'
                }
            
            # Check expiration
            expires_at_str = data.get('expires_at')
            if not expires_at_str:
                return {
                    'valid': False,
                    'error': 'No expiration time found'
                }
            
            try:
                expires_at = datetime.fromisoformat(expires_at_str.replace('Z', '+00:00'))
            except ValueError:
                return {
                    'valid': False,
                    'error': 'Invalid expiration time format'
                }
            
            if datetime.utcnow() > expires_at:
                return {
                    'valid': False,
                    'error': 'QR code has expired',
                    'expired_at': expires_at.isoformat()
                }
            
            # Check type
            if data.get('type') != 'attendance':
                return {
                    'valid': False,
                    'error': 'Invalid QR code type'
                }
            
            return {
                'valid': True,
                'data': data,
                'expires_at': expires_at.isoformat(),
                'time_remaining': (expires_at - datetime.utcnow()).total_seconds()
            }
            
        except Exception as e:
            logger.error(f"Error validating QR code: {str(e)}")
            return {
                'valid': False,
                'error': f'Validation error: {str(e)}'
            }
    
    def generate_attendance_qr(self, class_id: int, faculty_id: int, 
                             student_id: int, duration_minutes: int = 5) -> Dict:
        """
        Generate QR code for specific student attendance
        
        Args:
            class_id: Class session ID
            faculty_id: Faculty member ID
            student_id: Student ID
            duration_minutes: QR code validity duration in minutes
            
        Returns:
            Dictionary containing QR data and image
        """
        try:
            # Create unique token
            token = secrets.token_urlsafe(32)
            expires_at = datetime.utcnow() + timedelta(minutes=duration_minutes)
            
            # Create QR data
            qr_data = {
                'class_id': class_id,
                'faculty_id': faculty_id,
                'student_id': student_id,
                'token': token,
                'expires_at': expires_at.isoformat(),
                'type': 'student_attendance',
                'generated_at': datetime.utcnow().isoformat()
            }
            
            # Generate QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=self.size,
                border=self.border,
            )
            
            qr.add_data(json.dumps(qr_data))
            qr.make(fit=True)
            
            # Create QR code image
            qr_image = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to base64
            buffer = io.BytesIO()
            qr_image.save(buffer, format='PNG')
            qr_base64 = base64.b64encode(buffer.getvalue()).decode()
            
            return {
                'success': True,
                'qr_data': qr_data,
                'qr_image': f"data:image/png;base64,{qr_base64}",
                'token': token,
                'expires_at': expires_at.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating attendance QR code: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def generate_bulk_qr(self, class_id: int, faculty_id: int, 
                        student_ids: list, duration_minutes: int = 30) -> Dict:
        """
        Generate QR codes for multiple students
        
        Args:
            class_id: Class session ID
            faculty_id: Faculty member ID
            student_ids: List of student IDs
            duration_minutes: QR code validity duration in minutes
            
        Returns:
            Dictionary containing QR codes for all students
        """
        try:
            qr_codes = {}
            
            for student_id in student_ids:
                qr_result = self.generate_attendance_qr(
                    class_id, faculty_id, student_id, duration_minutes
                )
                
                if qr_result['success']:
                    qr_codes[student_id] = qr_result
                else:
                    qr_codes[student_id] = {
                        'success': False,
                        'error': qr_result.get('error', 'Unknown error')
                    }
            
            return {
                'success': True,
                'qr_codes': qr_codes,
                'total_generated': len([qr for qr in qr_codes.values() if qr['success']]),
                'total_failed': len([qr for qr in qr_codes.values() if not qr['success']])
            }
            
        except Exception as e:
            logger.error(f"Error generating bulk QR codes: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def create_qr_with_custom_data(self, data: Dict, duration_minutes: int = 30) -> Dict:
        """
        Create QR code with custom data
        
        Args:
            data: Custom data dictionary
            duration_minutes: QR code validity duration in minutes
            
        Returns:
            Dictionary containing QR data and image
        """
        try:
            # Add metadata
            qr_data = {
                **data,
                'token': secrets.token_urlsafe(32),
                'expires_at': (datetime.utcnow() + timedelta(minutes=duration_minutes)).isoformat(),
                'generated_at': datetime.utcnow().isoformat()
            }
            
            # Generate QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=self.size,
                border=self.border,
            )
            
            qr.add_data(json.dumps(qr_data))
            qr.make(fit=True)
            
            # Create QR code image
            qr_image = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to base64
            buffer = io.BytesIO()
            qr_image.save(buffer, format='PNG')
            qr_base64 = base64.b64encode(buffer.getvalue()).decode()
            
            return {
                'success': True,
                'qr_data': qr_data,
                'qr_image': f"data:image/png;base64,{qr_base64}",
                'token': qr_data['token'],
                'expires_at': qr_data['expires_at']
            }
            
        except Exception as e:
            logger.error(f"Error creating custom QR code: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def decode_qr_from_image(self, image_data: str) -> Dict:
        """
        Decode QR code from image data
        
        Args:
            image_data: Base64 encoded image data
            
        Returns:
            Decoded QR data
        """
        try:
            # Remove data URL prefix if present
            if image_data.startswith('data:image/'):
                image_data = image_data.split(',')[1]
            
            # Decode base64 to bytes
            image_bytes = base64.b64decode(image_data)
            
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Try to decode QR code
            # Note: This requires additional library like pyzbar
            # For now, return placeholder
            
            return {
                'success': False,
                'error': 'QR code decoding requires pyzbar library'
            }
            
        except Exception as e:
            logger.error(f"Error decoding QR code: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_qr_info(self, qr_data: str) -> Dict:
        """
        Get information about QR code without validating
        
        Args:
            qr_data: QR data string
            
        Returns:
            QR code information
        """
        try:
            if not qr_data:
                return {
                    'success': False,
                    'error': 'No QR data provided'
                }
            
            # Parse QR data
            try:
                data = json.loads(qr_data)
            except json.JSONDecodeError:
                return {
                    'success': False,
                    'error': 'Invalid QR data format'
                }
            
            # Extract information
            info = {
                'success': True,
                'type': data.get('type', 'unknown'),
                'class_id': data.get('class_id'),
                'faculty_id': data.get('faculty_id'),
                'student_id': data.get('student_id'),
                'generated_at': data.get('generated_at'),
                'expires_at': data.get('expires_at'),
                'has_token': 'token' in data
            }
            
            # Check if expired
            if info['expires_at']:
                try:
                    expires_at = datetime.fromisoformat(info['expires_at'].replace('Z', '+00:00'))
                    info['is_expired'] = datetime.utcnow() > expires_at
                    info['time_remaining'] = (expires_at - datetime.utcnow()).total_seconds()
                except ValueError:
                    info['is_expired'] = None
                    info['time_remaining'] = None
            
            return info
            
        except Exception as e:
            logger.error(f"Error getting QR info: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }


