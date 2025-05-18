def transform_loan_data(raw_data):
    loans = []
    for data in raw_data:
        loan = {
            "account_status": data["account_status"],
            "withdrawal_status": data["withdrawal_status"],
            "termMonths": data["termMonths"],
            "due_date": data["due_date"],
            "loan_status": data["loan_status"],
            "application_date": data.get("application_date"),
            "amount": 0,
            "interest_rate": 0,
            "term": data["termMonths"],
            "start_date": "",
            "monthly_payment": 0,
            "remaining_balance": 0,
        }
        loans.append(loan)
    return loans