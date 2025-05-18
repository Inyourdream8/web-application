from functools import wraps
from flask import current_app, g
import time
from sqlalchemy import event
from app.extensions import db
from app.utils.debug_logger import DebugLogger

debug_logger = DebugLogger()

def track_sql_queries():
    """Track SQL query execution time"""
    queries = []
    
    @event.listens_for(db.engine, 'before_cursor_execute')
    def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
        conn.info.setdefault('query_start_time', []).append(time.time())
        queries.append({
            'statement': statement,
            'parameters': parameters,
            'start_time': time.time()
        })

    @event.listens_for(db.engine, 'after_cursor_execute')
    def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
        total_time = time.time() - conn.info['query_start_time'].pop()
        queries[-1].update({
            'end_time': time.time(),
            'duration': total_time
        })
        
        # Log slow queries (>100ms)
        if total_time > 0.1:
            debug_logger.logger.warning(f"""
Slow Query Detected:
-------------------
Duration: {total_time:.4f}s
Query: {statement}
Parameters: {parameters}
            """.strip())
    
    return queries

def debug_performance_middleware():
    """Middleware to track request performance metrics"""
    def middleware(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            # Start tracking SQL queries
            queries = track_sql_queries()
            
            # Track memory usage
            start_memory = current_app.debug_metrics.get_memory_usage()
            
            # Execute request
            response = f(*args, **kwargs)
            
            # Collect performance metrics
            end_memory = current_app.debug_metrics.get_memory_usage()
            memory_diff = end_memory - start_memory
            
            # Log performance data
            performance_data = {
                'request_id': g.get('request_id'),
                'endpoint': g.get('endpoint'),
                'sql_queries': len(queries),
                'sql_time': sum(q.get('duration', 0) for q in queries),
                'memory_usage': memory_diff,
                'slow_queries': [q for q in queries if q.get('duration', 0) > 0.1]
            }
            
            debug_logger.log_performance(time.time() - g.start_time, performance_data)
            
            return response
        return decorated
    return middleware