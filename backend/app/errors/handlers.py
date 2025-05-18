from flask import jsonify
from werkzeug.exceptions import HTTPException
from jwt.exceptions import PyJWTError
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

def register_error_handlers(app):
    """Register error handlers for the Flask app."""

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'error': 'Bad Request',
            'message': str(error.description) if hasattr(error, 'description') else 'Invalid request parameters'
        }), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            'error': 'Unauthorized',
            'message': 'Authentication is required to access this resource'
        }), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            'error': 'Forbidden',
            'message': 'You do not have permission to access this resource'
        }), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'error': 'Not Found',
            'message': 'The requested resource was not found'
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            'error': 'Method Not Allowed',
            'message': 'The method is not allowed for the requested URL'
        }), 405

    @app.errorhandler(429)
    def too_many_requests(error):
        return jsonify({
            'error': 'Too Many Requests',
            'message': 'Rate limit exceeded. Please try again later.'
        }), 429

    @app.errorhandler(500)
    def internal_server_error(error):
        app.logger.error(f'Server Error: {str(error)}')
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'An unexpected error occurred'
        }), 500

    @app.errorhandler(PyJWTError)
    def handle_auth_error(error):
        app.logger.error(f'JWT Error: {str(error)}')
        return jsonify({
            'error': 'Authentication Error',
            'message': 'Invalid token or authentication error'
        }), 401

    @app.errorhandler(SQLAlchemyError)
    def handle_db_error(error):
        app.logger.error(f'Database Error: {str(error)}')
        
        if isinstance(error, IntegrityError):
            return jsonify({
                'error': 'Database Integrity Error',
                'message': 'A database constraint was violated'
            }), 400
        
        return jsonify({
            'error': 'Database Error',
            'message': 'A database error occurred'
        }), 500

    @app.errorhandler(Exception)
    def handle_generic_exception(error):
        app.logger.error(f'Unhandled Exception: {str(error)}')
        
        if isinstance(error, HTTPException):
            return jsonify({
                'error': error.name,
                'message': error.description
            }), error.code
        
        return jsonify({
            'error': 'Server Error',
            'message': 'An unexpected error occurred'
        }), 500

def create_bad_request_response(message):
    """Helper function to create a bad request response."""
    response = jsonify({'error': 'Bad Request', 'message': message})
    response.status_code = 400
    return response