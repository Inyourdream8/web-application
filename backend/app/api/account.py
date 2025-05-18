from flask import Flask, jsonify
from flask_cors import CORS
import datetime

app = Flask(__name__)
CORS(app)

@app.route('/api/account', methods=['GET'])
def get_account_data():
    # Mock data - in a real application, this would come from a database
    account_data = {
        'available_balance': 100000,
        'application_number': '123-456-7890',
        'date': 'April 2025',
        'loan_status': 'Approved',
        'description': 'Congratulations! Your loan has been approved.',
        'approvedDate': 'March 25, 2025',
        'approvedBy': 'Financial Department',
        'account_status': 'Activate'
    }
    return jsonify(account_data)

@app.route('/api/loan-details', methods=['GET'])
def get_loan_details():
    # Mock data - in a real application, this would come from a database
    loan_details = {
        'application_number': '******',
        'loan_amount': 100000,
        'loan_term': 48,
        'interest_rate': 4,
        'monthly_payment': 2166.67,
        'firstDueDate': 'April 25, 2025'
    }
    return jsonify(loan_details)

if __name__ == '__main__':
    app.run(debug=True, port=5000)