"""
Admin dashboard API module providing administrative endpoints for platform management.
Includes routes for statistics, loan management, user management, and OTP generation.
"""
import sqlalchemy.exc
import random

from functools import wraps
import logging
from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from app.extensions import db
from flask_limiter.middleware import current_remote_address
from flask_limiter.util import get_remote_address

limiter = Limiter(key_func=current_remote_address)

# Configure Flask-Limiter to use the remote address as the key function.
app_limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour", "1 per minute"],
)
from app.models.user import AccountStatus, User
from app.models.loan import Loan, LoanStatus
from app.models.activity_log import ActivityLog
from app.models.withdrawal import Withdrawal
from app.models.OTP import OTP

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Initialize rate limiter
limiter = Limiter(
    key_func=lambda: get_jwt().get('sub') if get_jwt() else get_remote_address,
    default_limits=["100 per hour"],
    storage_uri="memory://"
)

admin_dashboard_bp = Blueprint('admin_dashboard', __name__, url_prefix='/api/admin')

def admin_required(allowed_roles=['admin']):
    """Decorator to enforce flexible role-based admin authentication"""
    def wrapper(f):
        @wraps(f)
        @jwt_required()
        def decorated_function(*args, **kwargs):
            claims = get_jwt()
            role = claims.get('role', 'user')  # Default to 'user'

            if role not in allowed_roles:
                logger.warning(f"Unauthorized access attempt by role: {role}")
                return jsonify({
                    'status': 'error',
                    'message': f'Insufficient privileges: {role} access denied',
                    'code': 'ROLE_ACCESS_DENIED'
                }), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return wrapper

# Example Usage:
@admin_dashboard_bp.route('/secure-data')
@admin_required(['admin', 'superadmin'])  # Allows both 'admin' & 'superadmin'
def secure_data():
    return jsonify({'message': 'Access granted'})

@admin_dashboard_bp.route('/generate-otp', methods=['POST'])
@limiter.limit("50 per minute")
@admin_required
def generate_otp():
    """Admin route to generate OTP for a customer"""
    try:
        # Validate admin role (already ensured by admin_required decorator)
        data = request.json
        customer_id = data.get('customer_id')
        otp_length = data.get('otp_length', 6)  # Default to 6 digits
        if not customer_id:
            return jsonify({"error": "Customer ID is required"}), 400

        # Validate OTP length
        if otp_length not in [6, 8, 10]:
            return jsonify({
                "error": "Invalid OTP length, please provide a length of 6, 8, or 10"
            }), 400
    
        # Generate OTP
        otp_code = ''.join(random.choices('0123456789', k=otp_length))

        # Save OTP to the database
        otp_entry = OTP(customer_id=customer_id, otp_code=otp_code, created_at=datetime.utcnow())
        db.session.add(otp_entry)
        db.session.commit()

        return jsonify({"otp_code": otp_code}), 200

    except (ValueError, TypeError) as e:
        logger.error("OTP generation validation error: %s", str(e))
        return jsonify({"error": "Invalid input data for OTP generation"}), 400
    except sqlalchemy.exc.SQLAlchemyError as e:
        logger.error("OTP database error: %s", str(e))
        return jsonify({"error": "Failed to save OTP to database"}), 500

