import pytest
from concurrent.futures import ThreadPoolExecutor, as_completed
import time
from app.models.loan import Loan
from app.models.user import User

@pytest.mark.performance
def test_api_response_times(client, auth_headers, performance_threshold):
    """Test API endpoint response times under normal conditions."""
    endpoints = [
        ('GET', '/api/loans'),
        ('GET', '/api/account/transactions'),
        ('GET', '/api/admin/dashboard/stats'),
        ('GET', '/api/account/balance')
    ]
    
    for method, endpoint in endpoints:
        start_time = time.time()
        response = client.open(endpoint, method=method, headers=auth_headers)
        duration = (time.time() - start_time) * 1000  # Convert to milliseconds
        
        assert response.status_code in (200, 201)
        assert duration < performance_threshold['api_response_time']

@pytest.mark.performance
def test_database_query_performance(client, auth_headers, db_session, performance_threshold):
    """Test database query performance with complex joins."""
    # Create test data
    user = User.query.first()
    
    start_time = time.time()
    loans = Loan.query.join(User).filter(
        User.id == user.id
    ).all()
    duration = (time.time() - start_time) * 1000
    
    assert duration < performance_threshold['database_query_time']

@pytest.mark.load_test
def test_concurrent_api_requests(client, auth_headers, load_test_data, performance_threshold):
    """Test API performance under concurrent load."""
    num_requests = performance_threshold['concurrent_requests']
    
    def make_request():
        return client.get('/api/loans', headers=auth_headers)
    
    start_time = time.time()
    with ThreadPoolExecutor(max_workers=10) as executor:
        future_to_request = {
            executor.submit(make_request): i 
            for i in range(num_requests)
        }
        
        for future in as_completed(future_to_request):
            response = future.result()
            assert response.status_code == 200
    
    total_duration = (time.time() - start_time) * 1000
    avg_duration = total_duration / num_requests
    
    assert avg_duration < performance_threshold['api_response_time']

@pytest.mark.performance
def test_loan_creation_performance(client, auth_headers, db_session, performance_threshold):
    """Test loan creation performance with data validation."""
    loan_data = {
        'amount': 5000.00,
        'duration_months': 12,
        'purpose': 'Business expansion',
        'income': 4000.00,
        'employment_type': 'Full-time'
    }
    
    start_time = time.time()
    response = client.post(
        '/api/loans/apply',
        headers=auth_headers,
        json=loan_data
    )
    duration = (time.time() - start_time) * 1000
    
    assert response.status_code == 201
    assert duration < performance_threshold['api_response_time']

@pytest.mark.performance
def test_memory_usage(client, auth_headers, db_session, performance_threshold):
    """Test memory usage during data-intensive operations."""
    import psutil
    import os
    
    process = psutil.Process(os.getpid())
    initial_memory = process.memory_info().rss / 1024 / 1024  # Convert to MB
    
    # Perform memory-intensive operation
    response = client.get('/api/admin/dashboard/stats', headers=auth_headers)
    assert response.status_code == 200
    
    final_memory = process.memory_info().rss / 1024 / 1024
    memory_increase = final_memory - initial_memory
    
    assert memory_increase < performance_threshold['memory_increase']

@pytest.mark.performance
def test_redis_cache_performance(client, auth_headers, mock_redis, performance_threshold):
    """Test Redis caching performance."""
    # First request - uncached
    start_time = time.time()
    response1 = client.get('/api/account/balance', headers=auth_headers)
    uncached_duration = (time.time() - start_time) * 1000
    
    # Second request - should be cached
    start_time = time.time()
    response2 = client.get('/api/account/balance', headers=auth_headers)
    cached_duration = (time.time() - start_time) * 1000
    
    assert response1.status_code == response2.status_code == 200
    assert cached_duration < uncached_duration * 0.5  # Cached should be 50% faster

@pytest.mark.load_test
def test_bulk_data_processing(client, auth_headers, load_test_data, performance_threshold):
    """Test performance of bulk data processing operations."""
    # Test bulk loan approval
    loan_ids = [loan.id for loan in Loan.query.limit(50)]
    
    start_time = time.time()
    response = client.post(
        '/api/admin/loans/bulk-approve',
        headers=auth_headers,
        json={'loan_ids': loan_ids}
    )
    duration = (time.time() - start_time) * 1000
    
    assert response.status_code == 200
    assert duration < performance_threshold['api_response_time'] * 2  # Allow double time for bulk operation

@pytest.mark.performance
def test_file_upload_performance(client, auth_headers, mock_google_drive, performance_threshold):
    """Test file upload performance with Google Drive integration."""
    import io
    
    # Create dummy file (1MB)
    file_content = b'0' * (1024 * 1024)
    file = io.BytesIO(file_content)
    
    start_time = time.time()
    response = client.post(
        '/api/loans/1/documents',
        headers=auth_headers,
        data={
            'file': (file, 'test.pdf'),
            'document_type': 'income_proof'
        }
    )
    duration = (time.time() - start_time) * 1000
    
    assert response.status_code == 200
    assert duration < performance_threshold['api_response_time'] * 3  # Allow triple time for file upload