import unittest
from app import create_app, db
from app.models.user import User

class TestUserModel(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
    
    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
    
    def test_password_setter(self):
        u = User(username='test_user', email='test@example.com')
        u.password = 'Password123'
        self.assertTrue(u.password_hash is not None)
    
    def test_no_password_getter(self):
        u = User(username='test_user', email='test@example.com')
        u.password = 'Password123'
        with self.assertRaises(AttributeError):
            u.password
    
    def test_password_verification(self):
        u = User(username='test_user', email='test@example.com')
        u.password = 'Password123'
        self.assertTrue(u.verify_password('Password123'))
        self.assertFalse(u.verify_password('wrong_password'))
    
    def test_user_to_dict(self):
        u = User(username='test_user', email='test@example.com')
        u.password = 'Password123'
        db.session.add(u)
        db.session.commit()
        
        user_dict = u.to_dict()
        self.assertEqual(user_dict['username'], 'test_user')
        self.assertEqual(user_dict['email'], 'test@example.com')
        self.assertTrue('password_hash' not in user_dict)

if __name__ == '__main__':
    unittest.main()