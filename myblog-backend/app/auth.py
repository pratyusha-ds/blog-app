
from authlib.jose import jwt
import datetime
from datetime import timedelta 
import time

JWT_SECRET = "super-secret-key"
JWT_ALGORITHM = "HS256"

def generate_token(user_id):
    header = {"alg": JWT_ALGORITHM}
    payload = {
        "sub": user_id,
        "iat": int(time.time()), 
        "exp": int(time.time()) + 3600 
    }
    token = jwt.encode(header, payload, JWT_SECRET)
    return token.decode("utf-8") if isinstance(token, bytes) else token

def decode_token(token):
    print(f"Backend: Attempting to decode token: {token[:30]}...")
    try:
        claims = jwt.decode(token, JWT_SECRET)
        claims.validate_exp(now=int(time.time()), leeway=1) 
        return claims["sub"]
    except Exception as e:
        raise 