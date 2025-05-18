import pytest
import time
import psutil
import os
from functools import wraps
from flask import current_app
from app import create_app, db
from app.models.user import User
from app.models.loan import Loan
import redis
from unittest.mock import Mock, patch
from google.oauth2.credentials import Credentials

def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line(
        "markers", "performance: mark test for performance measurement"
    )
    config.addinivalue_line(
        "markers", "load_test: mark test for load testing"
    )

def performance_metrics(f):
    """Decorator to measure performance metrics of tests."""
    @wraps(f)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        start_memory = psutil.Process(os.getpid()).memory_info().rss / 1024 / 1024

        result = f(*args, **kwargs)

        end_time = time.time()
        end_memory = psutil.Process(os.getpid()).memory_info().rss / 1024 / 1024
        
        duration = (end_time - start_time) * 1000  # Convert to milliseconds
        memory_used = end_memory - start_memory

        print(f"\nPerformance metrics for {f.__name__}:")
        print(f"Duration: {duration:.2f}ms")
        print(f"Memory Usage: {memory_used:.2f}MB")

        # Store metrics in test report
        if hasattr(pytest, 'performance_metrics'):
            pytest.performance_metrics.append({
                'test_name': f.__name__,
                'duration_ms': duration,
                'memory_mb': memory_used
            })

        return result
    return wrapper

@pytest.fixture(scope='session')
def app():
    """Create application for the tests."""
    app = create_app('testing')
    return app

@pytest.fixture(scope='session')
def client(app):
    """Get test client for the application."""
    return app.test_client()

@pytest.fixture(scope='function')
def db_session(app):
    """Create database for the tests."""
    with app.app_context():
        db.create_all()
        yield db
        db.session.remove()
        db.drop_all()

@pytest.fixture
def test_user(db_session):
    """Create test user."""
    user = User(
        username='testuser',
        email='test@example.com'
    )
    user.password = 'Test123!'
    db_session.session.add(user)
    db_session.session.commit()
    return user

@pytest.fixture
def auth_headers(test_user, client):
    """Get authentication headers."""
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'Test123!'
    })
    token = response.get_json()['access_token']
    return {'Authorization': f'Bearer {token}'}

@pytest.fixture
def mock_redis():
    """Mock Redis connection."""
    with patch('redis.Redis') as mock:
        mock_client = Mock()
        mock.return_value = mock_client
        yield mock_client

@pytest.fixture
def mock_google_drive():
    """Mock Google Drive API."""
    with patch('googleapiclient.discovery.build') as mock_build:
        mock_service = Mock()
        mock_build.return_value = mock_service
        mock_files = Mock()
        mock_service.files = mock_files
        yield mock_files

@pytest.fixture
def mock_oauth_credentials():
    """Mock OAuth credentials."""
    with patch('google.oauth2.credentials.Credentials') as mock_creds:
        mock_creds.return_value = Mock(spec=Credentials)
        yield mock_creds

@pytest.fixture(scope='session')
def load_test_data(app):
    """Load large dataset for performance testing."""
    with app.app_context():
        db.create_all()
        
        # Create test users
        users = []
        for i in range(100):
            user = User(
                username=f'testuser{i}',
                email=f'test{i}@example.com'
            )
            user.password = 'Test123!'
            users.append(user)
        
        db.session.bulk_save_objects(users)
        db.session.commit()

        # Create test loans
        loans = []
        for user in users:
            for _ in range(5):  # 5 loans per user
                loan = Loan(
                    user_id=user.id,
                    amount=5000.00,
                    duration_months=12,
                    status='applied'
                )
                loans.append(loan)
        
        db.session.bulk_save_objects(loans)
        db.session.commit()

        yield

        db.session.remove()
        db.drop_all()

@pytest.fixture
def performance_threshold():
    """Define performance thresholds."""
    return {
        'api_response_time': 200,  # ms
        'database_query_time': 100,  # ms
        'memory_increase': 50,  # MB
        'concurrent_requests': 50
    }

def pytest_sessionstart(session):
    """Set up performance metrics collection."""
    pytest.performance_metrics = []

def pytest_sessionfinish(session):
    """Generate performance report."""
    if hasattr(pytest, 'performance_metrics'):
        metrics = pytest.performance_metrics
        if metrics:
            total_duration = sum(m['duration_ms'] for m in metrics)
            avg_duration = total_duration / len(metrics)
            max_duration = max(m['duration_ms'] for m in metrics)
            total_memory = sum(m['memory_mb'] for m in metrics)
            avg_memory = total_memory / len(metrics)

            print("\nPerformance Summary:")
            print("===================")
            print(f"Total Tests: {len(metrics)}")
            print(f"Average Duration: {avg_duration:.2f}ms")
            print(f"Max Duration: {max_duration:.2f}ms")
            print(f"Average Memory Usage: {avg_memory:.2f}MB")
            print("\nSlow Tests (>500ms):")
            for metric in metrics:
                if metric['duration_ms'] > 500:
                    print(f"{metric['test_name']}: {metric['duration_ms']:.2f}ms")