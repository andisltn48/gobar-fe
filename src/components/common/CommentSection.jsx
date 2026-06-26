import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api, { extractError } from '../../services/api';
import { showError } from '../../utils/alert';
import Spinner from './Spinner';

export default function CommentSection({ postId, onCommentAdded }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state for new comment
  const [newCommentText, setNewCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Active reply target comment ID
  const [replyTargetId, setReplyTargetId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [collapsedComments, setCollapsedComments] = useState({});

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/posts/${postId}/comments`);
      setComments(res.data.data || []);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.post(`/posts/${postId}/comments`, {
        content: newCommentText.trim(),
      });
      // Append the new comment
      setComments((prev) => [...prev, res.data.data]);
      setNewCommentText('');
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (err) {
      showError('KOMENTAR GAGAL', extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostReply = async (parentComment) => {
    if (!replyText.trim()) return;
    
    // We want all nested replies to group under the top-level parent comment
    const parentId = parentComment.parent_id || parentComment.id;

    setSubmitting(true);
    try {
      const res = await api.post(`/posts/${postId}/comments`, {
        content: replyText.trim(),
        parent_id: parentId,
      });
      setComments((prev) => [...prev, res.data.data]);
      setReplyText('');
      setReplyTargetId(null);
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (err) {
      showError('REPLY GAGAL', extractError(err));
    } finally {
      setSubmitting(false);
    }
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
      return 'just now';
    }
  };

  // Build comments tree: only roots and their direct replies list
  const rootComments = comments.filter((c) => !c.parent_id);
  const repliesMap = comments.reduce((acc, c) => {
    if (c.parent_id) {
      if (!acc[c.parent_id]) acc[c.parent_id] = [];
      acc[c.parent_id].push(c);
    }
    return acc;
  }, {});

  return (
    <div className="border-t-4 border-black bg-[#f9faf6] p-6 space-y-6">
      <div className="flex items-center gap-2">
        <i className="fa-solid fa-comments text-[18px]" />
        <h3 className="font-mono text-xs sm:text-sm font-black uppercase tracking-wider">
          DISCUSSIONS ({comments.length})
        </h3>
      </div>

      {/* Main Comment Input */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <textarea
            rows="3"
            placeholder="WRITE A COMMENT..."
            className="w-full border-4 border-black p-3 font-mono text-xs font-bold placeholder:text-gray-400 focus:bg-[#caf300]/5 outline-none resize-none"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            disabled={submitting}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newCommentText.trim()}
              className="bg-[#caf300] hover:bg-[#caf300]/90 text-black border-4 border-black px-6 py-2.5 font-display text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none duration-75 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'SUBMITTING...' : 'SUBMIT COMMENT'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-yellow-50 border-4 border-black p-4 text-center">
          <p className="font-mono text-xs font-bold uppercase">PLEASE LOGIN TO COMMENT</p>
        </div>
      )}

      {loading && comments.length === 0 && (
        <div className="flex justify-center py-4">
          <Spinner size="sm" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-2 border-black p-3 font-mono text-xs text-red-600 uppercase">
          {error}
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {rootComments.map((comment) => {
          const commentReplies = repliesMap[comment.id] || [];
          const commentUser = comment.user || {};
          const commentUsername = `@${(commentUser.name || 'rider').toLowerCase().replace(/\s+/g, '_')}`;

          return (
            <div key={comment.id} className="space-y-4">
              {/* Parent Comment Card */}
              <div className="bg-white border-4 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-center gap-2 mb-2">
                  <div>
                    <span className="font-display text-[10px] sm:text-xs font-extrabold text-[#1a1d10]">
                      {commentUsername}
                    </span>
                    <span className="font-mono text-[8px] sm:text-[9px] font-bold text-gray-500 ml-2 uppercase">
                      {getRelativeTime(comment.created_at)} • {commentUser.city || 'INDONESIA'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {commentReplies.length > 0 && (
                      <button
                        onClick={() => {
                          setCollapsedComments((prev) => ({
                            ...prev,
                            [comment.id]: !prev[comment.id],
                          }));
                        }}
                        className="font-mono text-[8px] sm:text-[9px] font-black uppercase text-gray-500 hover:underline mr-1"
                      >
                        [{collapsedComments[comment.id] ? `SHOW REPLIES (${commentReplies.length})` : `HIDE REPLIES`}]
                      </button>
                    )}
                    {user && (
                      <button
                        onClick={() => {
                          setReplyTargetId(comment.id);
                          setReplyText('');
                        }}
                        className="font-mono text-[9px] sm:text-[10px] font-black uppercase text-[#536600] hover:underline"
                      >
                        [REPLY]
                      </button>
                    )}
                  </div>
                </div>
                <p className="font-body text-[10px] sm:text-xs font-medium text-gray-800 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>

              {/* Inline Reply Form under root comment */}
              {replyTargetId === comment.id && (
                <div className="pl-6 border-l-4 border-black/20 space-y-2">
                  <textarea
                    rows="2"
                    placeholder={`REPLY TO ${commentUsername.toUpperCase()}...`}
                    className="w-full border-4 border-black p-3 font-mono text-xs font-bold placeholder:text-gray-400 focus:bg-[#caf300]/5 outline-none resize-none"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    disabled={submitting}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setReplyTargetId(null)}
                      className="border-2 border-black px-4 py-1.5 font-mono text-[10px] font-bold uppercase hover:bg-gray-100"
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={() => handlePostReply(comment)}
                      disabled={submitting || !replyText.trim()}
                      className="bg-[#caf300] hover:bg-[#caf300]/90 text-black border-2 border-black px-4 py-1.5 font-display text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none duration-75 transition-all cursor-pointer"
                    >
                      {submitting ? 'SENDING...' : 'REPLY'}
                    </button>
                  </div>
                </div>
              )}

              {/* Nested Replies List */}
              {!collapsedComments[comment.id] && commentReplies.length > 0 && (
                <div className="pl-8 border-l-4 border-black/20 space-y-4">
                  {commentReplies.map((reply) => {
                    const replyUser = reply.user || {};
                    const replyUsername = `@${(replyUser.name || 'rider').toLowerCase().replace(/\s+/g, '_')}`;

                    return (
                      <div
                        key={reply.id}
                        className="bg-[#fcfdfa] border-4 border-black/60 p-3 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] relative"
                      >
                        {/* Little reply arrow decoration */}
                        <div className="absolute left-[-26px] top-4 text-black/30 font-bold select-none pointer-events-none">
                          ↳
                        </div>
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <div>
                            <span className="font-display text-[9px] sm:text-[11px] font-extrabold text-[#1a1d10]">
                              {replyUsername}
                            </span>
                            <span className="font-mono text-[9px] font-bold text-gray-500 ml-2 uppercase">
                              {getRelativeTime(reply.created_at)}
                            </span>
                          </div>
                        </div>
                        <p className="font-body text-[10px] sm:text-xs text-gray-700 whitespace-pre-wrap">
                          {reply.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {rootComments.length === 0 && !loading && (
          <p className="font-mono text-xs font-bold text-gray-400 text-center uppercase py-4">
            NO COMMENTS YET. START THE CONVERSATION!
          </p>
        )}
      </div>
    </div>
  );
}
