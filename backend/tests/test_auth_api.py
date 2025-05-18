import unittest
import json
from app import create_app, db
from app.models.user import User

class TestAuthAPI(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
        self.client = self.app.test_client()
        
        # Create a test user
        test_user = User(username='existing_user', email='existing@example.com')
        test_user.password = 'Password123'
        db.session.add(test_user)
        db.session.commit()
    
    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
    
    def test_register_user(self):
        response = self.client.post(
            '/api/auth/register',
            data=json.dumps({
                'username': 'newuser',
                'email': 'newuser@example.com',
                'password': 'Password123'
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data['message'], 'User registered successfully')
        
        # Verify user was created in the database
        user = User.query.filter_by(username='newuser').first()
        self.assertIsNotNone(user)
        self.assertEqual(user.email, 'newuser@example.com')
    
    def test_login_user(self):
        # Login with existing user
        response = self.client.post(
            '/api/auth/login',
            data=json.dumps({
                'username': 'existing_user',
                'password': 'Password123'
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('access_token', data)
        self.assertIn('refresh_token', data)
        self.assertIn('user', data)
        self.assertEqual(data['user']['username'], 'existing_user')
    
    def test_login_invalid_credentials(self):
        # Login with wrong password
        response = self.client.post(
            '/api/auth/login',
            data=json.dumps({
                'username': 'existing_user',
                'password': 'WrongPassword'
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 401)
        data = json.loads(response.data)
        self.assertEqual(data['message'], 'Invalid username or password')
    
    def test_get_user_profile(self):
        # First login to get a token
        login_response = self.client.post(
            '/api/auth/login',
            data=json.dumps({
                'username': 'existing_user',
                'password': 'Password123'
            }),
            content_type='application/json'
        )
        
        token = json.loads(login_response.data)['access_token']
        
        # Use token to access profile
        response = self.client.get(
            '/api/auth/me',
            headers={'Authorization': f'Bearer {token}'}
        )
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['username'], 'existing_user')
        self.assertEqual(data['email'], 'existing@example.com')

if __name__ == '__main__':
    unittest.main()