import os
import hashlib
import base64
from cryptography.fernet import Fernet
from flask import current_app

def generate_salt():
    """Generate a random salt for password hashing."""
    return os.urandom(16)

def hash_data(data, salt=None):
    """
    Hash data with SHA-256 and an optional salt.
    
    Args:
        data: The data to hash
        salt: Optional salt bytes
        
    Returns:
        Tuple of (hash_digest, salt)
    """
    if salt is None:
        salt = generate_salt()
    
    # Convert data to bytes if it's not already
    if isinstance(data, str):
        data = data.encode('utf-8')
    
    # Create a hash with the salt
    h = hashlib.sha256()
    h.update(salt)
    h.update(data)
    
    return h.hexdigest(), salt

def encrypt_sensitive_data(data):
    """
    Encrypt sensitive data using Fernet symmetric encryption.
    
    Args:
        data: String data to encrypt
        
    Returns:
        Encrypted data as a string
    """
    if not data:
        return None
        
    # Get the encryption key from config
    key = current_app.config.get('ENCRYPTION_KEY')
    if not key:
        # Generate a key if not available
        key = Fernet.generate_key()
    
    # Create a Fernet instance
    f = Fernet(key)
    
    # Convert data to bytes if it's not already
    if isinstance(data, str):
        data = data.encode('utf-8')
    
    # Encrypt the data
    encrypted_data = f.encrypt(data)
    
    # Return as base64 string
    return base64.b64encode(encrypted_data).decode('utf-8')

def decrypt_sensitive_data(encrypted_data):
    """
    Decrypt data that was encrypted with encrypt_sensitive_data.
    
    Args:
        encrypted_data: Encrypted data string
        
    Returns:
        Decrypted data as a string
    """
    if not encrypted_data:
        return None
    
    # Get the encryption key from config
    key = current_app.config.get('ENCRYPTION_KEY')
    if not key:
        raise ValueError("Encryption key not found in configuration")
    
    # Create a Fernet instance
    f = Fernet(key)
    
    # Decode from base64 string to bytes
    encrypted_bytes = base64.b64decode(encrypted_data)
    
    # Decrypt the data
    decrypted_data = f.decrypt(encrypted_bytes)
    
    # Return as string
    return decrypted_data.decode('utf-8')

def mask_sensitive_data(data, keep_start=4, keep_end=4):
    """
    Mask sensitive data like credit card numbers or bank accounts.
    
    Args:
        data: String to mask
        keep_start: Number of characters to keep at start
        keep_end: Number of characters to keep at end
        
    Returns:
        Masked string
    """
    if not data or len(data) <= keep_start + keep_end:
        return data
    
    masked_length = len(data) - keep_start - keep_end
    masked_part = '*' * masked_length
    return data[:keep_start] + masked_part + data[-keep_end:]