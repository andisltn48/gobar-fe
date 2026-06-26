import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePosts } from '../../hooks/usePost';
import Spinner from '../../components/common/Spinner';
import CommentSection from '../../components/common/CommentSection';
import { showSuccess } from '../../utils/alert';

export default function Home() {
  const {
    posts,
    loading,
    error,
    hasMore,
    fetchNextPage,
    toggleLikePost,
    incrementCommentCount,
  } = usePosts();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedComments, setExpandedComments] = useState({});

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
    showSuccess('SALIN TAUTAN', 'Tautan postingan berhasil disalin ke papan klip! 🚀');
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
      {/* Header Container */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex-1 space-y-4">
          <div className="bg-[#caf300] border-4 border-black p-4 inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h1 className="font-display text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-tighter text-[#171e00]">
              COMMUNITY FEED
            </h1>
          </div>
          {/* <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-body text-body-md font-bold text-on-surface-variant leading-relaxed">
              Raw stats, heavy sprints, and urban chaos. See what the pack is riding today.
            </p>
          </div> */}
        </div>

        {/* Search Riders Bar */}
        <div className="relative flex items-center h-12 border-4 border-black bg-white focus-within:bg-[#caf300] focus-within:-translate-y-0.5 focus-within:-translate-x-0.5 focus-within:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-75 w-full md:w-64 mt-4 md:mt-0">
          <i className="fa-solid fa-magnifying-glass ml-2 text-on-surface select-none" />
          <input
            type="text"
            placeholder="SEARCH RIDERS..."
            className="w-full h-full bg-transparent border-none focus:ring-0 font-mono text-xs placeholder:text-gray-500 p-2 font-bold outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading && <Spinner size="lg" />}

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
                    <div className="bg-[#caf300] text-[#171e00] border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-display text-sm sm:text-xl font-black uppercase tracking-tight">
                      {statOverlay.value}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Content Body */}
              <div className="p-4 sm:p-6 bg-white">
                <h2 className="font-display text-sm sm:text-lg md:text-2xl font-black uppercase tracking-tight mb-2 sm:mb-3 text-[#1a1d10]">
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
                  <i
                    className={`fa-solid fa-fire text-[13px] sm:text-[18px] ${
                      post.liked_by_me ? 'text-red-600' : 'text-on-surface'
                    }`}
                  />
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
                  <i className="fa-solid fa-comments text-[13px] sm:text-[18px]" />
                  <span className="hidden sm:inline">COMM</span>
                  <span className="bg-black text-white px-1 py-0.5 sm:px-2 sm:py-0.5 text-[7px] sm:text-[10px] font-bold rounded-sm ml-0.5 sm:ml-1">
                    {post.comments_count || 0}
                  </span>
                </button>

                <button
                  onClick={() => handleShare(post.id)}
                  className="w-12 sm:w-16 py-3 sm:py-4 flex justify-center items-center hover:bg-[#caf300] transition-all text-on-surface"
                >
                  <i className="fa-solid fa-share-nodes text-[13px] sm:text-[18px]" />
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
              Postingan tidak ditemukan 🚴
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

