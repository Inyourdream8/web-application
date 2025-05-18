"""
Authentication API module for the application.
Provides endpoints for user and admin authentication, registration, and token management.
"""
import os
import logging
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity
)
from flask_limiter.util import get_remote_address
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from werkzeug.security import generate_password_hash
from app.models.user import User
from app.utils.validators import validate_password, validate_email, validate_phone
from app.models import db, limiter

logger = logging.getLogger(__name__)
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Define user roles
ROLES = {
    'user': 1,
    'admin': 2,
}

def create_auth_response(user):
    """Generate standardized JWT response."""
    role_name = next((k for k, v in ROLES.items() if v == user.role), 'user')
    return {
        'user': {
            'id': user.id,
            'username': user.username,
            'role': role_name,
            'email': getattr(user, 'email', None),
            'phone': getattr(user, 'phone_number', None)
        },
        'tokens': {
            'access': create_access_token(
                identity=user.id,
                additional_claims={'role': role_name}
            ),
            'refresh': create_refresh_token(identity=user.id)
        }
    }

def validate_admin_request(current_user):
    """Validate admin privileges."""
    if not current_user or current_user.role < ROLES['admin']:
        logger.warning("Unauthorized admin access attempt by user %s", get_jwt_identity())
        return jsonify({'error': 'Insufficient privileges'}), 403
    return None

# ======================
# ADMIN AUTH ENDPOINTS
# ======================

@auth_bp.route('/admin/register', methods=['POST'])
@jwt_required()
@limiter.limit("10 per day", key_func=lambda: get_jwt_identity() or get_remote_address())
def admin_register():
    """Register new admin account."""
    current_user = User.query.get(get_jwt_identity())
    if error := validate_admin_request(current_user):
        return error

    data = request.get_json()
    
    required_fields = ['username', 'email', 'password', 'admin_secret']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields', 'fields': required_fields}), 400
        
    if not validate_email(data['email']):
        return jsonify({'error': 'Invalid email format'}), 400
        
    if data['admin_secret'] != os.getenv('ADMIN_REGISTER_SECRET'):
        return jsonify({'error': 'Invalid admin secret'}), 401

    try:
        admin = User(
            username=data['username'],
            email=data['email'],
            password_hash=generate_password_hash(data['password']),
            role=ROLES['admin'],
            is_active=True
        )
        
        db.session.add(admin)
        db.session.commit()
        
        logger.info("New admin created by %s", current_user.username)
        return jsonify(create_auth_response(admin)), 201
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Admin already exists'}), 409
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error("Database error during admin registration: %s", str(e))
        return jsonify({'error': 'Database operation failed'}), 500

@auth_bp.route('/admin/login', methods=['POST'])
@limiter.limit("10 per hour", key_func=get_remote_address)
def admin_login():
    """Admin login endpoint."""
    data = request.get_json()
    
    if not all(key in data for key in ['email', 'password']):
        return jsonify({'error': 'Email and password required'}), 400

    admin = User.query.filter_by(
        email=data['email'],
        role=ROLES['admin']
    ).first()
    
    if not admin or not admin.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401

    logger.info("Admin login: %s", admin.email)
    return jsonify(create_auth_response(admin)), 200

# ======================
# USER AUTH ENDPOINTS
# ======================

@auth_bp.route('/register', methods=['POST'])
@limiter.limit("10 per minute", key_func=get_remote_address)
def user_register():
    """User registration endpoint."""
    data = request.json
    
    required_fields = ['phone_number', 'password', 'username']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields', 'fields': required_fields}), 400
        
    if not validate_phone(data['phone_number']):
        return jsonify({'error': 'Invalid phone number format'}), 400
        
    if not validate_password(data['password']):
        return jsonify({'error': 'Password does not meet requirements'}), 400

    try:
        user = User(
            phone_number=data['phone_number'],
            username=data['username'],
            password_hash=generate_password_hash(data['password']),
            role=ROLES['user'],
            is_active=True
        )
        
        db.session.add(user)
        db.session.flush()
        db.session.commit()
        
        return jsonify(create_auth_response(user)), 201
        
    except IntegrityError:
        db.session.rollback()
        logger.warning("User already exists: %s", data['phone_number'])  # ✅ Adds tracking for duplicate registration
        return jsonify({'error': 'User already exists'}), 409

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error("Database error during registration: %s", str(e))
        return jsonify({'error': 'Registration failed'}), 500


@auth_bp.route('/login', methods=['POST'])
@limiter.limit("10 per minute", key_func=get_remote_address)
def user_login():
    """User login endpoint."""
    data = request.get_json()
    
    if not all(key in data for key in ['phone_number', 'password']):
        return jsonify({'error': 'Phone number and password required'}), 400

    user = User.query.filter_by(
        phone_number=data['phone_number'],
        role=ROLES['user']
    ).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401

    logger.info("User login: %s", user.phone_number)
    return jsonify(create_auth_response(user)), 200

# ======================
# COMMON ENDPOINTS
# ======================

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh_tokens():
    """Refresh access token endpoint."""
    current_user = User.query.get(get_jwt_identity())
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
        
    return jsonify({
        'access_token': create_access_token(identity=current_user.id)
    }), 200

def configure_auth_routes(bp):
    """
    Configure routes for the auth blueprint
    
    Args:
        bp: The blueprint to attach routes to
    """
    # Register routes directly on the provided blueprint
    bp.add_url_rule('/admin/register', view_func=admin_register, methods=['POST'])
    bp.add_url_rule('/admin/login', view_func=admin_login, methods=['POST'])
    bp.add_url_rule('/register', view_func=user_register, methods=['POST'])
    bp.add_url_rule('/login', view_func=user_login, methods=['POST'])
    bp.add_url_rule('/refresh', view_func=refresh_tokens, methods=['POST'])