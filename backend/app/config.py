import os
import logging
from datetime import timedelta
from dotenv import load_dotenv
import redis
from logging.handlers import RotatingFileHandler

# Load environment variables once
load_dotenv()

class Config:
    """Base configuration with enhanced security and Redis support."""
    
    # Core Settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'inyourdream-secret-key')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'inyourdream-jwt-secret-key')
    ENCRYPTION_KEY = os.getenv('ENCRYPTION_KEY', 'inyourdream-encryption-key')
    AUTH_TOKEN = os.getenv('AUTH_TOKEN', 'inyourdream-secret-key')
    MCP_SERVER_URL = os.getenv('MCP_SERVER_URL', 'http://localhost:3025')
    
    # Flask Settings
    FLASK_HOST = os.getenv('FLASK_HOST', '0.0.0.0')
    FLASK_PORT = int(os.getenv('FLASK_PORT', 5000))
    FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
    FLASK_CONFIG = os.getenv('FLASK_CONFIG', 'development')
    
    # Database Configuration
    SQLALCHEMY_DATABASE_URI = os.getenv('SQLALCHEMY_DATABASE_URI', 
                                      'postgresql://postgres:postgres@localhost:5432/lendwise_db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,
        'pool_recycle': 3600,
        'pool_pre_ping': True
    }
    
    # JWT Settings
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Security Settings
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB upload limit
    SSL_REDIRECT = os.getenv('SSL_REDIRECT', 'false').lower() == 'true'
    
    # CORS Configuration
    ALLOWED_ORIGINS = [origin.strip() for origin in 
                       os.getenv('ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173').split(',') 
                       if origin.strip()]
    
    # Rate Limiting
    RATELIMIT_DEFAULT = os.getenv('RATELIMIT_DEFAULT', '100/hour')
    RATELIMIT_HEADERS_ENABLED = os.getenv('RATELIMIT_HEADERS_ENABLED', 'true').lower() == 'true'
    
    # Redis Configuration
    REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
    REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
    REDIS_DB = int(os.getenv('REDIS_DB', 0))
    
    @property
    def REDIS_URL(self):
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
    
    # Session Management
    SESSION_TYPE = "redis"
    SESSION_PERMANENT = False
    SESSION_USE_SIGNER = True
    SESSION_KEY_PREFIX = "session:"
    SESSION_REDIS = redis.Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        db=REDIS_DB,
        decode_responses=True
    )
    
    # Cache Configuration
    CACHE_TYPE = "RedisCache"
    CACHE_REDIS_URL = REDIS_URL
    CACHE_DEFAULT_TIMEOUT = 300  # 5 minutes

    def __init__(self):
        """Initialize configuration with validation."""
        self.validate()
        
    def validate(self):
        """Validate configuration values."""
        if not self.SECRET_KEY or len(self.SECRET_KEY) < 16:
            raise ValueError("SECRET_KEY must be at least 16 characters")
        if not self.SQLALCHEMY_DATABASE_URI.startswith(('postgresql://', 'sqlite://')):
            raise ValueError("Invalid database URI format")
        if not all([self.JWT_SECRET_KEY, self.ENCRYPTION_KEY]):
            raise ValueError("Security keys must be set")

class DevelopmentConfig(Config):
    """Development-specific configuration."""
    DEBUG = True
    FLASK_DEBUG = True
    SQLALCHEMY_ECHO = True
    
    def __init__(self):
        super().__init__()
        # Development-specific overrides
        self.JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

class TestingConfig(Config):
    """Testing configuration with fast-expiring tokens."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(seconds=5)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(seconds=10)

class ProductionConfig(Config):
    """Production configuration with enhanced security."""
    FLASK_DEBUG = False
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PREFERRED_URL_SCHEME = 'https'
    
    def __init__(self):
        super().__init__()
        self.init_logging()
        
    def init_logging(self):
        """Configure production logging."""
        os.makedirs('logs', exist_ok=True)
        file_handler = RotatingFileHandler(
            'logs/app.log',
            maxBytes=1024 * 1024 * 10,  # 10MB
            backupCount=5,
            encoding='utf-8'
        )
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        logging.getLogger().addHandler(file_handler)

def get_config(config_name=None):
    """
    Retrieve appropriate configuration class.
    Defaults to FLASK_CONFIG or development.
    """
    config_name = config_name or os.getenv('FLASK_CONFIG', 'development')
    config_mapping = {
        'development': DevelopmentConfig,
        'testing': TestingConfig,
        'production': ProductionConfig
    }
    return config_mapping.get(config_name.lower(), DevelopmentConfig)()

# Initialize configuration
config = get_config()

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if config.FLASK_DEBUG else logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        RotatingFileHandler('logs/app.log', maxBytes=1000000, backupCount=3) 
        if config.FLASK_CONFIG == 'production' else logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)