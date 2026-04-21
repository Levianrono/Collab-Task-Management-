// src/components/Comments/CommentThread.jsx
import { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Paperclip } from 'lucide-react';
import { addComment, deleteComment as apiDeleteComment } from '../../api/tasks.js';
import { useAuthContext } from '../../context/AuthContext.jsx';
import { useRealtime } from '../../hooks/useRealtime.js';
import { timeAgo } from '../../utils/formatDate.js';

/**
 * @param {{ taskId: string, initialComments: object[] }} props
 */
const CommentThread = ({ taskId, initialComments }) => {
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const { user } = useAuthContext();
  const bottomRef = useRef(null);

  // Supabase Realtime — live new comments
  useRealtime({
    channelName: `comments:${taskId}`,
    table: 'comments',
    filter: `task_id=eq.${taskId}`,
    onInsert: (newComment) => {
      setComments((prev) => {
        if (prev.find(c => c.id === newComment.id)) return prev;
        return [...prev, newComment];
      });
    },
    onDelete: (old) => setComments((prev) => prev.filter(c => c.id !== old.id)),
    enabled: !!taskId,
  });

  // Scroll to bottom when comments change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    try {
      const { data } = await addComment(taskId, { content: content.trim() });
      setComments((prev) => [...prev, data.comment]);
      setContent('');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (commentId) => {
    await apiDeleteComment(commentId);
    setComments((prev) => prev.filter(c => c.id !== commentId));
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  // Highlight @mentions
  const renderContent = (text) =>
    text.split(/(@\w+)/g).map((part, i) =>
      part.startsWith('@')
        ? <span key={i} style={{ color: 'var(--accent)', fontWeight: 600 }}>{part}</span>
        : part
    );

  return (
    <div>
      <div className="comment-thread" style={{ maxHeight: '320px', overflowY: 'auto', paddingRight: '0.5rem' }}>
        {comments.length === 0 ? (
          <div className="empty-state" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>💬</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No comments yet. Be the first!</div>
          </div>
        ) : (
          comments.map((c) => {
            const author = c.author || { full_name: 'Unknown', avatar_url: null };
            const isOwn = c.user_id === user?.userId;
            return (
              <div key={c.id} className="comment-bubble" id={`comment-${c.id}`}>
                <div className="avatar avatar-sm" style={{ marginTop: '0.1rem' }}>
                  {author.avatar_url
                    ? <img src={author.avatar_url} alt={author.full_name} />
                    : getInitials(author.full_name)}
                </div>
                <div className="comment-body" style={{ flex: 1 }}>
                  <div className="comment-header">
                    <span className="comment-author">{author.full_name}</span>
                    <span className="comment-time">{timeAgo(c.created_at)}</span>
                    {isOwn && (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0.1rem 0.3rem', marginLeft: 'auto', color: 'var(--text-muted)' }}
                        onClick={() => handleDelete(c.id)}
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <div className="comment-content">{renderContent(c.content)}</div>
                  {c.attachment_url && (
                    <a href={c.attachment_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 mt-1 text-xs" style={{ color: 'var(--accent)' }}>
                      <Paperclip size={12} /> Attachment
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="comment-input-area" style={{ marginTop: '0.75rem', borderRadius: 'var(--radius)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
        <div className="avatar avatar-sm">
          {user?.avatar_url
            ? <img src={user.avatar_url} alt="" />
            : getInitials(user?.full_name)}
        </div>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
          <textarea
            id="comment-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment… use @name to mention"
            rows={1}
            style={{ flex: 1, resize: 'none', minHeight: '38px', maxHeight: '120px' }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={sending || !content.trim()}
            id="comment-send-btn"
            style={{ alignSelf: 'flex-end', flexShrink: 0 }}
          >
            {sending ? <span className="spinner spinner-sm" /> : <Send size={14} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommentThread;
