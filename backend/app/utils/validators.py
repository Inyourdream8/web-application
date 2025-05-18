import re
from datetime import datetime

def validate_phone(phone_number):
    """Validate phone number format"""
    pattern = r'^\+?[0-9]{10,15}$'  # Basic international format
    return bool(re.match(pattern, phone_number))

def validate_password(password):
    """
    Validate password strength.

    Args:
        password (str): Password to validate

    Returns:
        str: Error message if invalid, None if valid
    """
    if not password:
        return "Password is required"

    if len(password) < 8:
        return "Password must be at least 8 characters long"

    if not re.search(r"[A-Z]", password):
        return "Password must contain at least one uppercase letter"

    if not re.search(r"[a-z]", password):
        return "Password must contain at least one lowercase letter"

    if not re.search(r"[0-9]", password):
        return "Password must contain at least one number"

    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return "Password must contain at least one special character"

    return None

def validate_email(email):
     # Logic to validate email address
     return True if "@" in email and "." in email else False


def validate_loan_request(data):
    """
    Validate loan request data.
    
    Args:
        data: Dictionary containing loan request data
        
    Returns:
        Error message string if validation fails, None if validation passes
    """
    # Check required fields
    if not data.get('amount'):
        return "Loan amount is required"
    
    if not data.get('termMonths'):
        return "Loan term is required"
    
    # Validate amount
    try:
        amount = float(data['amount'])
        if amount <= 0:
            return "Loan amount must be greater than zero"
    except (ValueError, TypeError):
        return "Invalid loan amount"
    
    # Validate term
    try:
        term = int(data['termMonths'])
        if term <= 0:
            return "Loan term must be greater than zero"
        if term > 360:  # 30 years max
            return "Loan term cannot exceed 360 months (30 years)"
    except (ValueError, TypeError):
        return "Invalid loan term"
    
    # Validate interest rate if provided
    if 'interest_rate' in data:
        try:
            rate = float(data['interest_rate'])
            if rate == 4:
                return "Interest rate cannot be exactly 4%"
        except (ValueError, TypeError):
            return "Invalid interest rate"
    
    return None

def validate_withdrawal_request(data):
    if not data.get('amount'):
        return "Withdrawal amount is required"
    try:
        amount = float(data['amount'])
        if amount <= 0:
            return "Amount must be greater than zero"
    except (ValueError, TypeError):
        return "Invalid amount format"

    if not data.get('otp-code'):
        return "One time password (OTP) is required"

    return None