@admin_dashboard_bp.route('/stats', methods=['GET'])
@limiter.limit("10 per minute")
@admin_required
def get_platform_stats():
    """Get comprehensive platform statistics with caching"""
    try:
        # Time ranges for analytics
        now = datetime.utcnow()
        time_ranges = {
            '24h': now - timedelta(hours=24),
            '7d': now - timedelta(days=7),
            '30d': now - timedelta(days=30)
        }

        # User analytics
        user_stats = {
            'total': User.query.count(),
            'new': {
                '24h': User.query.filter(User.created_at >= time_ranges['24h']).count(),
                '7d': User.query.filter(User.created_at >= time_ranges['7d']).count(),
                '30d': User.query.filter(User.created_at >= time_ranges['30d']).count()
            }
        }

        # Loan analytics
        loan_stats = {
            'total': Loan.query.count(),
            'amount': {
                'total': db.session.query(db.func.sum(Loan.loan_amount)).scalar() or 0,
                'approved': db.session.query(db.func.sum(Loan.loan_amount))
                            .filter(LoanStatus == LoanStatus.APPROVED).scalar() or 0
            },
            'status': {
                status.name: Loan.query.filter(LoanStatus == LoanStatus).count()
                for status in LoanStatus
            }
        }

        # Withdrawal analytics
        withdrawal_stats = {
            'amount': Withdrawal.query.count(),
            'otp-code': Withdrawal.query.count(),
            'completed': Withdrawal.query.filter_by(WithdrawalStatus='COMPLETED').count(),
            'pending': Withdrawal.query.filter_by(WithdrawalStatus='Processing...').count()
        }

        # Recent activity
        recent_activity = {
            'loans': [loan.to_admin_dict() for loan in 
                     Loan.query.order_by(Loan.created_at.desc()).limit(5).all()],
            'users': [user.to_admin_dict() for user in 
                     User.query.order_by(User.created_at.desc()).limit(5).all()],
            'withdrawals': [w.to_admin_dict() for w in 
                          Withdrawal.query.order_by(Withdrawal.created_at.desc()).limit(5).all()]
        }

        return jsonify({
            'status': 'success',
            'data': {
                'users': user_stats,
                'loans': loan_stats,
                'withdrawals': withdrawal_stats,
                'recent_activity': recent_activity,
                'timestamp': now.isoformat()
            }
        })

    except (AttributeError, TypeError) as e:
        logger.error("Stats calculation error: %s", str(e))
        return jsonify({
            'status': 'error',
            'message': 'Error calculating statistics',
            'code': 'STATS_CALCULATION_ERROR'
        }), 500
    except sqlalchemy.exc.SQLAlchemyError as e:
        logger.error("Database error in platform stats: %s", str(e))
        return jsonify({
            'status': 'error',
            'message': 'Failed to retrieve statistics from database',
            'code': 'STATS_RETRIEVAL_ERROR'
        }), 500

@admin_dashboard_bp.route('/loans', methods=['GET'])
@limiter.limit("10 per minute")
@admin_required
def get_loans():
    """Get paginated, filterable list of loans with advanced search"""
    try:
        # Parse query parameters
        params = {
            'page': request.args.get('page', 1, type=int),
            'per_page': request.args.get('per_page', 20, type=int),
            'status': request.args.get('status'),
            'search': request.args.get('search', '').strip(),
            'sort': request.args.get('sort', '-created_at'),
            'min_amount': request.args.get('min_amount', type=float),
            'max_amount': request.args.get('max_amount', type=float),
            'date_from': request.args.get('date_from'),
            'date_to': request.args.get('date_to')
        }

        # Base query
        query = Loan.query.join(User)

        # Apply filters
        if params['status']:
            query = query.filter(LoanStatus == params['status'])

        if params['search']:
            search = f"%{params['search']}%"
            query = query.filter(
                db.or_(
                    Loan.application_number.ilike(search),
                    User.username.ilike(search),
                    User.email.ilike(search),
                    User.phone_number.ilike(search)
                )
            )

        if params['min_amount']:
            query = query.filter(Loan.loan_amount >= params['min_amount'])

        if params['max_amount']:
            query = query.filter(Loan.loan_amount <= params['max_amount'])

        if params['date_from']:
            query = query.filter(Loan.created_at >= params['date_from'])

        if params['date_to']:
            query = query.filter(Loan.created_at <= params['date_to'])

        # Apply sorting
        sort_field, sort_dir = params['sort'][0] == '-', params['sort'].lstrip('-')
        sort_column = getattr(Loan, sort_field, Loan.created_at)
        query = query.order_by(sort_column.desc() if sort_dir else sort_column.asc())

        # Pagination
        paginated_loans = query.paginate(
            page=params['page'],
            per_page=params['per_page'],
            error_out=False
        )

        return jsonify({
            'status': 'success',
            'data': {
                'loans': [loan.to_admin_dict() for loan in paginated_loans.items],
                'pagination': {
                    'total': paginated_loans.total,
                    'pages': paginated_loans.pages,
                    'current_page': paginated_loans.page,
                    'per_page': paginated_loans.per_page
                }
            }
        })

    except (ValueError, AttributeError, TypeError) as e:
        logger.error("Loan query parameter error: %s", str(e))
        return jsonify({
            'status': 'error',
            'message': 'Invalid query parameters',
            'code': 'INVALID_PARAMETERS'
        }), 400
    except sqlalchemy.exc.SQLAlchemyError as e:
        logger.error("Database error in loan retrieval: %s", str(e))
        return jsonify({
            'status': 'error',
            'message': 'Failed to retrieve loans',
            'code': 'LOAN_RETRIEVAL_ERROR'
        }), 500

