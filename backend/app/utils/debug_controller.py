import logging
import json
import time
import threading
import queue
from datetime import datetime
from typing import Dict, List, Optional
from flask import current_app
from functools import wraps
import psutil
import sys
import traceback

class DebugController:
    def __init__(self):
        self.debug_logger = logging.getLogger('debug_controller')
        self.debug_logger.setLevel(logging.DEBUG)
        
        # File handler for detailed debugging
        handler = logging.FileHandler('logs/debug_session.log')
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        self.debug_logger.addHandler(handler)
        
        # Performance metrics queue
        self.metrics_queue = queue.Queue()
        
        # Start metrics collection thread
        self.metrics_thread = threading.Thread(target=self._collect_metrics)
        self.metrics_thread.daemon = True
        self.metrics_thread.start()
        
        # Debug session data
        self.session_data = {
            'start_time': datetime.now().isoformat(),
            'api_calls': [],
            'slow_queries': [],
            'memory_snapshots': [],
            'errors': []
        }

    def _collect_metrics(self):
        """Background thread to collect system metrics"""
        while True:
            try:
                process = psutil.Process()
                metrics = {
                    'timestamp': datetime.now().isoformat(),
                    'cpu_percent': process.cpu_percent(),
                    'memory_info': dict(process.memory_info()._asdict()),
                    'num_threads': process.num_threads(),
                    'open_files': len(process.open_files()),
                    'connections': len(process.connections())
                }
                
                self.session_data['memory_snapshots'].append(metrics)
                time.sleep(5)  # Collect metrics every 5 seconds
                
            except Exception as e:
                self.debug_logger.error(f"Error collecting metrics: {str(e)}")

    def track_api_call(self, func):
        """Decorator to track API call performance"""
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            start_memory = psutil.Process().memory_info().rss
            
            try:
                result = func(*args, **kwargs)
                duration = time.time() - start_time
                memory_delta = psutil.Process().memory_info().rss - start_memory
                
                call_data = {
                    'endpoint': func.__name__,
                    'duration': duration,
                    'memory_delta': memory_delta,
                    'timestamp': datetime.now().isoformat(),
                    'success': True
                }
                
                if duration > 1.0:  # Log slow API calls (>1s)
                    self.debug_logger.warning(
                        f"Slow API call detected: {func.__name__} took {duration:.2f}s"
                    )
                
                self.session_data['api_calls'].append(call_data)
                return result
                
            except Exception as e:
                self.log_error(e, func.__name__)
                raise
            
        return wrapper

    def log_error(self, error: Exception, context: str = None):
        """Log detailed error information"""
        error_data = {
            'timestamp': datetime.now().isoformat(),
            'type': type(error).__name__,
            'message': str(error),
            'traceback': traceback.format_exc(),
            'context': context
        }
        
        self.session_data['errors'].append(error_data)
        self.debug_logger.error(f"Error in {context}: {str(error)}\n{traceback.format_exc()}")

    def start_debug_session(self):
        """Initialize a new debug session"""
        self.debug_logger.info("Starting new debug session")
        self.session_data['start_time'] = datetime.now().isoformat()

    def end_debug_session(self) -> Dict:
        """End current debug session and return session data"""
        self.session_data['end_time'] = datetime.now().isoformat()
        self.debug_logger.info("Ending debug session")
        
        # Generate session summary
        summary = self._generate_session_summary()
        self.session_data['summary'] = summary
        
        # Save session data to file
        self._save_session_data()
        
        return self.session_data

    def _generate_session_summary(self) -> Dict:
        """Generate summary of debug session"""
        return {
            'duration': (
                datetime.fromisoformat(self.session_data['end_time']) -
                datetime.fromisoformat(self.session_data['start_time'])
            ).total_seconds(),
            'total_api_calls': len(self.session_data['api_calls']),
            'error_count': len(self.session_data['errors']),
            'slow_queries': len(self.session_data['slow_queries']),
            'memory_trend': self._analyze_memory_trend(),
            'performance_issues': self._identify_performance_issues()
        }

    def _analyze_memory_trend(self) -> Dict:
        """Analyze memory usage trend"""
        if not self.session_data['memory_snapshots']:
            return {}
            
        memory_values = [
            snapshot['memory_info']['rss'] 
            for snapshot in self.session_data['memory_snapshots']
        ]
        
        return {
            'initial': memory_values[0],
            'final': memory_values[-1],
            'peak': max(memory_values),
            'growth': memory_values[-1] - memory_values[0]
        }

    def _identify_performance_issues(self) -> List[Dict]:
        """Identify potential performance issues"""
        issues = []
        
        # Check for slow API calls
        slow_calls = [
            call for call in self.session_data['api_calls']
            if call['duration'] > 1.0
        ]
        if slow_calls:
            issues.append({
                'type': 'slow_api_calls',
                'count': len(slow_calls),
                'endpoints': [call['endpoint'] for call in slow_calls]
            })
        
        # Check for memory leaks
        memory_trend = self._analyze_memory_trend()
        if memory_trend and memory_trend['growth'] > 100 * 1024 * 1024:  # 100MB
            issues.append({
                'type': 'memory_leak',
                'growth_mb': memory_trend['growth'] / (1024 * 1024)
            })
        
        return issues

    def _save_session_data(self):
        """Save debug session data to file"""
        filename = f"logs/debug_session_{self.session_data['start_time']}.json"
        with open(filename, 'w') as f:
            json.dump(self.session_data, f, indent=2)
        
        self.debug_logger.info(f"Debug session data saved to {filename}")

# Global debug controller instance
debug_controller = DebugController()

def init_debug_controller(app):
    """Initialize debug controller with Flask app"""
    app.debug_controller = debug_controller
    app.before_request(debug_controller.start_debug_session)
    app.after_request(lambda response: debug_controller.end_debug_session() and response)