import React, { useState, useContext, useEffect } from "react";
import { ThumbsUp, ThumbsDown, X, Image as ImageIcon, Edit2, User, Lock, Save, X as XIcon } from "lucide-react";
import AuthContext from "../context/AuthContext";
import axiosInstance from "../config/apiConfig";

export default function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [userProfile, setUserProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [passwordError, setPasswordError] = useState('');

  // Debug: log user data whenever it changes
  useEffect(() => {
    console.log('User from context:', user);
  }, [user]);

  const handlePost = async () => {
    if (content.trim()) {
      try {
        const formData = new FormData();
        formData.append('content', content);
        if (image && image.file) {
          formData.append('image', image.file);
        }

        const response = await axiosInstance.post('/posts/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const newPost = {
          id: response.data.id,
          avatar: user?.email?.charAt(0).toUpperCase() || '?',
          author: userProfile?.name || user?.email,
          content,
          timestamp: `Posted on - ${new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}`,
          image: response.data.image,
          likes: 0,
          dislikes: 0,
        };
        setPosts([newPost, ...posts]);
        setContent("");
        if (image?.preview) {
          URL.revokeObjectURL(image.preview); // Clean up the preview URL
        }
        setImage(null);
      } catch (error) {
        console.error('Error creating post:', error);
      }
    }
  };

    const viewPost = async () => {
    try {
      setLoading(true);
      console.log('Fetching user posts...');
      // Call the /posts/me/ endpoint to get only current user's posts
      const response = await axiosInstance.get('/posts/me/');
      console.log('User posts response:', response.data);
      
      const fetchedPosts = response.data.map((post) => ({
        id: post.id,
        avatar: user?.email?.charAt(0).toUpperCase() || '?',
        author: post.user?.email || user?.email || 'Unknown',
        content: post.content,
        timestamp: `Posted on - ${new Date(post.created_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}`,
        image: post.image,  
        likes: post.likes_count || 0,
        dislikes: post.dislikes_count || 0,
      }));
      console.log('Fetched posts:', fetchedPosts);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      if (error.response?.status === 401) {
        console.error('Unauthorized - please login again');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log('Current user from context:', user);
        const response = await axiosInstance.get('/profile/me/');
        console.log('Profile data from API:', response.data);
        setUserProfile(response.data);
        setEditFormData(prev => ({
          ...prev,
          full_name: response.data.full_name || ''
        }));
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleEditProfile = () => {
    setShowEditModal(true);
    setPasswordError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePictureChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture({
        file: e.target.files[0],
        preview: URL.createObjectURL(e.target.files[0])
      });
    }
  };

  const handleSaveProfile = async () => {
    // Validate passwords if any password field is filled
    if (editFormData.new_password || editFormData.confirm_password || editFormData.current_password) {
      if (editFormData.new_password !== editFormData.confirm_password) {
        setPasswordError('New passwords do not match');
        return;
      }
      if (editFormData.new_password.length < 8) {
        setPasswordError('Password must be at least 8 characters long');
        return;
      }
    }

    try {
      const formData = new FormData();
      
      // Only append fields that have values
      if (editFormData.full_name) {
        formData.append('full_name', editFormData.full_name);
      }
      
      if (editFormData.current_password) {
        formData.append('current_password', editFormData.current_password);
        formData.append('new_password', editFormData.new_password);
      }
      
      // Append profile picture if selected
      if (profilePicture?.file) {
        formData.append('profile_picture', profilePicture.file);
      }

      const response = await axiosInstance.put('/profile/me/update/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUserProfile(prev => ({
        ...prev,
        ...response.data,
        full_name: editFormData.full_name || prev.full_name
      }));
      
      setShowEditModal(false);
      
      // Reset form
      setEditFormData({
        full_name: response.data.full_name || '',
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      // Reset profile picture state
      if (profilePicture?.preview) {
        URL.revokeObjectURL(profilePicture.preview);
        setProfilePicture(null);
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.data) {
        setPasswordError(error.response.data.detail || 'Error updating profile');
      } else {
        setPasswordError('Error updating profile. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Left Sidebar */}
        <div className="w-64 flex-shrink-0 bg-white shadow-md rounded-lg p-6 h-fit sticky top-8">
          {/* Avatar */}
          <div className="flex justify-center mb-4">
            {userProfile?.profile_picture ? (
              <img
                src={userProfile.profile_picture}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-semibold">
                {user?.email?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>

          {/* User Info */}
          <h2 className="text-center font-bold text-lg mb-1">{userProfile?.full_name || user?.email || 'Loading...'}</h2>
          <p className="text-center text-sm text-gray-500 mb-2"> {user?.username || 'Not available'}</p>
          

          {/* DOB */}
          <div className="flex items-center justify-center gap-1 mb-4 text-sm text-gray-500"> 
            <span>DOB - {userProfile?.dob || 'Not set'}</span>
          </div>
          {/* <div className="flex items-center justify-center gap-1 mb-4 text-sm text-gray-500">
            <span>Member since {new Date(userProfile?.date_joined).toLocaleDateString()}</span>
          </div> */}
          
          <button
            onClick={handleEditProfile}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition mb-4 flex items-center justify-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>

          {/* Share Button */}
          <div className="relative">
            <button
              onClick={async () => {
                const usernameOrEmail = user?.username || user?.email;
                const profilePath = usernameOrEmail
                  ? `/profile/${encodeURIComponent(usernameOrEmail)}`
                  : '/profile';
                const shareUrl = window.location.origin + profilePath;

                if (navigator.share) {
                  try {
                    await navigator.share({
                      title: 'My profile on SocialHub',
                      text: 'Check out my profile on SocialHub',
                      url: shareUrl,
                    });
                    return;
                  } catch (err) {
                    console.debug('Native share failed or cancelled', err);
                  }
                }

                setShowShareOptions((s) => !s);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
            >
              Share Profile
            </button>

            {showShareOptions && (
              <div className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded shadow-lg p-2 z-40">
                <button
                  onClick={async () => {
                    const usernameOrEmail = user?.username || user?.email;
                    const profilePath = usernameOrEmail
                      ? `/profile/${encodeURIComponent(usernameOrEmail)}`
                      : '/profile';
                    const shareUrl = window.location.origin + profilePath;
                    try {
                      await navigator.clipboard.writeText(shareUrl);
                      alert('Link copied to clipboard');
                      setShowShareOptions(false);
                    } catch (err) {
                      console.error('Copy failed', err);
                      alert('Copy failed. Please copy manually: ' + shareUrl);
                    }
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                >
                  Copy link
                </button>

                <button
                  onClick={() => {
                    const usernameOrEmail = user?.username || user?.email;
                    const profilePath = usernameOrEmail
                      ? `/profile/${encodeURIComponent(usernameOrEmail)}`
                      : '/profile';
                    const shareUrl = window.location.origin + profilePath;
                    const wa = `https://wa.me/?text=${encodeURIComponent('Check my profile: ' + shareUrl)}`;
                    window.open(wa, '_blank');
                    setShowShareOptions(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                >
                  Share to WhatsApp
                </button>

                <button
                  onClick={() => {
                    const usernameOrEmail = user?.username || user?.email;
                    const profilePath = usernameOrEmail
                      ? `/profile/${encodeURIComponent(usernameOrEmail)}`
                      : '/profile';
                    const shareUrl = window.location.origin + profilePath;
                    const mailto = `mailto:?subject=${encodeURIComponent('Check my profile')}&body=${encodeURIComponent('See my profile: ' + shareUrl)}`;
                    window.location.href = mailto;
                    setShowShareOptions(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                >
                  Share via Email
                </button>

                <button
                  onClick={() => {
                    const usernameOrEmail = user?.username || user?.email;
                    const profilePath = usernameOrEmail
                      ? `/profile/${encodeURIComponent(usernameOrEmail)}`
                      : '/profile';
                    const shareUrl = window.location.origin + profilePath;
                    const tg = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check my profile')}`;
                    window.open(tg, '_blank');
                    setShowShareOptions(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                >
                  Share to Telegram
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-2xl">
          {/* Add Post */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Add Post</h3>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Join our team and shape the future with us! We're hiring 🚀"
              className="w-full border border-gray-300 rounded p-3 text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows={3}
            />

            {image && image.preview && (
              <div className="relative mb-4">
                <img
                  src={image.preview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded"
                />
                <button
                  onClick={() => {
                    URL.revokeObjectURL(image.preview); // Clean up the preview URL
                    setImage(null);
                  }}
                  className="absolute top-2 right-2 bg-white/80 rounded-full p-1 hover:bg-white"
                >
                  <X className="w-4 h-4 text-black" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setImage(file);
                      // Create a preview URL for the image
                      const previewUrl = URL.createObjectURL(file);
                      setImage({
                        file: file,
                        preview: previewUrl
                      });
                    }
                  }}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4" />
                  Add Image
                </label>
              </div>

              <button
                onClick={handlePost}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
              >
                Post
              </button>
            </div>
          </div>

          {/* show button where logged person see all his post */}
          <div>
            <button
            onClick={viewPost} 
            className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              View My Posts
            </button>
          </div>

          {/* Posts */}
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white shadow-md rounded-lg p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                      {post.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{post.author}</p>
                      <p className="text-xs text-gray-500">{post.timestamp}</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-700 text-lg font-bold">
                    ×
                  </button>
                </div>

                <p className="text-gray-800 text-sm mb-3 leading-relaxed">{post.content}</p>

                {post.image && (
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full h-40 object-cover rounded mb-4"
                  />
                )}

                <div className="flex gap-6 text-sm">
                  <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                    <ThumbsUp className="w-4 h-4" />
                    <span>Like {post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
                    <ThumbsDown className="w-4 h-4" />
                    <span>Dislike {post.dislikes}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Edit Profile</h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {profilePicture?.preview ? (
                        <img 
                          src={profilePicture.preview} 
                          alt="Profile preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : userProfile?.profile_picture ? (
                        <img 
                          src={userProfile.profile_picture} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1.5 cursor-pointer">
                      <Edit2 className="w-4 h-4" />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                      />
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="full_name"
                      value={editFormData.full_name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Change Password (leave blank to keep current)</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="password"
                          name="current_password"
                          value={editFormData.current_password}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter current password"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="password"
                          name="new_password"
                          value={editFormData.new_password}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter new password"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="password"
                          name="confirm_password"
                          value={editFormData.confirm_password}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                    
                    {passwordError && (
                      <div className="text-red-500 text-sm mt-1">
                        {passwordError}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
