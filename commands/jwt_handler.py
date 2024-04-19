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
        self.token = ''  # TODO: 실 서비스시에 없애기
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

    def use_refresh_token(self, refresh):
        token_interpretation = self.validate_token(refresh=refresh)
        if token_interpretation['success']:
            tok = token_interpretation['token']
            if tok['is_refresh']:
                access_token = self.create_access_token(tok['sub'][:-8])  # email input
                return {'success': True, 'access': access_token}

        return {'success': False, 'msg': 'invalid_token'}

    def validate_token(self, access='', refresh=''):
        try:
            if access == '':
                result = jwt.decode(refresh, self.SECRET_PRE + self.token, algorithms='HS256')
            else:
                result = jwt.decode(access, self.SECRET_PRE + self.token, algorithms='HS256')
        except jwt.ExpiredSignatureError:
            access_refreshed = tokenizer.use_refresh_token(refresh)

            is_access_valid = tokenizer.validate_token(access_refreshed['access'][0], refresh)  # refreshed token
            if access_refreshed['success']:
                is_access_valid['is_refreshed'] = True
                is_access_valid['new_access'] = access_refreshed['access']
                return is_access_valid

            return {'success': False, 'msg': 'expired'}
        except jwt.InvalidTokenError:
            return {'success': False, 'msg': 'invalid'}
        else:
            return {'success': True, 'token': result, 'is_refreshed': False}




tokenizer = classTokenizer()

if __name__ == '__main__':
    from dotenv import load_dotenv, find_dotenv

    load_dotenv(find_dotenv('../.env'))

    cls = classTokenizer()

    token = cls.create_access_token('coodi60419@gmail.com')
    token2 = cls.create_refresh_token('coodi60419@gmail.com')
    print(token)
    print(token2)

