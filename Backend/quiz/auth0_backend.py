from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
from jose import jwt
from django.conf import settings
import requests
from quiz.models import User

class Auth0JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        print("AUTH0 AUTH CHECK STARTED")

        auth_header = request.headers.get('Authorization')
        print("Received Authorization Header:", auth_header)

        if not auth_header:
            return None

        parts = auth_header.split()
        if parts[0].lower() != 'bearer' or len(parts) != 2:
            raise exceptions.AuthenticationFailed('Invalid Authorization header.')

        token = parts[1]

        try:
            print("Fetching JWKS...")
            jwks_url = f'https://{settings.AUTH0_DOMAIN}/.well-known/jwks.json'
            jwks = requests.get(jwks_url).json()
            print("JWKS fetched")

            unverified_header = jwt.get_unverified_header(token)
            print("Unverified header:", unverified_header)

            rsa_key = {}
            for key in jwks['keys']:
                if key['kid'] == unverified_header['kid']:
                    rsa_key = {
                        'kty': key['kty'],
                        'kid': key['kid'],
                        'use': key['use'],
                        'n': key['n'],
                        'e': key['e'],
                    }

            if not rsa_key:
                raise exceptions.AuthenticationFailed('Unable to find appropriate key.')

            print("Decoding JWT...")
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=settings.ALGORITHMS,
                audience=settings.API_IDENTIFIER,
                issuer=f"https://{settings.AUTH0_DOMAIN}/"
            )
            print("Token decoded successfully:", payload)

        except Exception as e:
            print("Token validation error:", str(e))
            raise exceptions.AuthenticationFailed(f"Token is invalid: {str(e)}")

        sub = payload.get("sub")
        name = payload.get("name", "Anonymous")
        email = payload.get("email", "")
        nickname = payload.get("nickname", "user")

        # Use sub as username to guarantee uniqueness
        user, _ = User.objects.get_or_create(
            user_id=sub,
            defaults={
                "username": sub,              
                "email": email,
                "first_name": name,
                "role": "manager",           
            }
        )

        return (user, None)
