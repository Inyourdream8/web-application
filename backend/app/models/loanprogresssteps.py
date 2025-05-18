from datetime import datetime
from app.models import db
from sqlalchemy import Enum
from app.models.loan import LoanStatus

class LoanProgressSteps(db.Model):
    __tablename__ = 'loanprogresssteps'

    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.String(20), db.ForeignKey('loans.application_id'), nullable=False, index=True)
    loan_status = db.Column(Enum(LoanStatus), nullable=False, index=True)  # ✅ Fixed reference

    current_step = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    completed_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'application_id': self.application_id,
            'loan_status': self.loan_status.value,  # ✅ Fixed property reference
            'current_step': self.current_step,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }