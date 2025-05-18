# backend/app/models/token.py
from app.models import db
from datetime import datetime


class TokenBlocklist(db.Model):
    """Track revoked JWT tokens"""
    __tablename__ = 'token_blocklist'
    
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)