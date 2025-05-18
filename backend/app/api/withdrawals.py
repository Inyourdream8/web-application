"""
API endpoints for handling withdrawal operations.
Provides functionality for creating, retrieving, and managing withdrawal requests.
"""
import uuid
from datetime import datetime
from functools import wraps

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db
from app.models.withdrawal import Withdrawal, WithdrawalStatus
from app.utils.validators import validate_withdrawal_request
import sqlalchemy.exc

# Blueprint for withdrawals
withdrawals_bp = Blueprint("withdrawals", __name__)

# Admin access decorator
def admin_required(func):
    """
    Decorator to restrict access to admin users only.
    
    Args:
        func: The function to be decorated
        
    Returns:
        The wrapped function that checks for admin privileges
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        # In a real scenario, replace this with your user role verification logic
        current_user_role = get_jwt_identity()  # Fetch user identity and determine role
        if current_user_role != 'admin':  # Adjust this condition to fit your logic
            return jsonify({'message': 'Admin access required'}), 403
        return func(*args, **kwargs)
    return wrapper

@withdrawals_bp.route('/', methods=['POST'])
@jwt_required()
def create_withdrawal():
    """
    Create a new withdrawal request.
    
    Validates the provided withdrawal data and creates a new withdrawal record
    with a unique transaction ID. Requires authentication.
    
    Returns:
        JSON response with the withdrawal details or error message
    """
    current_user_id = get_jwt_identity()
    data = request.get_json()

    # Validate input data
    if not data:
        return jsonify({'message': 'No input data provided'}), 400

    validation_result = validate_withdrawal_request(data)
    if validation_result:
        return jsonify({'message': validation_result}), 400

    if data['amount'] <= 0:
        return jsonify({'message': 'Withdrawal amount must be greater than zero'}), 400

    # Generate a unique transaction ID
    transaction_id = str(uuid.uuid4())

    # Create new withdrawal request
    withdrawal = Withdrawal(
        user_id=current_user_id,
        amount=data['amount'],
        transaction_id=transaction_id,
        status=WithdrawalStatus.PENDING,
        request_date=datetime.utcnow(),
        notes=data.get('notes', '').strip()  # Sanitize notes input
    )

    try:
        db.session.add(withdrawal)
        db.session.commit()
    except (ValueError, TypeError) as e:
        db.session.rollback()
        return jsonify({'message': 'Validation error', 'error': str(e)}), 400
    except sqlalchemy.exc.SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'message': 'Database error', 'error': str(e)}), 500

    return jsonify(withdrawal.to_dict()), 201

@withdrawals_bp.route('/', methods=['GET'])
@jwt_required()
def get_withdrawals():
    """
    Retrieve a paginated list of user's withdrawal requests.
    
    Supports filtering by status and pagination parameters.
    Results are ordered with newest withdrawals first.
    
    Returns:
        JSON response with paginated withdrawal data
    """
    current_user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 100)  # Limit max items per page
    status = request.args.get('status')

    query = Withdrawal.query.filter_by(user_id=current_user_id)

    if status:
        query = query.filter_by(status=status)

    # Order by newest first
    query = query.order_by(Withdrawal.request_date.desc())

    # Paginate results
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    withdrawals = pagination.items

    return jsonify({
        'items': [withdrawal.to_dict() for withdrawal in withdrawals],
        'total': pagination.total,
        'pages': pagination.pages,
        'page': page,
        'per_page': per_page
    }), 200

@withdrawals_bp.route('/<int:withdrawal_id>', methods=['GET'])
@jwt_required()
def get_withdrawal(withdrawal_id):
    """
    Retrieve details of a specific withdrawal request.
    
    Args:
        withdrawal_id: ID of the withdrawal to retrieve
        
    Returns:
        JSON response with withdrawal details or 404 error
    """
    current_user_id = get_jwt_identity()
    withdrawal = Withdrawal.query.filter_by(id=withdrawal_id, user_id=current_user_id).first()

    if not withdrawal:
        return jsonify({'message': 'Withdrawal not found'}), 404

    return jsonify(withdrawal.to_dict()), 200

@withdrawals_bp.route('/<int:withdrawal_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_withdrawal(withdrawal_id):
    """
    Cancel a pending withdrawal request.
    
    Only withdrawals in pending status can be cancelled.
    
    Args:
        withdrawal_id: ID of the withdrawal to cancel
        
    Returns:
        JSON response with success message or error details
    """
    current_user_id = get_jwt_identity()
    withdrawal = Withdrawal.query.filter_by(id=withdrawal_id, user_id=current_user_id).first()

    if not withdrawal:
        return jsonify({'message': 'Withdrawal not found'}), 404

    # Only allow cancellation if the withdrawal is still pending
    if withdrawal.status != WithdrawalStatus.PENDING:
        return jsonify({'message': 'Cannot cancel withdrawal that is not in pending status'}), 400

    withdrawal.status = WithdrawalStatus.CANCELLED

    try:
        db.session.commit()
    except sqlalchemy.exc.SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'message': 'Database error', 'error': str(e)}), 500

    return jsonify({'message': 'Withdrawal cancelled successfully', 'withdrawal': withdrawal.to_dict()}), 200

@withdrawals_bp.route('/<int:withdrawal_id>/process', methods=['POST'])
@jwt_required()
@admin_required
def process_withdrawal(withdrawal_id):
    """
    Process a withdrawal request by approving or rejecting it.
    
    Admin-only endpoint that allows updating a withdrawal's status
    to either completed or rejected. Adds a processed date timestamp.
    
    Args:
        withdrawal_id: ID of the withdrawal to process
        
    Returns:
        JSON response with updated withdrawal details or error message
    """
    # In a real application, you would check if the current user has admin rights
    withdrawal = Withdrawal.query.get_or_404(withdrawal_id)

    data = request.get_json() or {}
    processing_status = data.get('status')

    if processing_status not in [WithdrawalStatus.COMPLETED, WithdrawalStatus.REJECTED]:
        return jsonify({'message': 'Invalid processing status'}), 400

    withdrawal.status = processing_status
    withdrawal.processed_date = datetime.utcnow()

    if 'notes' in data:
        withdrawal.notes = data['notes'].strip()  # Sanitize notes input

    try:
        db.session.commit()
    except sqlalchemy.exc.SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'message': 'Database error', 'error': str(e)}), 500

    return jsonify(withdrawal.to_dict()), 200

def configure_withdrawal_routes(bp):
    """
    Configure routes for the withdrawals blueprint
    
    Args:
        bp: The blueprint to attach routes to
    """
    # Register routes directly on the provided blueprint
    bp.add_url_rule('/', view_func=create_withdrawal, methods=['POST'])
    bp.add_url_rule('/', view_func=get_withdrawals, methods=['GET'])
    bp.add_url_rule('/<int:withdrawal_id>', view_func=get_withdrawal, methods=['GET'])
    bp.add_url_rule('/<int:withdrawal_id>/cancel', view_func=cancel_withdrawal, methods=['POST'])
    bp.add_url_rule('/<int:withdrawal_id>/process', view_func=process_withdrawal, methods=['POST'])