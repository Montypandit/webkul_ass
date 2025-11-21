import React, { useState, useContext, useEffect } from "react";
import { ThumbsUp, ThumbsDown, X, Image as ImageIcon, Edit2 } from "lucide-react";
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
// Edit profile states
   const [editMode, setEditMode] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);



  // Debug: log user data whenever it changes
  useEffect(() => {
    console.log('User from context:', user);
  }, [user]);


   const editProfile = () => {
  setEditMode(true);
    setEditFullName(userProfile?.full_name || "");
    setEditDob(userProfile?.dob || "");
    setPreviewImage(userProfile?.profile_picture || null);
  }

  const saveProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("full_name", editFullName);
      formData.append("dob", editDob);

      if (editImage) {
        formData.append("profile_picture", editImage);
      }

      const response = await axiosInstance.put("/profile/me/update/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Profile updated successfully");

      setUserProfile(response.data);
      setEditMode(false);
      setEditImage(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Profile update failed");
    }
  };

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
        console.log('Current user from context:', user); // Debug log
        const response = await axiosInstance.get('/profile/me/');
        console.log('Profile data from API:', response.data); // Debug log
        setUserProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchUserProfile();
  }, [user]);

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

            <Edit2 
             onClick={editProfile}
            className="w-5 h-5 cursor-pointer text-blue-600 hover:text-blue-800"/>
            {/* <div>Edit</div> */}
          </div>

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

        {editMode && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-96 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>

              {/* Name */}
              <label className="text-sm font-medium">Full Name</label>
              <input
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                className="w-full border px-3 py-2 rounded mb-3"
                placeholder="Enter full name"
              />

              {/* DOB */}
              <label className="text-sm font-medium">Date of Birth</label>
              <input
                type="date"
                value={editDob}
                onChange={(e) => setEditDob(e.target.value)}
                className="w-full border px-3 py-2 rounded mb-3"
              />

              {/* Profile Picture */}
              <label className="text-sm font-medium">
                Profile Picture
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setEditImage(file);
                  if (file) {
                    setPreviewImage(URL.createObjectURL(file));
                  }
                }}
                className="w-full mb-3"
              />

              {/* Preview */}
              {previewImage && (
                <img
                  src={previewImage}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-3"
                />
              )}

              {/* Buttons */}
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setEditMode(false)}
                  className="px-3 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={saveProfile}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

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
    </div>
  );
}
