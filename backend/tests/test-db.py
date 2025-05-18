@app.route('/test-db')
def test_db():
    try:
        with app.app_context():
            result = db.session.execute("SELECT version()").scalar()
        return jsonify({"database_version": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

