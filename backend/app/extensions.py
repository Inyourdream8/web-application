# backend/app/extensions.py
import logging

from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.security import generate_password_hash, check_password_hash
from .models.user import User
from .models.token import TokenBlocklist

limiter = Limiter(key_func=lambda: get_jwt().get('sub') if get_jwt() else get_remote_address)
limiter = Limiter(key_func=get_remote_address)

# Initialize extensions without app context
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
limiter = Limiter(
    key_func=lambda: get_jwt().get('sub') if get_jwt() else get_remote_address,
    default_limits=["100 per hour"],
    storage_uri="redis://localhost:6379/0"
)

def init_extensions(app):
    """Initialize all extensions with the Flask app"""
    # Database and migration
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Authentication
    jwt.init_app(app)
    
    # Rate limiting
    limiter.init_app(app)
    if app.config.get('RATELIMIT_HEADERS_ENABLED', False):
        limiter.headers_enabled = True

    # JWT configuration
    @jwt.user_identity_loader
    def user_identity_lookup(user):
        """Supports multiple identity formats (ID, email)"""
        return user.id if user else None

    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        identity = jwt_data.get("sub")

        if not identity:
            logger.warning("JWT payload missing 'sub' field.")
            return None

        user = db.session.get(User, identity)
        if not user:
            logger.warning(f"User lookup failed for identity: {identity}")
        
        return user

    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload["jti"]
        return db.session.query(db.exists().where(TokenBlocklist.jti == jti)).scalar()

    # Error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        user_identity = jwt_payload.get("sub", "Unknown User")
        logger.warning(f"Expired token used by user: {user_identity}")

        return jsonify({
            "message": "Token has expired",
            "error": "token_expired"
        }), 401


    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        from flask import jsonify
        return jsonify({
            "message": "Invalid token",
            "error": "invalid_token"
        }), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        from flask import jsonify
        return jsonify({
            "message": "Missing authorization token",
            "error": "authorization_required"
        }), 401