from datetime import datetime
from app.models import db
from enum import Enum
from sqlalchemy.exc import IntegrityError
from sqlalchemy import CheckConstraint


class ValidationError(Exception):
    pass


class WithdrawalStatus(Enum):
    PROCESSING = 'processing'
    COMPLETED = 'completed'
    SUCCESSFUL = 'successful'
    ON_HOLD = 'on-hold'
    EXCEPTION = 'exception'
    REJECTED = 'rejected'
    FAILED = 'failed'
    PAID = 'paid'
    ISSUED = 'issued'
    PENDING = 'pending'
    INVALID_BANK_DETAILS = 'invalid bank details'
    ACCOUNT_FROZEN = 'account frozen'
    OVERDUE = 'overdue'
    TAX_PAYMENT_REQUIRED = 'tax payment required'
    FROZEN = 'frozen'
    CANCELLED = 'cancelled'


class WithdrawalQuery(db.Query):
    def not_deleted(self):
        return self.filter(Withdrawal.is_deleted.is_(False))


class Withdrawal(db.Model):
    __tablename__ = 'withdrawals'
    __table_args__ = (
        CheckConstraint('amount > 0', name='check_amount_positive'),
    )
    query_class = WithdrawalQuery

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), index=True)
    application_id = db.Column(db.String(20), unique=True, nullable=False)
    application_number = db.Column(db.String(20), unique=True, nullable=False, index=True)
    amount = db.Column(db.Float, nullable=False)
    otp = db.Column(db.String(10), nullable=False)
    withdrawal_status = db.Column(
        db.Enum(WithdrawalStatus), 
        default=lambda: WithdrawalStatus.PROCESSING, 
        index=True
    )
    transaction_id = db.Column(db.String(100), unique=True, index=True)
    processed_date = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    is_deleted = db.Column(db.Boolean, default=False)

    @staticmethod
    def validate_otp(otp):
        ALLOWED_OTP_LENGTHS = {6, 8, 10}
        if len(otp) not in ALLOWED_OTP_LENGTHS or not otp.isdigit():
            raise ValidationError(f"Invalid OTP: '{otp}'. Must be {' or '.join(map(str, ALLOWED_OTP_LENGTHS))} digits.")

    def validate_amount(self):
        if self.amount <= 0:
            raise ValueError("Withdrawal amount must be greater than zero.")

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'application_id': self.application_id,
            'application_number': self.application_number,
            'amount': self.amount,
            'otp': self.otp,
            'withdrawal_status': self.withdrawal_status.value if isinstance(self.withdrawal_status, Enum) else self.withdrawal_status,
            'transaction_id': self.transaction_id,
            'processed_date': self.processed_date.isoformat() if self.processed_date else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<Withdrawal {self.id} - PHP {self.amount}>'