# backend/app/api/__init__.py
"""
API module for the application.
Manages all API blueprints and route configurations.
"""
from flask import Blueprint

# Import route configuration functions
from .auth import configure_auth_routes
from .loans import configure_loan_routes
from .admin_dashboard import configure_admin_routes
from .withdrawals import configure_withdrawal_routes

# Create empty blueprints to avoid circular imports
auth_bp = Blueprint('auth', __name__)
loans_bp = Blueprint('loans', __name__)
admin_dashboard_bp = Blueprint('admin_dashboard', __name__)
withdrawals_bp = Blueprint('withdrawals', __name__)
transactions_bp = Blueprint('transactions', __name__)
payments_bp = Blueprint('payments', __name__)
reports_bp = Blueprint('reports', __name__)
settings_bp = Blueprint('settings', __name__)
notifications_bp = Blueprint('notifications', __name__)
debug_bp = Blueprint('debug', __name__)

def init_app(app):
    """Configure and register all blueprints"""
    # Configure routes for each blueprint
    configure_auth_routes(auth_bp)
    configure_loan_routes(loans_bp)
    configure_admin_routes(admin_dashboard_bp)
    configure_withdrawal_routes(withdrawals_bp)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(loans_bp, url_prefix='/api/loans')
    app.register_blueprint(admin_dashboard_bp, url_prefix='/api/admin')
    app.register_blueprint(withdrawals_bp, url_prefix='/api/withdrawals')
    app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    app.register_blueprint(settings_bp, url_prefix='/api/settings')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(debug_bp, url_prefix='/api/debug')


