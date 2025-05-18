import unittest
from flask import current_app
from app import create_app, db

class TestConfig(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
    
    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
    
    def test_app_exists(self):
        self.assertIsNotNone(current_app)
    
    def test_app_is_testing(self):
        self.assertTrue(current_app.config['TESTING'])
        
    def test_database_uri_is_test_db(self):
        self.assertTrue('test.db' in current_app.config['SQLALCHEMY_DATABASE_URI'])

if __name__ == '__main__':
    unittest.main()