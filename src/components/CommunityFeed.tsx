import React, { useState, useEffect } from 'react';
import { FeedPost, FeedComment, FeedCategory, Student } from '../types';
import { 
  Heart, 
  Flame, 
  Leaf, 
  Lightbulb, 
  MessageCircle, 
  Send, 
  Trash2, 
  Image as ImageIcon, 
  Sparkles,
  MapPin,
  Tag,
  Search,
  Users,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'Just now';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return 'Just now';
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 45) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

interface CommunityFeedProps {
  posts: FeedPost[];
  currentStudent: Student | null;
  students?: Student[];
  onAddPost: (post: Omit<FeedPost, 'id' | 'timestamp' | 'reactions' | 'comments'>) => void;
  onReactToPost: (postId: string, reactionType: 'cheer' | 'fire' | 'leaf' | 'lightbulb') => void;
  onAddComment: (postId: string, commentText: string) => void;
  onDeletePost: (postId: string) => void;
  onClearAllPosts?: () => void;
  onRefreshFeed?: () => Promise<void> | void;
  onSelectStudent?: (student: Student) => void;
  onOpenNetworkModal?: () => void;
}

const CATEGORIES: FeedCategory[] = [
  '🌱 Nature & Planting',
  '♻️ Recycling & Upcycling',
  '💡 Energy Saving',
  '🚴 Clean Commute',
  '🥗 Zero Waste & Food',
  '🌍 Everyday Green Doing',
];

