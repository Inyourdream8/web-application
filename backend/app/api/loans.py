"""
API endpoints for loan management functionality.
Provides CRUD operations for loan applications and status updates.
"""
from datetime import datetime, timedelta

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.decorators import admin_required
from app.models import db
from app.models.loan import Loan, LoanStatus
from app.utils.validators import validate_loan_request
from app.utils.pagination import paginate
import sqlalchemy.exc

loans_bp = Blueprint('loans', __name__, url_prefix='/api/loans')

@loans_bp.route('/', methods=['POST'])
@jwt_required()
def create_loan():
    """Create a new loan application"""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate input data
    if not data:
        return jsonify({'message': 'No input data provided'}), 400
    
    if error := validate_loan_request(data):
        return jsonify({'message': error}), 400
    
    # Check if user has existing pending loan
    existing_loan = Loan.query.filter_by(
        user_id=current_user_id,
        status=LoanStatus.PENDING
    ).first()
    
    if existing_loan:
        return jsonify({
            'message': 'You already have a pending loan application',
            'application_number': existing_loan.application_number
        }), 400
    
    # Create new loan
    loan = Loan(
        user_id=current_user_id,
        application_number=Loan.generate_application_number(),
        loan_amount=data['amount'],
        interest_rate=data.get('interest_rate', 4.0),
        termMonths=data['termMonths'],
        purpose=data.get('purpose', 'Personal Loan'),
        application_date=datetime.utcnow(),
        status=LoanStatus.PENDING
    )
    
    try:
        db.session.add(loan)
        db.session.commit()
        return jsonify({
            'message': 'Loan application submitted successfully',
            'application_number': loan.application_number,
            'loan': loan.to_dict()
        }), 201
    except (ValueError, TypeError) as e:
        db.session.rollback()
        return jsonify({'message': 'Validation error', 'error': str(e)}), 400
    except sqlalchemy.exc.SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'message': 'Database error', 'error': str(e)}), 500

@loans_bp.route('/', methods=['GET'])
@jwt_required()
def get_loans():
    """Get paginated list of loans for current user"""
    current_user_id = get_jwt_identity()
    status = request.args.get('status')
    
    # Start building query
    query = Loan.query.filter_by(user_id=current_user_id)
    
    # Filter by status if provided
    if status and hasattr(LoanStatus, status):
        query = query.filter(Loan.status == status)
    
    # Paginate results
    return paginate(
        query,
        serializer=lambda loan: loan.to_dict(),
        per_page=min(request.args.get('per_page', 10, type=int), 100)
    )

@loans_bp.route('/<string:loan_id>', methods=['GET'])
@jwt_required()
def get_loan(loan_id):
    """Get details of a specific loan"""
    current_user_id = get_jwt_identity()
    loan = Loan.query.filter_by(
        id=loan_id,
        user_id=current_user_id
    ).first_or_404()
    
    return jsonify(loan.to_dict()), 200

@loans_bp.route('/<string:loan_id>', methods=['PUT'])
@jwt_required()
def update_loan(loan_id):
    """Update a pending loan application"""
    current_user_id = get_jwt_identity()
    # Get the loan object
    loan = Loan.query.filter_by(
        id=loan_id,
        user_id=current_user_id,
        status=LoanStatus.PENDING
    ).first_or_404()
    
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No input data provided'}), 400
    
    # Validate and update fields directly on the loan object
    if 'purpose' in data:
        loan.purpose = data['purpose']
    
    if 'amount' in data:
        if not isinstance(data['amount'], (int, float)) or data['amount'] <= 0:
            return jsonify({'message': 'Invalid loan amount'}), 400
        loan.loan_amount = data['amount']
    
    if 'termMonths' in data:
        if not isinstance(data['termMonths'], int) or data['termMonths'] <= 0:
            return jsonify({'message': 'Invalid loan term'}), 400
        loan.termMonths = data['termMonths']
    
    try:
        db.session.commit()
        return jsonify(loan.to_dict()), 200
    except (ValueError, TypeError) as e:
        db.session.rollback()
        return jsonify({'message': 'Validation error', 'error': str(e)}), 400
    except sqlalchemy.exc.SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'message': 'Database error', 'error': str(e)}), 500

@loans_bp.route('/<string:loan_id>', methods=['DELETE'])
@jwt_required()
def cancel_loan(loan_id):
    """Cancel a pending loan application"""
    current_user_id = get_jwt_identity()
    loan = Loan.query.filter_by(
        id=loan_id,
        user_id=current_user_id,
        status=LoanStatus.PENDING
    ).first_or_404()
    
    try:
        db.session.delete(loan)
        db.session.commit()
        return jsonify({'message': 'Loan application cancelled successfully'}), 200
    except sqlalchemy.exc.SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'message': 'Database error', 'error': str(e)}), 500

@loans_bp.route('/<string:loan_id>/status', methods=['POST'])
@jwt_required()
@admin_required
def update_loan_status(loan_id):
    """Admin endpoint to approve/reject loans"""
    loan = Loan.query.get_or_404(loan_id)
    data = request.get_json() or {}
    
    if not (new_status := data.get('status')):
        return jsonify({'message': 'Status is required'}), 400
    
    if new_status not in [LoanStatus.APPROVED, LoanStatus.REJECTED]:
        return jsonify({'message': 'Invalid status'}), 400
    
    # Validate loan can transition to new status
    if loan.status != LoanStatus.PENDING:
        return jsonify({
            'message': f'Loan is already {loan.status}, cannot change status'
        }), 400
    
    # Update loan status
    loan.status = new_status
    loan.processed_date = datetime.utcnow()
    
    if new_status == LoanStatus.APPROVED:
        loan.due_date = datetime.utcnow() + timedelta(days=30 * loan.termMonthss)
    
    try:
        db.session.commit()
        return jsonify(loan.to_dict()), 200
    except (ValueError, AttributeError) as e:
        db.session.rollback()
        return jsonify({'message': 'Validation error', 'error': str(e)}), 400
    except sqlalchemy.exc.SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'message': 'Database error', 'error': str(e)}), 500

def configure_loan_routes(bp):
    """
    Configure routes for the loans blueprint
    
    Args:
        bp: The blueprint to attach routes to
    """
    # Register routes directly on the provided blueprint
    bp.add_url_rule('/', view_func=create_loan, methods=['POST'])
    bp.add_url_rule('/', view_func=get_loans, methods=['GET'])
    bp.add_url_rule('/<string:loan_id>', view_func=get_loan, methods=['GET'])
    bp.add_url_rule('/<string:loan_id>', view_func=update_loan, methods=['PUT'])
    bp.add_url_rule('/<string:loan_id>', view_func=cancel_loan, methods=['DELETE'])
    bp.add_url_rule('/<string:loan_id>/status', view_func=update_loan_status, methods=['POST'])