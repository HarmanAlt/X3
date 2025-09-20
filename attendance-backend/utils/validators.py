import re
from typing import List, Optional
from datetime import datetime

def validate_email(email: str) -> bool:
    """
    Validate email format
    
    Args:
        email: Email address to validate
        
    Returns:
        True if valid, False otherwise
    """
    if not email or not isinstance(email, str):
        return False
    
    # Basic email regex pattern
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email.strip()) is not None

def validate_role(role: str) -> bool:
    """
    Validate user role
    
    Args:
        role: Role to validate
        
    Returns:
        True if valid, False otherwise
    """
    valid_roles = ['student', 'faculty', 'admin']
    return role.lower().strip() in valid_roles

def validate_attendance_method(method: str) -> bool:
    """
    Validate attendance method
    
    Args:
        method: Attendance method to validate
        
    Returns:
        True if valid, False otherwise
    """
    valid_methods = ['face_recognition', 'qr_code']
    return method.lower().strip() in valid_methods

def validate_class_id(class_id) -> bool:
    """
    Validate class ID
    
    Args:
        class_id: Class ID to validate
        
    Returns:
        True if valid, False otherwise
    """
    try:
        return isinstance(class_id, int) and class_id > 0
    except (ValueError, TypeError):
        return False

def validate_user_id(user_id) -> bool:
    """
    Validate user ID
    
    Args:
        user_id: User ID to validate
        
    Returns:
        True if valid, False otherwise
    """
    try:
        return isinstance(user_id, int) and user_id > 0
    except (ValueError, TypeError):
        return False

def validate_date_string(date_string: str) -> bool:
    """
    Validate date string format (ISO format)
    
    Args:
        date_string: Date string to validate
        
    Returns:
        True if valid, False otherwise
    """
    if not date_string or not isinstance(date_string, str):
        return False
    
    try:
        # Try to parse ISO format
        datetime.fromisoformat(date_string.replace('Z', '+00:00'))
        return True
    except ValueError:
        return False

def validate_image_data(image_data: str) -> bool:
    """
    Validate base64 image data
    
    Args:
        image_data: Base64 image data to validate
        
    Returns:
        True if valid, False otherwise
    """
    if not image_data or not isinstance(image_data, str):
        return False
    
    # Check if it's a data URL
    if image_data.startswith('data:image/'):
        return True
    
    # Check if it's base64
    try:
        import base64
        base64.b64decode(image_data)
        return True
    except Exception:
        return False

def validate_qr_token(qr_token: str) -> bool:
    """
    Validate QR token format
    
    Args:
        qr_token: QR token to validate
        
    Returns:
        True if valid, False otherwise
    """
    if not qr_token or not isinstance(qr_token, str):
        return False
    
    # QR tokens should be URL-safe base64 strings
    pattern = r'^[A-Za-z0-9_-]+$'
    return re.match(pattern, qr_token) is not None

def validate_confidence_score(score: float) -> bool:
    """
    Validate confidence score
    
    Args:
        score: Confidence score to validate
        
    Returns:
        True if valid, False otherwise
    """
    try:
        score_float = float(score)
        return 0.0 <= score_float <= 1.0
    except (ValueError, TypeError):
        return False

def validate_pagination_params(limit: int, offset: int) -> bool:
    """
    Validate pagination parameters
    
    Args:
        limit: Limit parameter
        offset: Offset parameter
        
    Returns:
        True if valid, False otherwise
    """
    try:
        limit_int = int(limit)
        offset_int = int(offset)
        
        return (0 < limit_int <= 1000 and 
                offset_int >= 0)
    except (ValueError, TypeError):
        return False

def validate_class_settings(settings: dict) -> bool:
    """
    Validate class settings
    
    Args:
        settings: Settings dictionary to validate
        
    Returns:
        True if valid, False otherwise
    """
    if not isinstance(settings, dict):
        return False
    
    # Check for required fields
    required_fields = ['name', 'start_time']
    for field in required_fields:
        if field not in settings:
            return False
    
    # Validate name
    if not isinstance(settings['name'], str) or len(settings['name'].strip()) == 0:
        return False
    
    # Validate start_time
    if not validate_date_string(settings['start_time']):
        return False
    
    # Validate optional fields
    if 'end_time' in settings and settings['end_time']:
        if not validate_date_string(settings['end_time']):
            return False
    
    if 'max_students' in settings and settings['max_students']:
        try:
            max_students = int(settings['max_students'])
            if max_students <= 0:
                return False
        except (ValueError, TypeError):
            return False
    
    return True

def validate_attendance_data(data: dict) -> bool:
    """
    Validate attendance data
    
    Args:
        data: Attendance data dictionary to validate
        
    Returns:
        True if valid, False otherwise
    """
    if not isinstance(data, dict):
        return False
    
    # Check required fields
    required_fields = ['class_id', 'method']
    for field in required_fields:
        if field not in data:
            return False
    
    # Validate class_id
    if not validate_class_id(data['class_id']):
        return False
    
    # Validate method
    if not validate_attendance_method(data['method']):
        return False
    
    # Validate image data if method is face_recognition
    if data['method'] == 'face_recognition':
        if 'image' not in data:
            return False
        if not validate_image_data(data['image']):
            return False
    
    # Validate QR token if method is qr_code
    if data['method'] == 'qr_code':
        if 'qr_token' not in data:
            return False
        if not validate_qr_token(data['qr_token']):
            return False
    
    return True

def validate_analytics_params(params: dict) -> bool:
    """
    Validate analytics parameters
    
    Args:
        params: Analytics parameters to validate
        
    Returns:
        True if valid, False otherwise
    """
    if not isinstance(params, dict):
        return False
    
    # Validate date range
    if 'start_date' in params and params['start_date']:
        if not validate_date_string(params['start_date']):
            return False
    
    if 'end_date' in params and params['end_date']:
        if not validate_date_string(params['end_date']):
            return False
    
    # Validate days parameter
    if 'days' in params and params['days']:
        try:
            days = int(params['days'])
            if days <= 0 or days > 365:
                return False
        except (ValueError, TypeError):
            return False
    
    # Validate class_id
    if 'class_id' in params and params['class_id']:
        if not validate_class_id(params['class_id']):
            return False
    
    return True

def sanitize_string(value: str, max_length: int = 255) -> str:
    """
    Sanitize string input
    
    Args:
        value: String to sanitize
        max_length: Maximum length
        
    Returns:
        Sanitized string
    """
    if not isinstance(value, str):
        return ''
    
    # Strip whitespace and limit length
    sanitized = value.strip()[:max_length]
    
    # Remove potentially dangerous characters
    sanitized = re.sub(r'[<>"\']', '', sanitized)
    
    return sanitized

def validate_file_upload(filename: str, allowed_extensions: List[str]) -> bool:
    """
    Validate file upload
    
    Args:
        filename: Filename to validate
        allowed_extensions: List of allowed extensions
        
    Returns:
        True if valid, False otherwise
    """
    if not filename or not isinstance(filename, str):
        return False
    
    # Check if file has extension
    if '.' not in filename:
        return False
    
    # Get extension
    extension = filename.rsplit('.', 1)[1].lower()
    
    return extension in allowed_extensions


