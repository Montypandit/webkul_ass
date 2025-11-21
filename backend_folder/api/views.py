
from rest_framework import generics, permissions, status, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Dislike, Profile, Post, Comment, Like
from .serializers import (
    RegisterSerializer, ProfileSerializer,
    PostSerializer, CommentSerializer
)


# Custom token serializer that accepts email instead of username
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # Tell parent serializer to use 'email' as the username field
    username_field = 'email'
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email', '').lower()
        password = attrs.get('password', '')

        if not email or not password:
            raise serializers.ValidationError({"error": "Both email and password are required."})

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"error": "No account found with this email."})

        if not user.check_password(password):
            raise serializers.ValidationError({"error": "Invalid password."})

        if not user.is_active:
            raise serializers.ValidationError({"error": "This account is inactive."})

        # Generate tokens manually (do NOT call super().validate)
        refresh = self.get_token(user)
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            }
        }
        print("Token generation data:", data)  # Debug print
        return data

# Custom token view that uses our custom serializer
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# Registration view (uses RegisterSerializer)
class RegisterAPIView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]  # to accept file uploads

    def post(self, request, *args, **kwargs):
        print("Received POST data:", request.data)  # Debug print
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("Validation errors:", serializer.errors)  # Debug print
            return Response(
                {
                    "status": "error",
                    "message": "Invalid data provided",
                    "errors": serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            self.perform_create(serializer)
            return Response(
                {
                    "status": "success",
                    "message": "Registration successful",
                    "data": serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            print("Registration error:", str(e))  # Debug print
            return Response(
                {
                    "status": "error",
                    "message": "Registration failed",
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

# for fetching and updating logged-in user's profile
class MyProfileAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        return profile

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
    
# for fetching profile by username
class ProfileByUsernameAPIView(generics.RetrieveAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        username = self.kwargs.get('username')
        user = generics.get_object_or_404(User, username=username)
        profile, created = Profile.objects.get_or_create(user=user)
        return profile
    
# update profile
# class MyProfileUpdateAPIView(generics.UpdateAPIView):
#     serializer_class = ProfileSerializer
#     permission_classes = [permissions.IsAuthenticated]
#     parser_classes = [MultiPartParser, FormParser]

#     def get_object(self):
#         profile, created = Profile.objects.get_or_create(user=self.request.user)
#         return profile

class MyProfileUpdateAPIView(generics.UpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        return profile
    
    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)


# Posts list/create and detail view
class PostListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Post.objects.select_related('user').all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# Get only the current user's posts
class UserPostsAPIView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Post.objects.filter(user=self.request.user).select_related('user').order_by('-created_at')

#
class PostRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_update(self, serializer):
        # ensure only author can update
        post = self.get_object()
        if post.user != self.request.user:
            raise permissions.PermissionDenied("You can't edit this post.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            raise permissions.PermissionDenied("You can't delete this post.")
            # Custom token view that uses our custom serializer
        instance.delete()

# Comments
class CommentCreateAPIView(generics.CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        post_id = self.request.data.get('post')
        serializer.save(user=self.request.user, post_id=post_id)

class CommentListAPIView(generics.ListAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        post_id = self.kwargs.get('post_id')
        return Comment.objects.filter(post_id=post_id).select_related('user').all()

# Like toggle
class ToggleLikeAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, post_id):
        post = Post.objects.get(id=post_id)
        like, created = Like.objects.get_or_create(post=post, user=request.user)
        if not created:
            # already liked -> remove like
            like.delete()
            return Response({'liked': False, 'likes_count': post.likes.count()})
        return Response({'liked': True, 'likes_count': post.likes.count()})


class ToggleDisLikeAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, post_id):
        post = Post.objects.get(id=post_id)
        dislike, created = Dislike.objects.get_or_create(post=post, user=request.user)
        if not created:
            # already disliked -> remove dislike
            dislike.delete()
            return Response({'disliked': False, 'dislikes_count': post.dislikes.count()})
        return Response({'disliked': True, 'dislikes_count': post.dislikes.count()})
