import re
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import json

def extract_name_from_email(email: str) -> str:
    """
    Extract readable name from email address
    
    Args:
        email: Email address
        
    Returns:
        Extracted name
    """
    if not email or not isinstance(email, str):
        return 'Unknown User'
    
    # Get username part (before @)
    username = email.split('@')[0]
    
    # Replace common separators with spaces
    name_parts = username.replace('.', ' ').replace('_', ' ').replace('-', ' ')
    
    # Capitalize each word
    name = ' '.join(word.capitalize() for word in name_parts.split())
    
    # If name is too short or empty, use a default
    if len(name) < 2:
        name = 'User'
    
    return name

def format_datetime(dt: datetime, format_type: str = 'iso') -> str:
    """
    Format datetime object
    
    Args:
        dt: Datetime object
        format_type: Format type ('iso', 'readable', 'date', 'time')
        
    Returns:
        Formatted datetime string
    """
    if not dt:
        return ''
    
    if format_type == 'iso':
        return dt.isoformat()
    elif format_type == 'readable':
        return dt.strftime('%B %d, %Y at %I:%M %p')
    elif format_type == 'date':
        return dt.strftime('%Y-%m-%d')
    elif format_type == 'time':
        return dt.strftime('%H:%M:%S')
    else:
        return dt.isoformat()

def calculate_attendance_rate(present: int, total: int) -> float:
    """
    Calculate attendance rate percentage
    
    Args:
        present: Number of present students
        total: Total number of students
        
    Returns:
        Attendance rate as percentage
    """
    if total <= 0:
        return 0.0
    
    rate = (present / total) * 100
    return round(rate, 2)

def calculate_time_difference(start_time: datetime, end_time: datetime) -> Dict:
    """
    Calculate time difference between two datetime objects
    
    Args:
        start_time: Start datetime
        end_time: End datetime
        
    Returns:
        Dictionary with time difference details
    """
    if not start_time or not end_time:
        return {}
    
    diff = end_time - start_time
    
    return {
        'total_seconds': diff.total_seconds(),
        'total_minutes': diff.total_seconds() / 60,
        'total_hours': diff.total_seconds() / 3600,
        'days': diff.days,
        'hours': diff.seconds // 3600,
        'minutes': (diff.seconds % 3600) // 60,
        'seconds': diff.seconds % 60
    }

def is_within_time_window(current_time: datetime, start_time: datetime, 
                          window_minutes: int) -> bool:
    """
    Check if current time is within attendance window
    
    Args:
        current_time: Current datetime
        start_time: Class start time
        window_minutes: Attendance window in minutes
        
    Returns:
        True if within window, False otherwise
    """
    if not current_time or not start_time:
        return False
    
    window_end = start_time + timedelta(minutes=window_minutes)
    return start_time <= current_time <= window_end

def generate_unique_filename(prefix: str, extension: str) -> str:
    """
    Generate unique filename
    
    Args:
        prefix: Filename prefix
        extension: File extension
        
    Returns:
        Unique filename
    """
    timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    random_suffix = str(hash(timestamp))[-6:]
    
    return f"{prefix}_{timestamp}_{random_suffix}.{extension}"

def safe_json_loads(json_string: str, default: any = None) -> any:
    """
    Safely load JSON string
    
    Args:
        json_string: JSON string to parse
        default: Default value if parsing fails
        
    Returns:
        Parsed JSON or default value
    """
    try:
        return json.loads(json_string)
    except (json.JSONDecodeError, TypeError):
        return default

def safe_json_dumps(data: any, default: str = '{}') -> str:
    """
    Safely dump data to JSON string
    
    Args:
        data: Data to serialize
        default: Default string if serialization fails
        
    Returns:
        JSON string or default string
    """
    try:
        return json.dumps(data)
    except (TypeError, ValueError):
        return default

def paginate_query(query, page: int, per_page: int):
    """
    Paginate SQLAlchemy query
    
    Args:
        query: SQLAlchemy query object
        page: Page number (1-based)
        per_page: Items per page
        
    Returns:
        Paginated results
    """
    if page < 1:
        page = 1
    
    if per_page < 1 or per_page > 1000:
        per_page = 50
    
    offset = (page - 1) * per_page
    
    return query.offset(offset).limit(per_page)

