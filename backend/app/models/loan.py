from datetime import datetime
from app.models import db
from enum import Enum

class LoanStatus(Enum):
    PENDING = 'pending'
    UNDER_REVIEW = 'under review'
    APPROVED = 'approved'
    REJECTED = 'rejected'
    OTP_6_DIGIT_REQUIRED = 'otp_6_digit_required'
    OTP_8_DIGIT_REQUIRED = 'otp_8_digit_required'
    OTP_10_DIGIT_REQUIRED = 'otp_10_digit_required'
    AMLC_INVESTIGATION = 'AMLC Investigation'
    INVALID_BANK_DETAILS = 'invalid bank details'
    LOAN_CANCELLATION = 'loan cancellation'
    INVALID_WITHDRAWAL_AMOUNT = 'invalid withdrawal amount'
    OVERDUE = 'overdue'
    DELETED = 'deleted'
    ON_HOLD = 'on-hold'
    CLOSED = 'closed'
    PENALTIES = 'penalties'
    INSUFFICIENT_CREDIT_SCORE = 'insufficient credit score'
    RESTRUCTURED = 'restructured'
    DEFAULTED = 'defaulted'
    TAX_PAYMENT_REQUIRED = 'tax payment required'
    CANCELLED = 'cancelled'
    ACCOUNT_FROZEN = 'account frozen'
    PAID = 'paid'

class Loan(db.Model):
    __tablename__ = 'loans'
    
    application_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), index=True)
    application_number = db.Column(db.String(20), unique=True, nullable=False, index=True)
    
    national_id = db.Column(db.String(20), unique=True, nullable=False)
    address= db.Column(db.String(200))
    loan_amount = db.Column(db.Float, nullable=False)
    interest_rate = db.Column(db.Float, nullable=False, default=4.0)
    
    term_months = db.Column(db.Integer, nullable=False)
    
    loan_status = db.Column(db.Enum(LoanStatus), default=LoanStatus.UNDER_REVIEW, index=True)
    purpose = db.Column(db.String(200))
    employment_status = db.Column(db.String(50))
    employer = db.Column(db.String(100))
    employment_duration = db.Column(db.String(50))
    monthly_income = db.Column(db.Float)
    bank_name = db.Column(db.String(100))
    account_name = db.Column(db.String(100))
    account_number = db.Column(db.String(50))
    application_date = db.Column(db.DateTime, default=datetime.utcnow)
    approval_date = db.Column(db.DateTime)
    due_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = db.Column(db.Boolean, default=False)

@staticmethod
def validate_loan_amount(amount):
        """
        Validate that the loan amount is within allowed limits.
        Raises ValueError if the amount is invalid.
        """
        if amount < 100000.00:
            raise ValueError("Loan amount must be at least PHP 100,000.00")
        if amount > 3000000.00:
            raise ValueError("Loan amount cannot exceed PHP 3,000,000.00")

def to_dict(self):
        """
        Serialize the Loan object to a dictionary for JSON responses.
        """
        def get_enum_value(field):
            return field.value if isinstance(field, Enum) else field

        def format_datetime(field):
            return field.isoformat() if isinstance(field, datetime) else None

        def serialize_field(field):
            if isinstance(field, Enum):
                return get_enum_value(field)
            if isinstance(field, datetime):
                return format_datetime(field)
            if isinstance(field, list):
                return [serialize_field(item) for item in field]  # Handle lists
            return field

        return {
            'id': getattr(self, 'id', None),
            'user_id': getattr(self, 'user_id', None),
            'application_id': getattr(self, 'application_id', None),
            'application_number': getattr(self, 'application_number', None),
            'name': getattr(self, 'name', None),
            'national_id': getattr(self, 'national_id', None),
            'address': getattr(self, 'address', None),
            'loan_amount': getattr(self, 'loan_amount', 0.0),
            'interest_rate': getattr(self, 'interest_rate', 4.0),
            'term_months': getattr(self, 'termMonths', [6, 12, 24, 36, 48]),
            'loan_status': serialize_field(self.loan_status),
            'purpose': getattr(self, 'purpose', None),
            'employment_status': getattr(self, 'employment_status', None),
            'employer': getattr(self, 'employer', None),
            'employment_duration': getattr(self, 'employment_duration', None),
            'monthly_income': getattr(self, 'monthly_income', None),
            'bank_name': getattr(self, 'bank_name', None),
            'account_name': getattr(self, 'account_name', None),
            'account_number': getattr(self, 'account_number', None),
            'application_date': serialize_field(self.application_date),
            'approval_date': serialize_field(self.approval_date),
            'due_date': serialize_field(self.due_date),
            'created_at': serialize_field(self.created_at),
            'updated_at': serialize_field(self.updated_at),
    }


def __repr__(self):
    return f'<Application Number {self.application_number} - User {self.user_id} - PHP {self.loan_amount}>'
