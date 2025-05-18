import random
from datetime import datetime
from app.models import db

class OTP(db.Model):
    __tablename__ = 'otps'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    otp_code = db.Column(db.String(10), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'otp_code': self.otp_code,
            'created_at': self.created_at.isoformat(),
        }

    def set_otp(self, otp_code):
        if len(otp_code) not in [6, 8, 10] or not otp_code.isdigit():
            raise ValueError("OTP must be 6, 8, or 10 digits.")
        self.otp_code = otp_code

    def __repr__(self):
        return f'<OTP {self.otp_code} for User {self.user_id}>'