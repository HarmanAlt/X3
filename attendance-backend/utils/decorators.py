from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

def require_role(required_roles):
    """
    Decorator to require specific user roles
    
    Args:
        required_roles: List of required roles or single role string
        
    Returns:
        Decorator function
    """
    def decorator(f):
        @wraps(f)
        @jwt_required()
        def decorated_function(*args, **kwargs):
            try:
                from models.user import User
                
                user_id = get_jwt_identity()
                user = User.query.get(user_id)
                
                if not user:
                    return jsonify({
                        'success': False,
                        'error': 'User not found',
                        'code': 'USER_NOT_FOUND',
                        'timestamp': datetime.utcnow().isoformat()
                    }), 404
                
                if not user.is_active:
                    return jsonify({
                        'success': False,
                        'error': 'User account is inactive',
                        'code': 'USER_INACTIVE',
                        'timestamp': datetime.utcnow().isoformat()
                    }), 403
                
                # Convert single role to list
                if isinstance(required_roles, str):
                    roles = [required_roles]
                else:
                    roles = required_roles
                
                # Check if user has required role
                if user.role not in roles:
                    return jsonify({
                        'success': False,
                        'error': f'Access denied. Required roles: {", ".join(roles)}',
                        'code': 'INSUFFICIENT_PERMISSIONS',
                        'timestamp': datetime.utcnow().isoformat()
                    }), 403
                
                # Add user to kwargs for use in the function
                kwargs['current_user'] = user
                
                return f(*args, **kwargs)
                
            except Exception as e:
                logger.error(f"Role check error: {str(e)}")
                return jsonify({
                    'success': False,
                    'error': 'Authorization check failed',
                    'code': 'AUTH_CHECK_ERROR',
                    'timestamp': datetime.utcnow().isoformat()
                }), 500
        
        return decorated_function
    return decorator

def require_admin(f):
    """
    Decorator to require admin role
    """
    return require_role('admin')(f)

def require_faculty_or_admin(f):
    """
    Decorator to require faculty or admin role
    """
    return require_role(['faculty', 'admin'])(f)

def require_student(f):
    """
    Decorator to require student role
    """
    return require_role('student')(f)

def validate_json_content_type(f):
    """
    Decorator to validate JSON content type
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method in ['POST', 'PUT', 'PATCH']:
            if not request.is_json:
                return jsonify({
                    'success': False,
                    'error': 'Content-Type must be application/json',
                    'code': 'INVALID_CONTENT_TYPE',
                    'timestamp': datetime.utcnow().isoformat()
                }), 400
        
        return f(*args, **kwargs)
    
    return decorated_function

def validate_required_fields(required_fields):
    """
    Decorator to validate required fields in request data
    
    Args:
        required_fields: List of required field names
        
    Returns:
        Decorator function
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                data = request.get_json()
                
                if not data:
                    return jsonify({
                        'success': False,
                        'error': 'Request body is required',
                        'code': 'MISSING_DATA',
                        'timestamp': datetime.utcnow().isoformat()
                    }), 400
                
                missing_fields = []
                for field in required_fields:
                    if field not in data or data[field] is None or data[field] == '':
                        missing_fields.append(field)
                
                if missing_fields:
                    return jsonify({
                        'success': False,
                        'error': f'Missing required fields: {", ".join(missing_fields)}',
                        'code': 'MISSING_REQUIRED_FIELDS',
                        'missing_fields': missing_fields,
                        'timestamp': datetime.utcnow().isoformat()
                    }), 400
                
                return f(*args, **kwargs)
                
            except Exception as e:
                logger.error(f"Field validation error: {str(e)}")
                return jsonify({
                    'success': False,
                    'error': 'Field validation failed',
                    'code': 'VALIDATION_ERROR',
                    'timestamp': datetime.utcnow().isoformat()
                }), 500
        
        return decorated_function
    return decorator

