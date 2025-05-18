from flask import Flask, session
from flask_session import Session
from flask_caching import Cache
import redis

app = Flask(__name__)

# ✅ Set a SECRET_KEY (Necessary for Flask-Session)
app.config["SECRET_KEY"] = "your_super_secret_key_here"

# ✅ Redis Caching Configuration
app.config["CACHE_TYPE"] = "RedisCache"
app.config["CACHE_REDIS_URL"] = "redis://localhost:6379/0"
cache = Cache(app)

# ✅ Redis Session Configuration
app.config["SESSION_TYPE"] = "redis"
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_USE_SIGNER"] = True
app.config["SESSION_KEY_PREFIX"] = "myapp:"
app.config["SESSION_REDIS"] = redis.Redis(host="localhost", port=6379)

Session(app)

@app.route("/")
@cache.cached(timeout=60)  # ✅ Cache this response for 60 seconds
def index():
    session["user"] = "Hello"
    return f"Session stored: {session['user']}"

if __name__ == "__main__":
    app.run()