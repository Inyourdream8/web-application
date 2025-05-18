from functools import wraps
from flask_jwt_extended import jwt_required, verify_jwt_in_request, get_jwt
from flask import jsonify

# Define roles mapping
ROLES = {
    "user": 1,
    "admin": 2,
}

def role_required(required_role):
    """Factory function to create role-based access decorators"""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # Verify the JWT token in the request
            verify_jwt_in_request()

            # Extract claims from the token
            claims = get_jwt()
            user_role_level = ROLES.get(claims.get('role', 'user'), 0)

            # Ensure the user has sufficient privileges
            if user_role_level < ROLES[required_role]:
                return jsonify({
                    "message": f"Access denied: {required_role} access required",
                    "error": "insufficient_permissions"
                }), 403

            # Execute the wrapped function
            return fn(*args, **kwargs)
        return wrapper
    return decorator

# Specific decorators
admin_required = role_required("admin")