def calculate_pagination_info(total: int, page: int, per_page: int) -> Dict:
    """
    Calculate pagination information
    
    Args:
        total: Total number of items
        page: Current page number
        per_page: Items per page
        
    Returns:
        Pagination information dictionary
    """
    if page < 1:
        page = 1
    
    if per_page < 1:
        per_page = 50
    
    total_pages = (total + per_page - 1) // per_page
    has_prev = page > 1
    has_next = page < total_pages
    
    return {
        'page': page,
        'per_page': per_page,
        'total': total,
        'total_pages': total_pages,
        'has_prev': has_prev,
        'has_next': has_next,
        'prev_page': page - 1 if has_prev else None,
        'next_page': page + 1 if has_next else None
    }

def clean_filename(filename: str) -> str:
    """
    Clean filename for safe storage
    
    Args:
        filename: Original filename
        
    Returns:
        Cleaned filename
    """
    if not filename:
        return 'file'
    
    # Remove or replace unsafe characters
    cleaned = re.sub(r'[<>:"/\\|?*]', '_', filename)
    
    # Remove extra spaces and dots
    cleaned = re.sub(r'\s+', '_', cleaned)
    cleaned = cleaned.strip('._')
    
    # Limit length
    if len(cleaned) > 255:
        name, ext = cleaned.rsplit('.', 1) if '.' in cleaned else (cleaned, '')
        cleaned = name[:255-len(ext)-1] + ('.' + ext if ext else '')
    
    return cleaned or 'file'

def format_file_size(size_bytes: int) -> str:
    """
    Format file size in human readable format
    
    Args:
        size_bytes: Size in bytes
        
    Returns:
        Formatted size string
    """
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024**2:
        return f"{size_bytes/1024:.1f} KB"
    elif size_bytes < 1024**3:
        return f"{size_bytes/(1024**2):.1f} MB"
    else:
        return f"{size_bytes/(1024**3):.1f} GB"

def mask_email(email: str) -> str:
    """
    Mask email address for privacy
    
    Args:
        email: Email address
        
    Returns:
        Masked email address
    """
    if not email or '@' not in email:
        return email
    
    username, domain = email.split('@', 1)
    
    if len(username) <= 2:
        masked_username = '*' * len(username)
    else:
        masked_username = username[0] + '*' * (len(username) - 2) + username[-1]
    
    return f"{masked_username}@{domain}"

def generate_random_string(length: int = 8) -> str:
    """
    Generate random string
    
    Args:
        length: Length of random string
        
    Returns:
        Random string
    """
    import random
    import string
    
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

def validate_time_format(time_string: str) -> bool:
    """
    Validate time format (HH:MM or HH:MM:SS)
    
    Args:
        time_string: Time string to validate
        
    Returns:
        True if valid, False otherwise
    """
    if not time_string or not isinstance(time_string, str):
        return False
    
    pattern = r'^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$'
    return re.match(pattern, time_string) is not None

def parse_time_string(time_string: str) -> Optional[datetime]:
    """
    Parse time string to datetime object
    
    Args:
        time_string: Time string to parse
        
    Returns:
        Datetime object or None if invalid
    """
    if not validate_time_format(time_string):
        return None
    
    try:
        # Parse time string
        time_parts = time_string.split(':')
        hour = int(time_parts[0])
        minute = int(time_parts[1])
        second = int(time_parts[2]) if len(time_parts) > 2 else 0
        
        # Create datetime object for today
        today = datetime.now().date()
        return datetime.combine(today, datetime.min.time().replace(
            hour=hour, minute=minute, second=second
        ))
    except (ValueError, IndexError):
        return None

def get_week_range(date: datetime) -> tuple:
    """
    Get start and end of week for given date
    
    Args:
        date: Date to get week range for
        
    Returns:
        Tuple of (week_start, week_end)
    """
    # Get Monday of the week
    week_start = date - timedelta(days=date.weekday())
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Get Sunday of the week
    week_end = week_start + timedelta(days=6)
    week_end = week_end.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    return week_start, week_end

def get_month_range(date: datetime) -> tuple:
    """
    Get start and end of month for given date
    
    Args:
        date: Date to get month range for
        
    Returns:
        Tuple of (month_start, month_end)
    """
    # First day of month
    month_start = date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Last day of month
    if date.month == 12:
        month_end = date.replace(year=date.year + 1, month=1, day=1) - timedelta(days=1)
    else:
        month_end = date.replace(month=date.month + 1, day=1) - timedelta(days=1)
    
    month_end = month_end.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    return month_start, month_end


