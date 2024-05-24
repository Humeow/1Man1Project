import hashlib


class hash_class:
    def __init__(self):
        self.hash_count = 2

    def hash_make(self, text):
        for x in range(self.hash_count):
            result = hashlib.sha256(text.encode())
            text = result.hexdigest()

        return text

    def hash_compare(self, text, hash_text):

        for x in range(self.hash_count):
            result = hashlib.sha256(text.encode())
            text = result.hexdigest()

        if text == hash_text:
            return True

        return False


hasher = hash_class()

if __name__ == '__main__':
    print(hasher.hash_make(''))
    pass