@admin_dashboard_bp.route('/loans/<string:loan_id>', methods=['GET', 'PUT', 'PATCH', 'DELETE'])
@limiter.limit("10 per minute")
@admin_required
def manage_loan(loan_id):
    """Manage individual loan and related customer data with audit logging"""
    loan = Loan.query.filter_by(application_number=loan_id).first_or_404()
    users = User.query.get(loan.user_id)

    if request.method == 'GET':
        return jsonify({
            'status': 'success',
            'data': loan.to_admin_dict(include_borrower=True)
        })

    elif request.method in ['PUT', 'PATCH']:
        try:
            data = request.get_json()
            admin_id = get_jwt().get('sub')
            changes = []

            # Update loan status
            if 'status' in data:
                old_status = loan.status
                new_status = data['status']
                if old_status != new_status:
                    loan.status = new_status
                    changes.append(f"Status changed from {old_status} to {new_status}")

                    if new_status == LoanStatus.APPROVED and not loan.approval_date:
                        loan.approval_date = datetime.utcnow()
                        changes.append("Approval date set")

            # Update customer financial details
            updatable_fields = [
                'full_name', 'phone_number','national_id' 'address', 'loan_amount', 'interest_rate', 'purpose',
                'employment_status', 'employer', 'monthly_income', 'bank_name', 'account_name',
                'account_number', 'status'
            ]
            for field in updatable_fields:
                if field in data and getattr(users, field) != data[field]:
                    old_value = getattr(users, field)
                    setattr(users, field, data[field])
                    changes.append(f"{field} changed from {old_value} to {data[field]}")

            if changes:
                # Create audit log
                audit_log = ActivityLog(
                    admin_id=admin_id,
                    customer_id=users.id,
                    loan_id=loan.id,
                    action="CUSTOMER_LOAN_UPDATE",
                    description=" | ".join(changes),
                    ip_address=request.remote_addr
                )
                db.session.add(audit_log)
                db.session.commit()

            return jsonify({
                'status': 'success',
                'message': 'Loan and customer data updated successfully',
                'changes': changes
            })

        except (ValueError, TypeError, AttributeError) as e:
            db.session.rollback()
            logger.error("Loan/customer update validation error: %s", str(e))
            return jsonify({
                'status': 'error',
                'message': 'Invalid data for loan/customer update',
                'code': 'UPDATE_VALIDATION_ERROR'
            }), 400
        except sqlalchemy.exc.SQLAlchemyError as e:
            db.session.rollback()
            logger.error("Database error: %s", str(e))
            return jsonify({
                'status': 'error',
                'message': 'Failed to update loan/customer data',
                'code': 'DB_UPDATE_ERROR'
            }), 500

    elif request.method == 'DELETE':
        try:
            admin_id = get_jwt().get('sub')

            # Soft delete customer data
            users.status = AccountStatus.INACTIVE  # Mark as inactive instead of permanent deletion
            loan.status = LoanStatus.DELETED  # Mark loan as deleted
            db.session.commit()

            audit_log = ActivityLog(
                admin_id=admin_id,
                customer_id=users.id,
                loan_id=loan.id,
                action="CUSTOMER_LOAN_DELETE",
                description=f"Loan {loan_id} and Customer {users.full_name} marked as INACTIVE",
                ip_address=request.remote_addr
            )
            db.session.add(audit_log)
            db.session.commit()

            return jsonify({'status': 'success', 'message': 'Customer and loan data deleted successfully'})

        except sqlalchemy.exc.SQLAlchemyError as e:
            db.session.rollback()
            logger.error("Customer deletion error: %s", str(e))
            return jsonify({
                'status': 'error',
                'message': 'Failed to delete customer loan data',
                'code': 'DB_DELETE_ERROR'
            }), 500