const DOING_SUGGESTIONS = [
  'Planted green herbs & flowers in school garden',
  'Switched off all empty classroom lights & AC',
  'Bicycled / walked to campus instead of motor ride',
  'Used reusable stainless steel bottle & cloth bag',
  'Collected and segregated paper & cardboard',
  'Made a zero-waste homemade packed lunch',
  'Composted vegetable peels & fruit skins',
  'Repaired & upcycled an old backpack',
];

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  posts,
  currentStudent,
  students = [],
  onAddPost,
  onReactToPost,
  onAddComment,
  onDeletePost,
  onClearAllPosts,
  onRefreshFeed,
  onSelectStudent,
  onOpenNetworkModal,
}) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<FeedCategory>('🌱 Nature & Planting');
  const [doingTag, setDoingTag] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [location, setLocation] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(true);
  const [postBanner, setPostBanner] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  const handleRefreshClick = async () => {
    if (onRefreshFeed) {
      try {
        setIsRefreshing(true);
        await onRefreshFeed();
      } finally {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };

  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const uniqueLocations = Array.from(new Set(posts.map((p) => p.location).filter(Boolean))) as string[];

  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) {
      alert('Please sign in to interact and share your daily green doings on the feed.');
      return;
    }

    if (!content.trim()) {
      alert('Please describe what green action or doing you took today!');
      return;
    }

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#198754', '#ffc107', '#0dcaf0', '#20c997'],
      });
    } catch {
      // ignore
    }

    onAddPost({
      grNo: currentStudent.grNo,
      authorName: currentStudent.name,
      authorRole: currentStudent.role || 'Student',
      authorAvatar: currentStudent.avatarUrl,
      title: doingTag.trim() || undefined,
      content: content.trim(),
      category,
      doingTag: doingTag.trim() || undefined,
      photoUrl: photoUrl.trim() || undefined,
      location: location.trim() || currentStudent.location || undefined,
    });

    setContent('');
    setDoingTag('');
    setPhotoUrl('');
    setLocation('');
    setPostBanner('Your doing was shared with the community! Fellow peers can now interact, cheer, and comment.');

    setTimeout(() => {
      setPostBanner(null);
    }, 6000);
  };

  const handleSendComment = (postId: string) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;

    if (!currentStudent) {
      alert('Please sign in to comment on community posts.');
      return;
    }

    onAddComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleAuthorClick = (grNo: string, authorName: string) => {
    if (!onSelectStudent) return;
    const found = students.find((s) => s.grNo === grNo);
    if (found) {
      onSelectStudent(found);
    } else {
      onSelectStudent({
        grNo,
        name: authorName,
        grade: 'Eco Contributor',
        points: 100,
        weeklyPoints: 20,
        rank: 99,
        badges: [],
        co2SavedKg: 10,
        waterSavedLiters: 50,
        wasteDivertedKg: 15,
        energySavedKwh: 20,
        joinedDate: '2026',
      });
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedFilter === 'All' || post.category === selectedFilter;
    const matchesLocation = selectedLocation === 'All' || post.location === selectedLocation;
    const matchesSearch = 
      !searchQuery.trim() ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.doingTag && post.doingTag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.location && post.location.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesLocation && matchesSearch;
  });

  return (
    <div className="container py-4 space-y-4">
      
      {/* Feed Header */}
      <div className="card bg-success text-white p-4 p-md-5 rounded-0 border border-4 border-dark shadow-[6px_6px_0px_0px_black]">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4">
          <div className="space-y-2">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
              <span className="badge bg-dark text-white fw-bold px-3 py-2 rounded-0 border border-2 border-white">
                <Users className="w-3.5 h-3.5 me-1 text-success" />
                Peer Social Wall
              </span>
              <span className="badge bg-warning text-dark fw-bold px-3 py-2 rounded-0 border border-2 border-dark">
                Live Feed Active
              </span>
              <span className="badge bg-light text-dark fw-bold px-3 py-2 rounded-0 border border-2 border-dark">
                💬 {posts.length} Community Updates
              </span>
            </div>
            
            <h1 className="display-6 fw-black text-white text-uppercase m-0">
              Verde Tech Community Feed
            </h1>
            
            <p className="text-light fw-medium fs-6 m-0 opacity-90">
              A dedicated social space for peers to interact, discuss, and cheer each other on regarding daily green doings, sustainable lifestyles, and eco tips. Real-time updates sync instantly across campus!
            </p>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            {onRefreshFeed && (
              <button
                onClick={handleRefreshClick}
                disabled={isRefreshing}
                className="btn btn-light text-dark fw-bold rounded-0 border border-3 border-dark px-3 py-2 shadow-[2px_2px_0px_0px_black] d-flex align-items-center gap-1"
              >
                <RefreshCw className={`w-4 h-4 text-success ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Syncing...' : 'Refresh Feed'}</span>
              </button>
            )}
            {onOpenNetworkModal && (
              <button
                onClick={onOpenNetworkModal}
                className="btn btn-warning text-dark fw-bold rounded-0 border border-3 border-dark px-3 py-2 shadow-[2px_2px_0px_0px_black] d-flex align-items-center gap-1"
              >
                <Users className="w-4 h-4" />
                <span>Campus Peer Network</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {postBanner && (
        <div className="alert alert-success rounded-0 border border-3 border-dark fw-bold text-dark shadow-[4px_4px_0px_0px_black] d-flex align-items-center justify-content-between">
          <span>{postBanner}</span>
          <button className="btn-close" onClick={() => setPostBanner(null)}></button>
        </div>
      )}

      {/* Share / Composer Section */}
      {currentStudent && (
        <div className="card bg-white text-dark rounded-0 border border-4 border-dark shadow-[6px_6px_0px_0px_black] p-4">
          <div className="d-flex align-items-center justify-content-between mb-3 border-bottom border-dark pb-3">
            <div className="d-flex align-items-center gap-3">
              <img
                src={currentStudent.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={currentStudent.name}
                className="rounded-circle border border-2 border-dark"
                style={{ width: '48px', height: '48px', objectFit: 'cover' }}
              />
              <div>
                <h5 className="fw-black text-uppercase m-0">Share What Green Action You Did</h5>
                <p className="text-muted small m-0">Posting as {currentStudent.name} ({currentStudent.grNo})</p>
              </div>
            </div>
            <button
              onClick={() => setIsComposerOpen(!isComposerOpen)}
              className="btn btn-outline-dark btn-sm rounded-0 fw-bold border-2"
            >
              {isComposerOpen ? 'Minimize' : 'Expand Form'}
            </button>
          </div>

          {isComposerOpen && (
            <form onSubmit={handlePostSubmit} className="space-y-3">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold text-uppercase small">Category of Doing</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FeedCategory)}
                    className="form-select rounded-0 border-2 border-dark fw-medium"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold text-uppercase small">Quick Doing Tag / Title</label>
                  <input
                    type="text"
                    value={doingTag}
                    onChange={(e) => setDoingTag(e.target.value)}
                    placeholder="e.g. Planted 5 Hibiscus Saplings"
                    className="form-control rounded-0 border-2 border-dark fw-medium"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-bold text-uppercase small">Describe Your Green Action / Eco Tip *</label>
                  <textarea
                    rows={3}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tell your peers what eco action you completed today..."
                    className="form-control rounded-0 border-2 border-dark fw-medium"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold text-uppercase small">Photo URL (Optional)</label>
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="form-control rounded-0 border-2 border-dark fw-medium"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold text-uppercase small">Campus Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. School Botanical Garden / Block B"
                    className="form-control rounded-0 border-2 border-dark fw-medium"
                  />
                </div>
              </div>

              {/* Suggestions */}
              <div className="pt-2">
                <span className="d-block small fw-bold text-uppercase text-muted mb-2">Quick One-Tap Prompts:</span>
                <div className="d-flex flex-wrap gap-1">
                  {DOING_SUGGESTIONS.slice(0, 5).map((sugg) => (
                    <button
                      key={sugg}
                      type="button"
                      onClick={() => setDoingTag(sugg)}
                      className="btn btn-sm btn-outline-success rounded-0 border-dark fw-medium text-dark bg-light"
                    >
                      + {sugg}
                    </button>
                  ))}
                </div>
              </div>

              <div className="d-flex justify-content-end pt-3 border-top border-dark">
                <button
                  type="submit"
                  className="btn btn-success text-white fw-black text-uppercase rounded-0 border border-3 border-dark px-4 py-2 shadow-[4px_4px_0px_0px_black] d-flex align-items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish to Feed</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card bg-white text-dark rounded-0 border border-4 border-dark shadow-[4px_4px_0px_0px_black] p-3">
        <div className="row g-3 align-items-center">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-dark text-white rounded-0 border-dark">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts, authors, tags..."
                className="form-control rounded-0 border-2 border-dark fw-medium"
              />
            </div>
          </div>

          <div className="col-md-4">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="form-select rounded-0 border-2 border-dark fw-bold text-uppercase small"
            >
              <option value="All">All Categories ({posts.length})</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="form-select rounded-0 border-2 border-dark fw-bold text-uppercase small"
            >
              <option value="All">All Campus Locations</option>
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Posts Stream */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="card bg-white text-dark rounded-0 border border-4 border-dark p-5 text-center shadow-[4px_4px_0px_0px_black]">
            <Sparkles className="w-12 h-12 text-success mx-auto mb-3" />
            <h4 className="fw-black text-uppercase">No Community Posts Found</h4>
            <p className="text-muted fw-medium mb-3">Be the first to share your daily green action or adjust your filters!</p>
            <button
              onClick={() => { setSelectedFilter('All'); setSelectedLocation('All'); setSearchQuery(''); }}
              className="btn btn-success text-white fw-bold rounded-0 border border-2 border-dark px-4 py-2"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isMyPost = currentStudent && currentStudent.grNo === post.grNo;
            const commentsList = post.comments || [];
            const isCommentingOpen = activeCommentPostId === post.id;

            return (
              <div key={post.id} className="card bg-white text-dark rounded-0 border border-4 border-dark shadow-[6px_6px_0px_0px_black] p-4">
                
                {/* Author Info & Category */}
                <div className="d-flex align-items-center justify-content-between mb-3 border-bottom border-dark pb-3">
                  <div 
                    onClick={() => handleAuthorClick(post.grNo, post.authorName)}
                    className="d-flex align-items-center gap-3 cursor-pointer"
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={post.authorName}
                      className="rounded-circle border border-2 border-dark"
                      style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                    />
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <h6 className="fw-black text-uppercase m-0">{post.authorName}</h6>
                        <span className="badge bg-success text-white rounded-0 fw-bold px-2 py-1 small">{post.authorRole || 'Student'}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2 text-muted small mt-1">
                        <span>GR: {post.grNo}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(post.timestamp)}</span>
                        {post.location && (
                          <>
                            <span>•</span>
                            <span className="d-flex align-items-center gap-1 text-success fw-bold">
                              <MapPin className="w-3.5 h-3.5" />
                              {post.location}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-warning text-dark fw-bold px-2 py-1 rounded-0 border border-1 border-dark small">
                      {post.category}
                    </span>
                    {isMyPost && (
                      <button
                        onClick={() => onDeletePost(post.id)}
                        className="btn btn-outline-danger btn-sm rounded-0 border-2"
                        title="Delete post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Title / Tag */}
                {post.title && (
                  <h5 className="fw-black text-uppercase text-success mb-2">
                    {post.title}
                  </h5>
                )}

                {/* Content */}
                <p className="text-dark fw-medium fs-6 mb-3" style={{ whiteSpace: 'pre-line' }}>
                  {post.content}
                </p>

                {/* Photo */}
                {post.photoUrl && (
                  <div className="mb-3 border border-3 border-dark overflow-hidden bg-light">
                    <img
                      src={post.photoUrl}
                      alt="Green Doing Photo"
                      className="w-100"
                      style={{ maxHeight: '350px', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Reactions & Comments Count */}
                <div className="d-flex flex-wrap align-items-center justify-content-between pt-3 border-top border-dark gap-2">
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      onClick={() => onReactToPost(post.id, 'cheer')}
                      className="btn btn-sm btn-outline-dark rounded-0 fw-bold border-2 d-flex align-items-center gap-1 bg-light"
                    >
                      <Heart className="w-4 h-4 text-danger fill-danger" />
                      <span>Cheer ({post.reactions?.cheer || 0})</span>
                    </button>
                    <button
                      onClick={() => onReactToPost(post.id, 'fire')}
                      className="btn btn-sm btn-outline-dark rounded-0 fw-bold border-2 d-flex align-items-center gap-1 bg-light"
                    >
                      <Flame className="w-4 h-4 text-warning fill-warning" />
                      <span>Fire ({post.reactions?.fire || 0})</span>
                    </button>
                    <button
                      onClick={() => onReactToPost(post.id, 'leaf')}
                      className="btn btn-sm btn-outline-dark rounded-0 fw-bold border-2 d-flex align-items-center gap-1 bg-light"
                    >
                      <Leaf className="w-4 h-4 text-success fill-success" />
                      <span>Leaf ({post.reactions?.leaf || 0})</span>
                    </button>
                    <button
                      onClick={() => onReactToPost(post.id, 'lightbulb')}
                      className="btn btn-sm btn-outline-dark rounded-0 fw-bold border-2 d-flex align-items-center gap-1 bg-light"
                    >
                      <Lightbulb className="w-4 h-4 text-warning fill-warning" />
                      <span>Tip ({post.reactions?.lightbulb || 0})</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setActiveCommentPostId(isCommentingOpen ? null : post.id)}
                    className="btn btn-sm btn-outline-success rounded-0 fw-bold border-2 d-flex align-items-center gap-1"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Comments ({commentsList.length})</span>
                  </button>
                </div>

                {/* Comments Section */}
                {isCommentingOpen && (
                  <div className="mt-3 pt-3 border-top border-dark bg-light p-3">
                    <h6 className="fw-black text-uppercase small mb-2">Discussion & Cheers</h6>
                    
                    {commentsList.length === 0 ? (
                      <p className="text-muted small fst-italic mb-3">No comments yet. Be the first to encourage this peer!</p>
                    ) : (
                      <div className="space-y-2 mb-3">
                        {commentsList.map((comm) => (
                          <div key={comm.id} className="bg-white p-2.5 border border-2 border-dark rounded-0">
                            <div className="d-flex align-items-center justify-content-between">
                              <span className="fw-bold small text-success">{comm.authorName}</span>
                              <span className="text-muted xsmall">{formatRelativeTime(comm.timestamp)}</span>
                            </div>
                            <p className="text-dark small m-0 mt-1">{comm.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {currentStudent ? (
                      <div className="input-group">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSendComment(post.id); }}
                          placeholder="Write an encouraging comment..."
                          className="form-control rounded-0 border-2 border-dark fw-medium"
                        />
                        <button
                          onClick={() => handleSendComment(post.id)}
                          className="btn btn-success text-white fw-bold rounded-0 border border-2 border-dark px-3"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-muted small m-0">Please sign in to write a comment.</p>
                    )}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
