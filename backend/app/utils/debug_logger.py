import logging
import time
from functools import wraps
from flask import request, g, current_app
import traceback
import json
from typing import Any, Callable
from datetime import datetime

class DebugLogger:
    def __init__(self):
        self.logger = logging.getLogger('debug_logger')
        self.logger.setLevel(logging.DEBUG)
        
        # File handler for detailed debugging
        debug_handler = logging.FileHandler('logs/debug.log')
        debug_handler.setLevel(logging.DEBUG)
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        debug_handler.setFormatter(formatter)
        self.logger.addHandler(debug_handler)

    def log_request(self) -> None:
        """Log incoming request details"""
        self.logger.debug(f"""
Request Details:
---------------
Method: {request.method}
Path: {request.path}
Headers: {dict(request.headers)}
Args: {dict(request.args)}
Form Data: {dict(request.form)}
JSON: {request.get_json(silent=True)}
        """.strip())

    def log_response(self, response: Any) -> None:
        """Log response details"""
        try:
            response_data = response.get_json() if hasattr(response, 'get_json') else str(response)
            self.logger.debug(f"""
Response Details:
----------------
Status: {response.status_code if hasattr(response, 'status_code') else 'N/A'}
Headers: {dict(response.headers) if hasattr(response, 'headers') else {}}
Data: {response_data}
            """.strip())
        except Exception as e:
            self.logger.error(f"Error logging response: {str(e)}")

    def log_error(self, error: Exception) -> None:
        """Log detailed error information"""
        self.logger.error(f"""
Error Details:
-------------
Type: {type(error).__name__}
Message: {str(error)}
Traceback:
{traceback.format_exc()}
        """.strip())

    def log_performance(self, duration: float, context: dict) -> None:
        """Log performance metrics"""
        self.logger.info(f"""
Performance Metrics:
------------------
Duration: {duration:.4f}s
Context: {json.dumps(context, indent=2)}
        """.strip())

def debug_endpoint(f: Callable) -> Callable:
    """Decorator for debugging API endpoints"""
    @wraps(f)
    def decorated(*args, **kwargs):
        debug_logger = DebugLogger()
        start_time = time.time()
        
        # Initialize request context
        g.request_id = datetime.utcnow().strftime('%Y%m%d%H%M%S%f')
        g.start_time = start_time
        
        try:
            # Log request
            debug_logger.log_request()
            
            # Execute endpoint
            response = f(*args, **kwargs)
            
            # Calculate duration
            duration = time.time() - start_time
            
            # Log performance metrics
            context = {
                'request_id': g.request_id,
                'endpoint': request.endpoint,
                'method': request.method,
                'status_code': response.status_code if hasattr(response, 'status_code') else 'N/A'
            }
            debug_logger.log_performance(duration, context)
            
            # Log response
            debug_logger.log_response(response)
            
            return response
            
        except Exception as e:
            # Log error details
            debug_logger.log_error(e)
            # Re-raise the exception
            raise
        
    return decorated