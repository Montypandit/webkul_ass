import React, { useEffect, useState, useContext } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import axiosInstance from '../config/apiConfig';
import AuthContext from '../context/AuthContext';

export default function AllPost() {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/posts/');
      // backend returns array of posts with user nested and likes_count/dislikes_count
      const mapped = res.data.map((p) => ({
        id: p.id,
        author: p.user?.profile?.full_name || p.user?.email || 'Unknown',
        avatar: p.user?.email?.charAt(0).toUpperCase() || '?',
        content: p.content,
        image: p.image,
        created_at: p.created_at,
        likes: p.likes_count || 0,
        dislikes: p.dislikes_count || 0,
      }));
      setPosts(mapped);
    } catch (err) {
      console.error('Error loading posts', err);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    try {
      const res = await axiosInstance.post(`/posts/${postId}/like-toggle/`);
      // Expecting { liked: true/false, likes_count }
      const { likes_count } = res.data;
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likes: likes_count } : p));
    } catch (err) {
      console.error('Like failed', err);
      alert('Could not toggle like.');
    }
  };

  const toggleDislike = async (postId) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    try {
      const res = await axiosInstance.post(`/posts/${postId}/dislike-toggle/`);
      // If backend supports, expect { disliked: true/false, dislikes_count }
      const dislikes_count = res.data.dislikes_count || res.data.dislikes || null;
      if (typeof dislikes_count === 'number') {
        setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, dislikes: dislikes_count } : p));
      } else {
        // fallback: refresh list
        fetchPosts();
      }
    } catch (err) {
      console.error('Dislike failed', err);
      // If endpoint missing, inform user
      if (err.response && err.response.status === 404) {
        alert('Dislike action not available on server.');
      } else {
        alert('Could not toggle dislike.');
      }
    }
  };

  if (loading) return <div className="p-6">Loading posts...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">All Posts</h2>
      {posts.length === 0 && (
        <div className="text-gray-500">No posts yet.</div>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white shadow rounded-lg p-4 border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                {post.avatar}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">User-{post.author}</div>
                <div className="text-xs text-gray-500">{new Date(post.created_at).toLocaleString()}</div>
              </div>
            </div>

            <div className="text-gray-800 mb-3">{post.content}</div>

            {post.image && (
              <img src={post.image} alt="post" className="w-full h-56 object-cover rounded mb-3" />
            )}

            <div className="flex items-center gap-4">
              <button
                onClick={() => toggleLike(post.id)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm">Like {post.likes}</span>
              </button>

              <button
                onClick={() => toggleDislike(post.id)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
              >
                <ThumbsDown className="w-4 h-4" />
                <span className="text-sm">Dislike {post.dislikes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
