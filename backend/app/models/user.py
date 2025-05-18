from datetime import datetime
from enum import Enum
from ..extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
import re

# Enum for user roles
class Useroles(Enum):
    USER = 1
    ADMIN = 2

# Enum for account statuses
class AccountStatus(Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    BANNED = "banned"
    SUSPENDED = "suspended"

class User(db.Model):
    __tablename__ = 'users'
    
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, index=True)
    email = db.Column(db.String(120), unique=True, index=True, nullable=True)
    phone_number = db.Column(db.String(20), unique=True, index=True, nullable=True)
    password_hash = db.Column(db.String(128))
    role = db.Column(db.Enum(Useroles), default=Useroles.USER)
    account_status = db.Column(db.Enum(AccountStatus), default=AccountStatus.ACTIVE)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    loans = db.relationship('Loan', backref='borrower', lazy='dynamic')
    withdrawals = db.relationship('Withdrawal', backref='user', lazy='dynamic')
    
    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')
    
    @password.setter
    def password(self, password):
        """Automatically hashes password when set"""
        self.password_hash = self.generate_password_hash(password)
    
    @staticmethod
    def generate_password_hash(password):
        """Static method for password hashing"""
        return generate_password_hash(password)
    
    def check_password(self, password):
        """Verify password against stored hash"""
        return check_password_hash(self.password_hash, password)
    
    @staticmethod
    def validate_phone(phone_number):
        """Validate phone number format"""
        pattern = r'^\+?[0-9]{10,15}$'  # Basic international format
        if not re.match(pattern, phone_number):
            raise ValueError(f"Invalid phone number format: {phone_number}")
        return True
    
    def to_dict(self):
        """Serialize user object to dictionary"""
        return {
            'id': self.user_id,
            'name': self.name,
            'email': self.email,
            'phone_number': self.phone_number,
            'role': self.role_name(),
            'account_status': self.account_status.value if self.account_status else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def role_name(self):
        """Get string representation of role"""
        return self.role.name.lower() if self.role else 'user'
    
    def is_admin(self):
        """Check if user has admin privileges"""
        return self.role == Useroles.ADMIN
    
    @classmethod
    def create_admin(cls, username, email, password):
        """Factory method for creating admin users"""
        return cls(
            username=username,
            email=email,
            password=password,
            role=Useroles.ADMIN
        )
    
    @classmethod
    def create_user(cls, username, phone_number, password):
        """Factory method for creating regular users"""
        return cls(
            username=username,
            phone_number=phone_number,
            password=password,
            role=Useroles.USER
        )