from flask import Blueprint, jsonify, current_app, request
from .debug_controller import debug_controller
from functools import wraps

debug_bp = Blueprint('debug', __name__, url_prefix='/api/debug')

def debug_mode_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_app.config.get('DEBUG'):
            return jsonify({"error": "Debug mode must be enabled"}), 403
        return f(*args, **kwargs)
    return decorated_function

@debug_bp.route('/status', methods=['GET'])
@debug_mode_required
def get_debug_status():
    return jsonify({
        "debug_active": debug_controller.debug_session_active,
        "start_time": str(debug_controller.start_time) if debug_controller.start_time else None,
        "metrics": debug_controller.metrics
    })

@debug_bp.route('/session/start', methods=['POST'])
@debug_mode_required
def start_debug_session():
    result = debug_controller.start_debug_session()
    return jsonify(result)

@debug_bp.route('/session/end', methods=['POST'])
@debug_mode_required
def end_debug_session():
    result = debug_controller.stop_debug_session()
    return jsonify(result)

@debug_bp.route('/metrics', methods=['GET'])
@debug_mode_required
def get_metrics():
    metrics = debug_controller.get_system_metrics()
    return jsonify(metrics)

@debug_bp.route('/memory/snapshot', methods=['POST'])
@debug_mode_required
def take_memory_snapshot():
    snapshot = debug_controller.take_memory_snapshot()
    return jsonify(snapshot)

@debug_bp.route('/analysis', methods=['GET'])
@debug_mode_required
def get_analysis():
    performance_data = debug_controller.get_system_metrics()
    memory_data = debug_controller.take_memory_snapshot()
    
    analysis = {
        "performance": {
            "cpu_load": performance_data["cpu_percent"],
            "memory_usage": performance_data["memory_usage"],
            "resource_utilization": {
                "threads": performance_data["threads"],
                "open_files": performance_data["open_files"],
                "connections": performance_data["connections"]
            }
        },
        "memory": {
            "snapshot": memory_data["top_memory_usage"],
            "recommendations": _generate_recommendations()
        }
    }
    
    return jsonify(analysis)

def _analyze_error_patterns():
    """Analyze patterns in recorded errors"""
    errors = debug_controller.metrics.get('errors', [])
    patterns = {}
    
    for error in errors:
        error_type = error.get('type')
        if error_type in patterns:
            patterns[error_type]['count'] += 1
            patterns[error_type]['recent'] = error.get('timestamp')
        else:
            patterns[error_type] = {
                'count': 1,
                'first_seen': error.get('timestamp'),
                'recent': error.get('timestamp')
            }
    
    return patterns

def _generate_recommendations():
    """Generate actionable recommendations based on debug data"""
    recommendations = []
    metrics = debug_controller.get_system_metrics()
    
    # Check CPU usage
    if metrics['cpu_percent'] > 80:
        recommendations.append({
            "type": "performance",
            "severity": "high",
            "message": "High CPU usage detected. Consider optimizing resource-intensive operations."
        })
    
    # Check memory usage
    if metrics['memory_usage']['rss'] > 1024:  # More than 1GB
        recommendations.append({
            "type": "memory",
            "severity": "medium",
            "message": "High memory usage detected. Consider implementing memory cleanup routines."
        })
    
    # Check thread count
    if metrics['threads'] > 50:
        recommendations.append({
            "type": "resources",
            "severity": "medium",
            "message": "High number of threads. Review thread management and pooling strategies."
        })
    
    return recommendations