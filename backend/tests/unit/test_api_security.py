import pytest
from time import sleep
from flask import current_app

def test_rate_limiting(client, auth_headers):
    """Test rate limiting on API endpoints."""
    # Test rapid requests to rate-limited endpoint
    responses = []
    for _ in range(6):  # Assuming limit is 5 requests per minute
        response = client.get('/api/auth/me', headers=auth_headers)
        responses.append(response.status_code)
    
    assert 429 in responses  # Should get 429 Too Many Requests
    assert responses.count(200) == 5  # First 5 should succeed

def test_token_expiry(client, auth_headers, test_user):
    """Test JWT token expiration."""
    # Wait for token to expire (configured for 5 seconds in testing)
    sleep(6)
    response = client.get('/api/auth/me', headers=auth_headers)
    assert response.status_code == 401

def test_invalid_token(client):
    """Test invalid token handling."""
    headers = {'Authorization': 'Bearer invalid-token'}
    response = client.get('/api/auth/me', headers=headers)
    assert response.status_code == 401

def test_missing_token(client):
    """Test missing token handling."""
    response = client.get('/api/auth/me')
    assert response.status_code == 401

def test_sql_injection_prevention(client):
    """Test SQL injection prevention."""
    malicious_payload = {
        'username': "' OR '1'='1",
        'password': "' OR '1'='1"
    }
    response = client.post('/api/auth/login', json=malicious_payload)
    assert response.status_code == 401

def test_xss_prevention(client, auth_headers):
    """Test XSS prevention in API responses."""
    malicious_data = {
        'username': '<script>alert("xss")</script>',
        'email': 'test@example.com'
    }
    response = client.post('/api/auth/register', json=malicious_data)
    assert '<script>' not in response.get_data(as_text=True)

def test_cors_headers(client):
    """Test CORS headers are properly set."""
    response = client.options('/api/auth/login')
    assert 'Access-Control-Allow-Origin' in response.headers
    
def test_content_security_policy(client):
    """Test Content Security Policy headers."""
    response = client.get('/')
    assert 'Content-Security-Policy' in response.headers

def test_ssl_redirect(client):
    """Test SSL redirect in production config."""
    app = create_app('production')
    test_client = app.test_client()
    response = test_client.get('/', base_url='http://localhost')
    assert response.status_code == 301  # Should redirect to HTTPS

def test_password_complexity(client):
    """Test password complexity requirements."""
    weak_passwords = [
        'short',  # Too short
        'onlylowercase',  # No uppercase or numbers
        'ONLYUPPERCASE',  # No lowercase or numbers
        '12345678',  # Only numbers
    ]
    
    for password in weak_passwords:
        response = client.post('/api/auth/register', json={
            'username': 'testuser',
            'email': 'test@example.com',
            'password': password
        })
        assert response.status_code == 400  # Should reject weak passwords