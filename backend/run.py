"""
Main application entry point for the Flask backend server.
Initializes the application using the centralized configuration.
"""
import os
import sys
import logging
import requests
from flask import Flask, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config import config  # Import the centralized configuration

# Initialize Flask application
app = Flask(__name__)
app.config.from_object(config)

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if config.FLASK_DEBUG else logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize database
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy(app)

# Initialize Redis connection
try:
    import redis
    redis_client = redis.Redis(
        host=config.REDIS_HOST,
        port=config.REDIS_PORT,
        db=config.REDIS_DB,
        decode_responses=True,
        socket_connect_timeout=3,
        retry_on_timeout=True
    )
    redis_client.ping()  # Test connection
    logger.info("✅ Redis connection established")
except redis.RedisError as e:
    logger.error("❌ Redis connection failed: %s", str(e))
    redis_client = None

# Initialize rate limiter
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=[config.RATELIMIT_DEFAULT],
    storage_uri=config.REDIS_URL if redis_client else "memory://",
    headers_enabled=config.RATELIMIT_HEADERS_ENABLED
)

# Configure CORS
CORS(
    app,
    resources={
        r"/*": {
            "origins": config.ALLOWED_ORIGINS,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    }
)

# Security headers middleware
@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    if config.FLASK_CONFIG == 'production':
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response.headers['Content-Security-Policy'] = "default-src 'self'"
    return response

# API Routes
@app.route('/')
def index():
    """Root endpoint showing service status"""
    return jsonify({
        "status": "running",
        "service": "API Server",
        "config": config.FLASK_CONFIG,
        "debug": config.FLASK_DEBUG,
        "redis_status": "connected" if redis_client and redis_client.ping() else "disconnected"
    })

@app.route('/mcp/identity', methods=['GET'])
@limiter.limit("10 per minute")
def get_mcp_identity():
    """Fetch identity data from MCP server"""
    try:
        headers = {'Authorization': f'Bearer {config.AUTH_TOKEN}'}
        response = requests.get(
            f"{config.MCP_SERVER_URL}/.identity",
            headers=headers,
            timeout=5
        )
        response.raise_for_status()
        return jsonify(response.json())
    except requests.RequestException as e:
        logger.error("MCP connection error: %s", str(e))
        return jsonify({"error": "MCP connection failed"}), 500

@app.route('/health')
def health_check():
    """System health endpoint"""
    try:
        db_status = "up" if db.session.execute("SELECT 1").scalar() == 1 else "down"
        redis_status = "up" if redis_client and redis_client.ping() else "down"
        
        return jsonify({
            "status": "healthy",
            "database": db_status,
            "redis": redis_status,
            "version": os.getenv("APP_VERSION", "1.0.0")
        })
    except Exception as e:
        logger.error("Health check failed: %s", str(e))
        return jsonify({"status": "unhealthy"}), 500

@app.route('/test-db')
def test_db():
    """Test database connection"""
    try:
        result = db.session.execute("SELECT version()").scalar()
        return jsonify({"database_version": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Error Handlers
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

# Main Entry Point
if __name__ == "__main__":
    try:
        logger.info("Starting %s server in %s mode", 
                  os.getenv("APP_NAME", "Flask"), 
                  config.FLASK_CONFIG)
        logger.info("Allowed origins: %s", config.ALLOWED_ORIGINS)
        
        app.run(
            host=config.FLASK_HOST,
            port=config.FLASK_PORT,
            debug=config.FLASK_DEBUG,
            threaded=True
        )
    except Exception as e:
        logger.critical("Server startup failed: %s", str(e))
        sys.exit(1)
        
def secure_data():
    return jsonify({'message': 'Access granted'})