@admin_dashboard_bp.route('/users', methods=['GET'])
@limiter.limit("10 per minute")
@admin_required
def get_users():
    """Get paginated user list with advanced filtering"""
    try:
        params = {
            'page': request.args.get('page', 1, type=int),
            'per_page': request.args.get('per_page', 20, type=int),
            'search': request.args.get('search', '').strip(),
            'role': request.args.get('role'),
            'status': request.args.get('status'),
            'sort': request.args.get('sort', '-created_at')
        }

        query = User.query

        # Apply filters
        if params['search']:
            search = f"%{params['search']}%"
            query = query.filter(
                db.or_(
                    User.username.ilike(search),
                    User.email.ilike(search),
                    User.phone_number.ilike(search)
                )
            )

        if params['role']:
            query = query.filter(User.role == params['role'])

        if params['account_status']:
            query = query.filter(User.is_active == (params['account_status'] == 'active'))

        # Apply sorting
        sort_field, sort_dir = params['sort'][0] == '-', params['sort'].lstrip('-')
        sort_column = getattr(User, sort_field, User.created_at)
        query = query.order_by(sort_column.desc() if sort_dir else sort_column.asc())

        # Pagination
        paginated_users = query.paginate(
            page=params['page'],
            per_page=params['per_page'],
            error_out=False
        )

        return jsonify({
            'status': 'success',
            'data': {
                'users': [user.to_admin_dict() for user in paginated_users.items],
                'pagination': {
                    'total': paginated_users.total,
                    'pages': paginated_users.pages,
                    'current_page': paginated_users.page,
                    'per_page': paginated_users.per_page
                }
            }
        })

    except (ValueError, AttributeError, TypeError) as e:
        logger.error("User query parameter error: %s", str(e))
        return jsonify({
            'status': 'error',
            'message': 'Invalid query parameters',
            'code': 'INVALID_PARAMETERS'
        }), 400
    except sqlalchemy.exc.SQLAlchemyError as e:
        logger.error("Database error in user retrieval: %s", str(e))
        return jsonify({
            'status': 'error',
            'message': 'Failed to retrieve users',
            'code': 'USER_RETRIEVAL_ERROR'
        }), 500

def configure_admin_routes(bp):
    """
    Configure routes for the admin dashboard blueprint
    
    Args:
        bp: The blueprint to attach routes to
    """
    # Register routes directly on the provided blueprint
    bp.add_url_rule('/generate-otp', view_func=generate_otp, methods=['POST'])
    bp.add_url_rule('/stats', view_func=get_platform_stats, methods=['GET'])
    bp.add_url_rule('/loans', view_func=get_loans, methods=['GET'])
    bp.add_url_rule('/loans/<string:loan_id>', view_func=manage_loan, methods=['GET', 'PUT', 'PATCH'])
    bp.add_url_rule('/users', view_func=get_users, methods=['GET'])
