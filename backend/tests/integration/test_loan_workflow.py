import pytest
from app.models.loan import Loan
from app.models.loanprogresssteps import LoanProgressSteps
from decimal import Decimal
import json

def test_complete_loan_workflow(client, test_user, auth_headers, mock_redis, mock_google_drive):
    """Test the complete loan application workflow."""
    
    # Step 1: Create loan application
    loan_data = {
        'amount': 5000.00,
        'duration_months': 12,
        'purpose': 'Business expansion',
        'income': 4000.00,
        'employment_type': 'Full-time'
    }
    
    response = client.post(
        '/api/loans/apply',
        headers=auth_headers,
        json=loan_data
    )
    assert response.status_code == 201
    loan_id = response.get_json()['loan_id']
    
    # Step 2: Upload required documents
    mock_google_drive.create.return_value = {'id': 'mock_file_id'}
    
    doc_response = client.post(
        f'/api/loans/{loan_id}/documents',
        headers={**auth_headers, 'Content-Type': 'multipart/form-data'},
        data={
            'document_type': 'income_proof',
            'file': (b'dummy file content', 'payslip.pdf')
        }
    )
    assert doc_response.status_code == 200
    
    # Step 3: Verify loan status updates
    status_response = client.get(
        f'/api/loans/{loan_id}/status',
        headers=auth_headers
    )
    assert status_response.status_code == 200
    assert status_response.get_json()['status'] == 'documents_submitted'
    
    # Step 4: Mock admin approval
    with client.application.app_context():
        loan = Loan.query.get(loan_id)
        loan.status = 'approved'
        loan.approved_amount = Decimal('5000.00')
        db.session.commit()
    
    # Step 5: Check loan agreement generation
    agreement_response = client.get(
        f'/api/loans/{loan_id}/agreement',
        headers=auth_headers
    )
    assert agreement_response.status_code == 200
    assert 'agreement_text' in agreement_response.get_json()
    
    # Step 6: Accept loan agreement
    accept_response = client.post(
        f'/api/loans/{loan_id}/accept',
        headers=auth_headers
    )
    assert accept_response.status_code == 200
    
    # Step 7: Verify disbursement process
    disbursement_response = client.get(
        f'/api/loans/{loan_id}/disbursement',
        headers=auth_headers
    )
    assert disbursement_response.status_code == 200
    assert disbursement_response.get_json()['status'] == 'disbursed'

def test_loan_validation_rules(client, auth_headers):
    """Test loan application validation rules."""
    
    invalid_cases = [
        {
            'amount': 0,  # Invalid: Zero amount
            'duration_months': 12,
            'purpose': 'Test'
        },
        {
            'amount': 5000,
            'duration_months': 0,  # Invalid: Zero duration
            'purpose': 'Test'
        },
        {
            'amount': 5000,
            'duration_months': 12,
            'purpose': ''  # Invalid: Empty purpose
        },
        {
            'amount': 1000000,  # Invalid: Exceeds maximum
            'duration_months': 12,
            'purpose': 'Test'
        }
    ]
    
    for test_case in invalid_cases:
        response = client.post(
            '/api/loans/apply',
            headers=auth_headers,
            json=test_case
        )
        assert response.status_code == 400

def test_loan_status_transitions(client, auth_headers, test_user):
    """Test valid and invalid loan status transitions."""
    
    # Create initial loan
    loan_data = {
        'amount': 5000.00,
        'duration_months': 12,
        'purpose': 'Test loan'
    }
    
    response = client.post(
        '/api/loans/apply',
        headers=auth_headers,
        json=loan_data
    )
    loan_id = response.get_json()['loan_id']
    
    # Test invalid status transition
    with client.application.app_context():
        loan = Loan.query.get(loan_id)
        
        # Cannot transition from applied directly to disbursed
        with pytest.raises(ValueError):
            loan.status = 'disbursed'
            db.session.commit()
            
def test_concurrent_loan_applications(client, auth_headers):
    """Test handling of concurrent loan applications."""
    
    # Create first loan
    first_loan = client.post(
        '/api/loans/apply',
        headers=auth_headers,
        json={
            'amount': 5000.00,
            'duration_months': 12,
            'purpose': 'First loan'
        }
    )
    assert first_loan.status_code == 201
    
    # Attempt second loan while first is active
    second_loan = client.post(
        '/api/loans/apply',
        headers=auth_headers,
        json={
            'amount': 3000.00,
            'duration_months': 6,
            'purpose': 'Second loan'
        }
    )
    assert second_loan.status_code == 400  # Should prevent multiple active loans