# backend/api/urls.py
from django.urls import path

from .views import MyProfileAPIView,MyProfileUpdateAPIView, ProfileByUsernameAPIView, RegisterAPIView, PostListCreateAPIView, PostRetrieveUpdateDestroyAPIView, CommentCreateAPIView, CommentListAPIView, ToggleDisLikeAPIView, ToggleLikeAPIView, CustomTokenObtainPairView, UserPostsAPIView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # profile urls
    path('profile/me/', MyProfileAPIView.as_view(), name='profile-me'),
    path('profile/me/update/', MyProfileUpdateAPIView.as_view(), name='profile-me-update'),
    path('profile/<str:username>/', ProfileByUsernameAPIView.as_view(), name='profile-username'),
    
    path('posts/', PostListCreateAPIView.as_view(), name='posts-list-create'),
    path('posts/me/', UserPostsAPIView.as_view(), name='user-posts'),
    path('posts/<int:pk>/', PostRetrieveUpdateDestroyAPIView.as_view(), name='post-detail'),
    path('posts/<int:post_id>/comments/', CommentListAPIView.as_view(), name='post-comments'),
    path('posts/<int:post_id>/comments/create/', CommentCreateAPIView.as_view(), name='comment-create'),
    path('posts/<int:post_id>/like-toggle/', ToggleLikeAPIView.as_view(), name='like-toggle'),
    path('posts/<int:post_id>/dislike-toggle/', ToggleDisLikeAPIView.as_view(), name='dislike-toggle'),
]


# urlpatterns = [
#     # auth
#     path('register/', RegisterAPIView.as_view(), name='register'),
#     path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),  # returns access & refresh
#     path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

#     # profile
#     path('profile/me/', MyProfileAPIView.as_view(), name='profile-me'),
#     path('profile/<str:username>/', ProfileByUsernameAPIView.as_view(), name='profile-username'),

#     # posts
#     path('posts/', PostListCreateAPIView.as_view(), name='posts-list-create'),
#     path('posts/<int:pk>/', PostRetrieveUpdateDestroyAPIView.as_view(), name='post-detail'),

#     # comments
#     path('posts/<int:post_id>/comments/', CommentListAPIView.as_view(), name='post-comments'),
#     path('posts/<int:post_id>/comments/create/', CommentCreateAPIView.as_view(), name='comment-create'),

#     # likes
#     path('posts/<int:post_id>/like-toggle/', ToggleLikeAPIView.as_view(), name='like-toggle'),
# ]
