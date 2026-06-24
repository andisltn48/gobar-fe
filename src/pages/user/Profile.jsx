import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../hooks/usePost';
import Spinner from '../../components/common/Spinner';
import CommentSection from '../../components/common/CommentSection';
import api, { extractError } from '../../services/api';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const {
    posts,
    loading,
    error,
    hasMore,
    fetchNextPage,
    toggleLikePost,
    incrementCommentCount,
    deletePost,
    updatePost,
  } = usePosts(user?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedComments, setExpandedComments] = useState({});

  // Post Editing state
  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editStory, setEditStory] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editDistance, setEditDistance] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editElevation, setEditElevation] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Profile Editing state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileCity, setProfileCity] = useState('');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState('');
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [dragActiveProfile, setDragActiveProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [submittingProfile, setSubmittingProfile] = useState(false);

  const fileInputRefProfile = useRef(null);

  const handleStartEditProfile = () => {
    setProfileName(user?.name || '');
    setProfileCity(user?.city || '');
    setProfileAvatarUrl(user?.avatar_url || '');
    setEditingProfile(true);
    setProfileError('');
  };

  const handleProfileFileUpload = async (file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setProfileError("File too large. Max is 10MB.");
      return;
    }

    if (!file.type.startsWith('image/')) {
      setProfileError("Invalid file type: only images are allowed for profile pictures.");
      return;
    }

    setProfileError('');
    setUploadingProfile(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.data?.url) {
        setProfileAvatarUrl(res.data.data.url);
      }
    } catch (err) {
      setProfileError(extractError(err));
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSubmittingProfile(true);
    setProfileError('');
    try {
      const res = await api.put('/auth/me', {
        name: profileName.trim(),
        city: profileCity.trim(),
        avatar_url: profileAvatarUrl.trim(),
      });
      const updatedUser = res.data.data;
      updateUser(updatedUser);
      setEditingProfile(false);
    } catch (err) {
      setProfileError(extractError(err));
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handleStartEdit = (post) => {
    setEditingPost(post);
    setEditTitle(post.title || '');
    setEditStory(post.description || '');
    setEditLocation(post.location || '');
    setEditTags(post.tags || '');
    setEditDistance(post.distance || '');
    setEditTime(post.duration || '');
    setEditElevation(post.elevation || '');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingPost) return;
    setSubmittingEdit(true);
    try {
      await updatePost(editingPost.id, {
        media_url: editingPost.media_url,
        media_type: editingPost.media_type,
        title: editTitle.trim(),
        description: editStory.trim(),
        distance: parseFloat(editDistance) || 0,
        duration: editTime.trim(),
        elevation: parseInt(editElevation) || 0,
        location: editLocation.trim(),
        tags: editTags.trim(),
      });
      setEditingPost(null);
    } catch (err) {
      alert('Failed to update post: ' + err.message);
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you absolutely sure you want to delete this ride? 💀')) {
      try {
        await deletePost(postId);
      } catch (err) {
        alert('Failed to delete post: ' + err.message);
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchNextPage]);

  const filteredPosts = (posts || []).filter((post) => {
    const username = (post.user?.name || '').toLowerCase();
    const desc = (post.description || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return username.includes(query) || desc.includes(query);
  });

  const handleShare = (postId) => {
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url);
    alert('Tautan postingan berhasil disalin ke papan klip! 🚀');
  };

  // Helper to parse relative timestamp
  const getRelativeTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) {
        return `${Math.max(1, diffMins)}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else {
        return `${diffDays}d ago`;
      }
    } catch {
      return '3h ago';
    }
  };

  // Helper to parse tags based on keywords or fallback
  const getPostTags = (post) => {
    if (post.tags) {
      return post.tags.split(',').map((t) => t.trim().toUpperCase()).filter(Boolean);
    }
    return [];
  };

  // Helper to parse speed/elevation overlays
  const getPostStatOverlay = (post) => {
    if (post.distance > 0) {
      return { value: `${post.distance} KM`, type: 'distance' };
    }
    if (post.elevation > 0) {
      return { value: `${post.elevation}M ELEV`, type: 'elevation' };
    }
    if (post.duration) {
      return { value: post.duration, type: 'duration' };
    }
    return null;
  };

  // Helper to parse title and body
  const getPostContent = (post) => {
    return {
      title: post.title ? post.title.toUpperCase() : 'UNTITLED RIDE',
      body: post.description || '',
    };
  };



  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Profile Header Card */}
      <div className="bg-[#caf300] border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8 flex flex-col md:flex-row items-center gap-6">
        <div className="w-20 h-20 border-4 border-black bg-white flex items-center justify-center font-display text-4xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0 select-none overflow-hidden relative">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt=""
              className="w-full h-full object-cover z-10"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : null}
          <span className="absolute inset-0 flex items-center justify-center bg-white text-black font-display text-4xl font-black">
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </span>
        </div>
        <div className="space-y-1 text-center md:text-left flex-1">
          <h1 className="font-display text-xl sm:text-3xl font-black uppercase text-[#171e00] tracking-tight">
            {user?.name || 'RIDER PROFILE'}
          </h1>
          <p className="font-mono text-[9px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider">
            EMAIL: {user?.email || 'N/A'} • CITY: {user?.city || 'N/A'} • ROLE: {user?.role || 'RIDER'}
          </p>
          <button
            onClick={handleStartEditProfile}
            className="mt-2 font-mono text-[10px] font-black uppercase border-2 border-black bg-white px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#171e00] hover:text-[#caf300] active:translate-y-0.5 transition-all cursor-pointer inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[12px]">edit</span>
            EDIT PROFILE
          </button>
        </div>
        <div className="relative flex items-center h-12 border-4 border-black bg-white focus-within:bg-[#caf300] focus-within:-translate-y-0.5 focus-within:-translate-x-0.5 focus-within:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-75 w-full md:w-48">
          <span className="material-symbols-outlined ml-2 text-on-surface select-none">search</span>
          <input
            type="text"
            placeholder="SEARCH POSTS..."
            className="w-full h-full bg-transparent border-none focus:ring-0 font-mono text-xs placeholder:text-gray-500 p-2 font-bold outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading && posts.length === 0 && <Spinner size="lg" />}

      {error && (
        <div className="bg-error-container border-4 border-black p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-shake">
          <p className="font-mono text-label-md text-on-error-container">{error}</p>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-12">
        {filteredPosts.map((post) => {
          const tags = getPostTags(post);
          const statOverlay = getPostStatOverlay(post);
          const { title, body } = getPostContent(post);
          const relativeTime = getRelativeTime(post.created_at);
          const userCity = post.location ? post.location.toUpperCase() : '';
          const username = `@${(post.user?.name || 'RIDER').toUpperCase().replace(/\s+/g, '_')}`;

          return (
            <article
              key={post.id}
              className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-4 border-b-4 border-black flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#e2e4cf]">
                <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
                  <div className="w-10 h-10 border-4 border-black bg-white shrink-0 overflow-hidden relative shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {post.user?.avatar_url ? (
                      <img
                        src={post.user.avatar_url}
                        alt=""
                        className="w-full h-full object-cover absolute inset-0 z-10"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-[#caf300] text-[#171e00] flex items-center justify-center font-display text-lg font-black z-0">
                      {post.user?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-xs sm:text-sm md:text-md font-extrabold leading-tight tracking-tight text-[#1a1d10] break-all whitespace-normal">
                      {username}
                    </div>
                    <div className="font-mono text-[8px] sm:text-[9px] md:text-[10px] font-bold text-on-surface-variant mt-1 tracking-wider">
                      {relativeTime.toUpperCase()}{userCity ? ` • ${userCity}` : ''}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-start sm:justify-end">
                  {tags.map((tag, i) => (
                    <span
                      key={i}
                      className={`px-2 py-0.5 sm:px-2.5 sm:py-1 border-2 border-black font-mono text-[8px] sm:text-[10px] font-black uppercase tracking-wider shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                        i === 0 ? 'bg-[#536600] text-white' : 'bg-[#006970] text-white'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Media Container */}
              <div className="relative border-b-4 border-black bg-[#dadcc6] overflow-hidden aspect-[4/3] flex items-center justify-center">
                {post.media_type === 'image' ? (
                  <img
                    src={post.media_url}
                    alt=""
                    className="w-full h-full object-cover transition-all hover:scale-[1.02] duration-200 will-change-transform"
                  />
                ) : (
                  <video src={post.media_url} controls className="w-full h-full object-cover bg-black" />
                )}

                {/* Dynamic Stat Overlay Badge */}
                {statOverlay && (
                  <div
                    className={`absolute ${
                      statOverlay.type === 'speed' ? 'bottom-4 right-4 -rotate-2' : 'top-4 left-4 rotate-2'
                    } z-10`}
                  >
                    <div className="bg-[#caf300] text-[#171e00] border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-display text-xl font-black uppercase tracking-tight">
                      {statOverlay.value}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Content Body */}
              <div className="p-4 sm:p-6 bg-white">
                <h2 className="font-display text-sm sm:text-lg md:text-3xl font-black uppercase tracking-tight mb-2 sm:mb-3 text-[#1a1d10]">
                  {title}
                </h2>
                <p className="font-body text-[11px] sm:text-xs md:text-sm leading-relaxed text-[#1a1d10]">
                  {body}
                </p>

                {/* Ride Stats Grid */}
                {(post.distance > 0 || post.elevation > 0 || post.duration) && (
                  <div className="mt-4 grid grid-cols-3 gap-2 border-4 border-black bg-[#caf300]/10 p-2 sm:p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <div className="text-center border-r-2 border-black/20">
                      <div className="font-mono text-[6px] sm:text-[9px] font-bold text-gray-500 uppercase">DISTANCE</div>
                      <div className="font-display text-[10px] sm:text-xs md:text-md font-black text-black">{post.distance || '0.0'} KM</div>
                    </div>
                    <div className="text-center border-r-2 border-black/20">
                      <div className="font-mono text-[6px] sm:text-[9px] font-bold text-gray-500 uppercase">DURATION</div>
                      <div className="font-display text-[10px] sm:text-xs md:text-md font-black text-black">{post.duration || '00:00'}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-mono text-[6px] sm:text-[9px] font-bold text-gray-500 uppercase">ELEVATION</div>
                      <div className="font-display text-[10px] sm:text-xs md:text-md font-black text-black">{post.elevation || '0'} M</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Actions Row */}
              <div className="flex w-full border-t-4 border-black bg-white">
                <button
                  onClick={() => toggleLikePost(post.id)}
                  className={`flex-1 border-r-4 border-black py-3 sm:py-4 flex justify-center items-center gap-1 sm:gap-2 font-mono text-[9px] sm:text-xs font-bold transition-all hover:bg-[#caf300] uppercase ${
                    post.liked_by_me ? 'bg-[#caf300]/30 text-[#171e00]' : 'text-on-surface'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[13px] sm:text-[20px] ${
                      post.liked_by_me ? 'text-red-600 fill-current' : 'text-on-surface'
                    }`}
                  >
                    local_fire_department
                  </span>
                  <span className="hidden sm:inline">KUDOS</span>
                  <span className="bg-black text-white px-1 py-0.5 sm:px-2 sm:py-0.5 text-[7px] sm:text-[10px] font-bold rounded-sm ml-0.5 sm:ml-1">
                    {post.likes_count || 0}
                  </span>
                </button>

                <button
                  onClick={() =>
                    setExpandedComments((prev) => ({
                      ...prev,
                      [post.id]: !prev[post.id],
                    }))
                  }
                  className={`flex-1 border-r-4 border-black py-3 sm:py-4 flex justify-center items-center gap-1 sm:gap-2 font-mono text-[9px] sm:text-xs font-bold hover:bg-[#caf300] transition-all text-on-surface uppercase ${
                    expandedComments[post.id] ? 'bg-[#caf300]/10' : ''
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px] sm:text-[20px]">forum</span>
                  <span className="hidden sm:inline">COMM</span>
                  <span className="bg-black text-white px-1 py-0.5 sm:px-2 sm:py-0.5 text-[7px] sm:text-[10px] font-bold rounded-sm ml-0.5 sm:ml-1">
                    {post.comments_count || 0}
                  </span>
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => handleStartEdit(post)}
                  className="flex-1 border-r-4 border-black py-3 sm:py-4 flex justify-center items-center gap-1 sm:gap-2 font-mono text-[9px] sm:text-xs font-bold hover:bg-[#caf300] transition-all text-on-surface uppercase"
                >
                  <span className="material-symbols-outlined text-[13px] sm:text-[20px]">edit</span>
                  <span className="hidden sm:inline">EDIT</span>
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(post.id)}
                  className="flex-1 border-r-4 border-black py-3 sm:py-4 flex justify-center items-center gap-1 sm:gap-2 font-mono text-[9px] sm:text-xs font-bold hover:bg-red-500 hover:text-white transition-all text-on-surface uppercase"
                >
                  <span className="material-symbols-outlined text-[13px] sm:text-[20px]">delete</span>
                  <span className="hidden sm:inline">DEL</span>
                </button>

                <button
                  onClick={() => handleShare(post.id)}
                  className="w-12 sm:w-16 py-3 sm:py-4 flex justify-center items-center hover:bg-[#caf300] transition-all text-on-surface"
                >
                  <span className="material-symbols-outlined text-[13px] sm:text-[20px]">share</span>
                </button>
              </div>

              {expandedComments[post.id] && (
                <CommentSection
                  postId={post.id}
                  onCommentAdded={() => incrementCommentCount(post.id)}
                />
              )}
            </article>
          );
        })}

        {/* Loading spinner at bottom */}
        {loading && (
          <div className="flex justify-center py-6">
            <Spinner size="md" />
          </div>
        )}

        {!loading && hasMore && posts.length > 0 && (
          <div className="flex justify-center pt-4">
            <button
              onClick={fetchNextPage}
              className="bg-[#caf300] hover:bg-[#caf300]/95 text-[#171e00] border-4 border-black px-8 py-4 font-display text-lg font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[0px] active:translate-y-[0px] active:shadow-none flex items-center gap-3 cursor-pointer"
            >
              LOAD MORE PAIN...
            </button>
          </div>
        )}

        {!loading && filteredPosts.length === 0 && (
          <div className="text-center py-16 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-stroke font-display text-5xl uppercase mb-4">KOSONG</p>
            <p className="font-body text-body-md text-on-surface-variant font-bold">
              Belum ada postingan dari Anda 🚴
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal Overlay */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f4f5df] border-4 border-black p-6 w-full max-w-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b-4 border-black pb-4">
              <h2 className="font-display text-2xl font-black uppercase text-black">EDIT RIDE POST</h2>
              <button
                onClick={() => setEditingPost(null)}
                className="font-mono text-xs font-black uppercase border-2 border-black bg-white px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#caf300] active:translate-y-0.5 transition-all cursor-pointer"
              >
                [CLOSE]
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="flex flex-col">
                  <label className="font-mono text-[10px] font-black text-gray-700 uppercase mb-1">RIDE TITLE</label>
                  <input
                    type="text"
                    className="border-4 border-black p-2 font-display text-md font-bold focus:bg-white outline-none"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                  />
                </div>
                
                {/* Location */}
                <div className="flex flex-col">
                  <label className="font-mono text-[10px] font-black text-gray-700 uppercase mb-1">LOCATION</label>
                  <input
                    type="text"
                    className="border-4 border-black p-2 font-mono text-xs font-bold focus:bg-white outline-none"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Story */}
              <div className="flex flex-col">
                <label className="font-mono text-[10px] font-black text-gray-700 uppercase mb-1">STORY</label>
                <textarea
                  rows={4}
                  className="border-4 border-black p-2 font-body text-xs focus:bg-white outline-none resize-none"
                  value={editStory}
                  onChange={(e) => setEditStory(e.target.value)}
                  required
                />
              </div>

              {/* Tags */}
              <div className="flex flex-col">
                <label className="font-mono text-[10px] font-black text-gray-700 uppercase mb-1">TAGS (COMMA SEPARATED)</label>
                <input
                  type="text"
                  className="border-4 border-black p-2 font-mono text-xs font-bold focus:bg-white outline-none"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  required
                />
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 bg-white border-4 border-black p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                {/* Distance */}
                <div className="flex flex-col">
                  <label className="font-mono text-[9px] font-bold text-gray-500 uppercase mb-1">DISTANCE (KM)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="border-2 border-black p-1.5 font-mono text-xs text-center outline-none bg-[#f4f5df] focus:bg-white"
                    value={editDistance}
                    onChange={(e) => setEditDistance(e.target.value)}
                    required
                  />
                </div>
                
                {/* Duration */}
                <div className="flex flex-col">
                  <label className="font-mono text-[9px] font-bold text-gray-500 uppercase mb-1">DURATION (HH:MM)</label>
                  <input
                    type="text"
                    className="border-2 border-black p-1.5 font-mono text-xs text-center outline-none bg-[#f4f5df] focus:bg-white"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    required
                  />
                </div>

                {/* Elevation */}
                <div className="flex flex-col">
                  <label className="font-mono text-[9px] font-bold text-gray-500 uppercase mb-1">ELEVATION (M)</label>
                  <input
                    type="number"
                    className="border-2 border-black p-1.5 font-mono text-xs text-center outline-none bg-[#f4f5df] focus:bg-white"
                    value={editElevation}
                    onChange={(e) => setEditElevation(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="bg-[#caf300] hover:bg-[#caf300]/95 text-black border-4 border-black px-6 py-3 font-display text-sm font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer flex items-center gap-2"
                >
                  {submittingEdit ? 'SAVING...' : 'SAVE CHANGES'}
                  <span className="material-symbols-outlined text-sm font-black">save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editingProfile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f4f5df] border-4 border-black p-6 w-full max-w-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b-4 border-black pb-4">
              <h2 className="font-display text-2xl font-black uppercase text-black">EDIT PROFILE</h2>
              <button
                onClick={() => setEditingProfile(false)}
                className="font-mono text-xs font-black uppercase border-2 border-black bg-white px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#caf300] active:translate-y-0.5 transition-all cursor-pointer"
              >
                [CLOSE]
              </button>
            </div>

            {profileError && (
              <div className="bg-error-container border-4 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-shake">
                <p className="font-mono text-xs font-bold text-on-error-container">{profileError}</p>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {/* Name */}
              <div className="flex flex-col">
                <label className="font-mono text-[10px] font-black text-gray-700 uppercase mb-1">RIDER NAME</label>
                <input
                  type="text"
                  className="border-4 border-black p-2 font-display text-md font-bold focus:bg-white outline-none"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                />
              </div>

              {/* City */}
              <div className="flex flex-col">
                <label className="font-mono text-[10px] font-black text-gray-700 uppercase mb-1">CITY</label>
                <input
                  type="text"
                  className="border-4 border-black p-2 font-mono text-xs font-bold focus:bg-white outline-none"
                  value={profileCity}
                  onChange={(e) => setProfileCity(e.target.value)}
                  required
                />
              </div>

              {/* Avatar Photo Upload / URL */}
              <div className="flex flex-col">
                <label className="font-mono text-[10px] font-black text-gray-700 uppercase mb-1">PROFILE PHOTO</label>
                <div
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragActiveProfile(true);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragActiveProfile(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragActiveProfile(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragActiveProfile(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleProfileFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRefProfile.current.click()}
                  className={`border-4 border-black border-dashed p-4 flex flex-col justify-center items-center text-center min-h-[150px] relative transition-colors cursor-pointer ${
                    dragActiveProfile ? 'bg-[#caf300]/20 border-[#caf300]' : 'bg-white'
                  } hover:bg-[#ebedd1]`}
                >
                  <input
                    ref={fileInputRefProfile}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleProfileFileUpload(e.target.files[0]);
                      }
                    }}
                  />

                  {uploadingProfile ? (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-mono text-[10px] font-black uppercase text-black">
                        UPLOADING IMAGE...
                      </span>
                    </div>
                  ) : profileAvatarUrl ? (
                    <div className="flex flex-col items-center space-y-2" onClick={(e) => e.stopPropagation()}>
                      <div className="relative w-20 h-20 border-4 border-black bg-white overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <img
                          src={profileAvatarUrl}
                          alt="Profile Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setProfileAvatarUrl('')}
                        className="bg-red-500 hover:bg-red-600 text-white font-mono font-black text-[10px] px-2 py-0.5 border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                      >
                        REMOVE PHOTO
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[36px] text-black mb-1 select-none">
                        add_a_photo
                      </span>
                      <span className="font-display text-sm font-black uppercase text-black">
                        DRAG PROFILE IMAGE HERE
                      </span>
                      <span className="font-body text-[10px] text-gray-500 mt-0.5">
                        or <span className="underline font-bold text-black">click to browse</span>
                      </span>
                    </>
                  )}
                </div>

                <div className="mt-3 flex flex-col" onClick={(e) => e.stopPropagation()}>
                  <label className="font-mono text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">OR ENTER PHOTO URL</label>
                  <input
                    type="text"
                    placeholder="ENTER PHOTO URL..."
                    className="border-2 border-black p-2 font-mono text-xs focus:bg-white outline-none bg-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                    value={profileAvatarUrl}
                    onChange={(e) => setProfileAvatarUrl(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submittingProfile}
                  className="bg-[#caf300] hover:bg-[#caf300]/95 text-black border-4 border-black px-6 py-3 font-display text-sm font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer flex items-center gap-2"
                >
                  {submittingProfile ? 'SAVING...' : 'SAVE CHANGES'}
                  <span className="material-symbols-outlined text-sm font-black">save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
