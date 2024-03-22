import jwt
import datetime
import os
import random

from dotenv import load_dotenv, find_dotenv

class classTokenizer:
    load_dotenv(find_dotenv())
    def __init__(self):

        self.SECRET_PRE = os.environ.get('SECRET_PRE')
        self.token = ''.join(random.sample('abcdefghijklmnopqrstuvwxyz'
                                           'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
                                           '1234567890-=!@#$%^&*()_+', 15))
        # self.access_expires = datetime.timedelta(hours=2)
        self.access_expires = datetime.timedelta(seconds=10)
        self.refresh_expires = datetime.timedelta(days=14)

    def create_token(self, sub, is_refresh, expires: datetime.timedelta):
        encoded = jwt.encode(
            payload={'exp': datetime.datetime.utcnow() + expires,
                     "iat": datetime.datetime.utcnow(),
                     'sub': sub,
                     'is_refresh': is_refresh},
            key=self.SECRET_PRE + self.token,
            algorithm='HS256')
        return encoded, expires

    def create_access_token(self, email):
        sub = email
        return self.create_token(sub, 0, expires=self.access_expires)

    def create_refresh_token(self, email):
        sub = email + '.refresh'
        return self.create_token(sub, 1, expires=self.refresh_expires)

    def use_refresh_token(self, token):
        token_interpretation = self.validate_token(token)
        if token_interpretation['success']:
            tok = token_interpretation['token']
            print(type(tok))
            if tok['is_refresh']:
                access_token = self.create_access_token(tok['sub'][:-8])  # email input
                return {'success': True, 'access': access_token}

        return {'success': False, 'msg': 'invalid_token'}

    def validate_token(self, token):
        try:
            result = jwt.decode(token, self.SECRET_PRE + self.token, algorithms='HS256')
        except jwt.ExpiredSignatureError:
            return {'success': False, 'msg': 'expired'}
        except jwt.InvalidTokenError:
            return {'success': False, 'msg': 'invalid'}
        else:
            return {'success': True, 'token': result}


tokenizer = classTokenizer()

if __name__ == '__main__':
    from dotenv import load_dotenv, find_dotenv

    load_dotenv(find_dotenv('../.env'))

    cls = classTokenizer()

    token = cls.create_access_token('coodi60419@gmail.com')
    token2 = cls.create_refresh_token('coodi60419@gmail.com')
    print(token)
    print(token2)

    is_validate = cls.validate_token(token)
    is_validate2 = cls.validate_token(token2)
    print(is_validate)
    print(is_validate2)