def rate_limit(max_requests=100, window_minutes=60):
    """
    Decorator for rate limiting (basic implementation)
    
    Args:
        max_requests: Maximum requests per window
        window_minutes: Time window in minutes
        
    Returns:
        Decorator function
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # This is a basic implementation
            # In production, you'd want to use Redis or similar
            # For now, we'll just log the request
            
            client_ip = request.remote_addr
            current_time = datetime.utcnow()
            
            logger.info(f"Rate limit check for IP {client_ip} at {current_time}")
            
            # TODO: Implement actual rate limiting logic
            # This would involve storing request counts in a cache/database
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

def log_request(f):
    """
    Decorator to log API requests
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = datetime.utcnow()
        
        # Log request
        logger.info(f"API Request: {request.method} {request.path} from {request.remote_addr}")
        
        try:
            result = f(*args, **kwargs)
            
            # Log response
            end_time = datetime.utcnow()
            duration = (end_time - start_time).total_seconds()
            
            logger.info(f"API Response: {request.method} {request.path} completed in {duration:.3f}s")
            
            return result
            
        except Exception as e:
            # Log error
            end_time = datetime.utcnow()
            duration = (end_time - start_time).total_seconds()
            
            logger.error(f"API Error: {request.method} {request.path} failed after {duration:.3f}s - {str(e)}")
            
            raise
    
    return decorated_function

def handle_errors(f):
    """
    Decorator to handle common errors
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except ValueError as e:
            return jsonify({
                'success': False,
                'error': f'Invalid value: {str(e)}',
                'code': 'INVALID_VALUE',
                'timestamp': datetime.utcnow().isoformat()
            }), 400
        except KeyError as e:
            return jsonify({
                'success': False,
                'error': f'Missing key: {str(e)}',
                'code': 'MISSING_KEY',
                'timestamp': datetime.utcnow().isoformat()
            }), 400
        except Exception as e:
            logger.error(f"Unexpected error in {f.__name__}: {str(e)}")
            return jsonify({
                'success': False,
                'error': 'Internal server error',
                'code': 'INTERNAL_ERROR',
                'timestamp': datetime.utcnow().isoformat()
            }), 500
    
    return decorated_function

def validate_user_access(target_user_id):
    """
    Decorator to validate user can access target user's data
    
    Args:
        target_user_id: User ID to check access for
        
    Returns:
        Decorator function
    """
    def decorator(f):
        @wraps(f)
        @jwt_required()
        def decorated_function(*args, **kwargs):
            try:
                from models.user import User
                
                current_user_id = get_jwt_identity()
                current_user = User.query.get(current_user_id)
                
                if not current_user:
                    return jsonify({
                        'success': False,
                        'error': 'User not found',
                        'code': 'USER_NOT_FOUND',
                        'timestamp': datetime.utcnow().isoformat()
                    }), 404
                
                # Check if user can access target user's data
                can_access = (
                    current_user_id == target_user_id or  # Own data
                    current_user.is_admin() or  # Admin can access all
                    (current_user.is_faculty() and target_user_id != current_user_id)  # Faculty can access student data
                )
                
                if not can_access:
                    return jsonify({
                        'success': False,
                        'error': 'Access denied to user data',
                        'code': 'ACCESS_DENIED',
                        'timestamp': datetime.utcnow().isoformat()
                    }), 403
                
                return f(*args, **kwargs)
                
            except Exception as e:
                logger.error(f"User access check error: {str(e)}")
                return jsonify({
                    'success': False,
                    'error': 'Access check failed',
                    'code': 'ACCESS_CHECK_ERROR',
                    'timestamp': datetime.utcnow().isoformat()
                }), 500
        
        return decorated_function
    return decorator

def cache_response(ttl_seconds=300):
    """
    Decorator for response caching (basic implementation)
    
    Args:
        ttl_seconds: Time to live in seconds
        
    Returns:
        Decorator function
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # This is a basic implementation
            # In production, you'd want to use Redis or similar
            
            cache_key = f"{request.path}:{request.query_string.decode()}"
            
            # TODO: Implement actual caching logic
            # This would involve checking cache, returning cached response if found,
            # or executing function and storing result in cache
            
            logger.info(f"Cache check for key: {cache_key}")
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


