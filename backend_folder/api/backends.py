from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        try:
            if username is None:
                username = kwargs.get(UserModel.USERNAME_FIELD)
            if '@' in username:
                # If username contains @, treat it as an email
                user = UserModel.objects.get(email=username.lower())
            else:
                # Otherwise, treat it as a username
                user = UserModel.objects.get(username=username)
            if user.check_password(password):
                return user
        except UserModel.DoesNotExist:
            return None
        return None