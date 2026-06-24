import { useState, useEffect, useCallback } from 'react';
import api, { extractError } from '../services/api';

export function usePosts(userId = null) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/posts', {
        params: { limit: 5, offset: 0, user_id: userId || undefined },
      });
      const newPosts = res.data.data || [];
      setPosts(newPosts);
      setOffset(newPosts.length);
      setHasMore(newPosts.length === 5);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchNextPage = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/posts', {
        params: { limit: 5, offset, user_id: userId || undefined },
      });
      const newPosts = res.data.data || [];
      if (newPosts.length < 5) {
        setHasMore(false);
      }
      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const filteredNew = newPosts.filter((p) => !existingIds.has(p.id));
        return [...prev, ...filteredNew];
      });
      setOffset((prev) => prev + newPosts.length);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [offset, loading, hasMore, userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createPost = async (postData) => {
    const res = await api.post('/posts', postData);
    setPosts((prev) => [res.data.data, ...prev]);
    setOffset((prev) => prev + 1);
    return res.data;
  };

  const deletePost = async (id) => {
    await api.delete(`/posts/${id}`);
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setOffset((prev) => Math.max(0, prev - 1));
  };

  const toggleLikePost = async (id) => {
    try {
      const res = await api.post(`/posts/${id}/like`);
      const { liked, likes_count } = res.data.data;
      setPosts((prev) =>
        prev.map((post) =>
          post.id === id
            ? { ...post, liked_by_me: liked, likes_count: likes_count }
            : post
        )
      );
    } catch (err) {
      console.error('Failed to toggle like:', err);
      throw err;
    }
  };

  const incrementCommentCount = (id) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? { ...post, comments_count: (post.comments_count || 0) + 1 }
          : post
      )
    );
  };

  const updatePost = async (id, postData) => {
    const res = await api.put(`/posts/${id}`, postData);
    const updated = res.data.data;
    setPosts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  return {
    posts,
    loading,
    error,
    hasMore,
    fetchNextPage,
    refresh,
    createPost,
    updatePost,
    deletePost,
    toggleLikePost,
    incrementCommentCount,
    refetch: refresh,
  };
}

export function usePost(id) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/posts/${id}`)
      .then((res) => setPost(res.data.data))
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, [id]);

  return { post, loading, error };
}
