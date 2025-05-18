# ✅ Standard Library Imports First

from datetime import datetime

# ✅ Third-Party Imports Next
from flask import Flask, jsonify, url_for, session
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_session import Session
from flask_caching import Cache
import redis

# ✅ Local Module Imports Last
from app.config import get_config

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri="redis://localhost:6379"
)
cors = CORS()
socketio = SocketIO()

# ✅ Initialize Redis Client
redis_client = redis.Redis(host="localhost", port=6379, db=0)

def create_app(config_name='development'):
    """Application factory function."""
    app = Flask(__name__)
    config = get_config(config_name)
    app.config.from_object(config)
    
    # ✅ Initialize Flask-Session (Uses Redis)
    app.config["SESSION_TYPE"] = "redis"
    app.config["SESSION_PERMANENT"] = False
    app.config["SESSION_USE_SIGNER"] = True
    app.config["SESSION_KEY_PREFIX"] = "myapp:"
    app.config["SESSION_REDIS"] = redis_client
    Session(app)

    # ✅ Initialize Flask-Caching (Uses Redis)
    app.config["CACHE_TYPE"] = "RedisCache"
    app.config["CACHE_REDIS_URL"] = "redis://localhost:6379/0"
    cache = Cache(app)

    # Initialize other extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    limiter.init_app(app)
    cors.init_app(app, resources={
        r"/api/*": {"origins": app.config.get("ALLOWED_ORIGINS", "*")},
        r"/socket.io/*": {"origins": app.config.get("ALLOWED_ORIGINS", "*")}
    })
    
    @app.after_request
    def add_security_headers(response):
        response.headers["Access-Control-Allow-Origin"] = ",".join(app.config.get("ALLOWED_ORIGINS", "*"))
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

    # Configure Socket.IO
    socketio.init_app(
        app,
        cors_allowed_origins=app.config['ALLOWED_ORIGINS'],
        logger=app.config['DEBUG'],
        engineio_logger=app.config['DEBUG'],
        json=app.json
    )
    
    # ==================================================
    # Insert the enhanced API root endpoint HERE (right before blueprints)
    @app.route('/api')
    @cache.cached(timeout=60)  # ✅ Cache API index response for 60 seconds
    def api_index():
        """API root endpoint with safe URL resolution"""
        try:
            session["user"] = "Hello"  # ✅ Store a test session in Redis
            return jsonify({
                "status": "API is running",
                "version": "1.0",
                "session_user": session.get("user", "None"),  # ✅ Verify Redis session
                "endpoints": {
                    "auth": {
                        "user_register": url_for('auth.user_register'),  
                        "user_login": url_for('auth.user_login'),
                        "admin_register": url_for('auth.admin_register'),
                        "admin_login": url_for('auth.admin_login'),
                        "refresh": url_for('auth.refresh_tokens'),
                    },
                    "loans": url_for('loans.index'),
                    "withdrawals": url_for('withdrawals.index'),
                    "admin_dashboard": url_for('admin_dashboard.index')
                },
                "timestamp": datetime.utcnow().isoformat()
            })
        except Exception as e:  # ✅ Correct exception handling
            return jsonify({"error": "Route resolution failed", "details": str(e)}), 500
    # ==================================================
    
    # Register blueprints
    register_blueprints(app)
    
    # Production-specific setup
    if config_name == 'production':
        config.init_app(app)
    
    return app

def register_blueprints(app):
    """Register all application blueprints safely."""
    from app.api.auth import auth_bp
    from app.api.loans import loans_bp
    from app.api.withdrawals import withdrawals_bp
    from app.api.admin_dashboard import admin_dashboard_bp

    
    blueprints = [
        (auth_bp, '/api/auth'),
        (loans_bp, '/api/loans'),
        (withdrawals_bp, '/api/withdrawals'),
        (admin_dashboard_bp, '/api/admin')
    ]
    
    for blueprint, url_prefix in blueprints:
        app.register_blueprint(blueprint, url_prefix=url_prefix)