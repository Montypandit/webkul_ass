# backend/api/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from .models import Profile, Post, Comment, Like
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if not email or not password:
            raise serializers.ValidationError('Both email and password are required.')

        # Find user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError('No account found with this email.')

        if not user.check_password(password):
            raise serializers.ValidationError('Invalid password.')

        attrs['username'] = user.username  # Set username for parent class
        data = super().validate(attrs)

        # Add custom claims
        token = self.get_token(user)
        token['email'] = user.email  # Add email to token claims
        token['username'] = user.username
        token['id'] = user.id

        data['access'] = str(token.access_token)
        data['refresh'] = str(token)
        data['user'] = {
            'id': user.id,
            'email': user.email,
            'username': user.username
        }
        return data

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Profile
        fields = ['id', 'user', 'full_name', 'dob', 'profile_picture']
        extra_kwargs = {
    'full_name': {'required': False},
    'dob': {'required': False},
}




class RegisterSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(
        write_only=True,
        error_messages={'required': 'Please enter your full name'}
    )
    email = serializers.EmailField(
        required=True,
        error_messages={
            'required': 'Please enter your email address',
            'invalid': 'Please enter a valid email address'
        }
    )
    password = serializers.CharField(
        write_only=True,
        min_length=6,
        error_messages={
            'required': 'Please enter a password',
            'min_length': 'Password must be at least 6 characters long'
        }
    )
    date_of_birth = serializers.DateField(
        source='dob',
        write_only=True,
        error_messages={'required': 'Please enter your date of birth'},
        input_formats=['%Y-%m-%d', '%d-%m-%Y', '%d/%m/%Y']  # Add more flexible date formats
    )
    profile_picture = serializers.ImageField(
        write_only=True,
        required=False,
        allow_null=True,
        error_messages={'invalid': 'Please upload a valid image file'}
    )

    def to_internal_value(self, data):
        # Print the received data for debugging
        print("Received registration data:", data)
        return super().to_internal_value(data)

    class Meta:
        model = User
        fields = ['id', 'email', 'password', 'full_name', 'date_of_birth', 'profile_picture']

    def validate_email(self, value):
        value = value.lower()  # Normalize email to lowercase
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered. Please use a different email or login.")
        return value

    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters long.")
        return value

    def create(self, validated_data):
        full_name = validated_data.pop('full_name')
        dob = validated_data.pop('dob')
        profile_picture = validated_data.pop('profile_picture', None)
        email = validated_data['email']
        password = validated_data.pop('password')
        # Username is always the email
        user = User.objects.create(
            username=email,
            email=email,
            password=make_password(password)
        )
        Profile.objects.create(
            user=user,
            full_name=full_name,
            dob=dob,
            profile_picture=profile_picture
        )
        return user

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Comment
        fields = ['id','post','user','text','created_at']
        read_only_fields = ['id','user','created_at']

class PostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    likes_count = serializers.SerializerMethodField()
    dislikes_count = serializers.SerializerMethodField()
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Post
        fields = ['id','user','content','image','created_at','comments','likes_count','dislikes_count']
        read_only_fields = ['id','user','created_at','comments','likes_count','dislikes_count']

    def get_likes_count(self, obj):
        
        return obj.likes.count()

    def get_dislikes_count(self, obj):
        # Check if there's a dislikes relation; if not, return 0
        if hasattr(obj, 'dislikes'):
            return obj.dislikes.count()
        return 0
