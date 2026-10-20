import React, { useState, useEffect } from 'react';
import { FeedPost, FeedCategory, Student } from '../types';
import { 
  Heart, 
  Flame, 
  Leaf, 
  Lightbulb, 
  MessageCircle, 
  Send, 
  Trash2, 
  Sparkles,
  MapPin,
  Search,
  Users,
  RefreshCw,
  PlusCircle,
  ChevronDown,
  ChevronUp
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
  'Planted green herbs & flowers in botanical area',
  'Switched off all empty room lights & AC',
  'Bicycled or walked instead of motorized transport',
  'Used reusable bottle & reusable cloth bag',
  'Collected and segregated paper & cardboard',
  'Prepared a zero-waste packed meal',
  'Composted organic fruit & vegetable peels',
  'Upcycled packaging materials for prototypes',
];

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  posts,
  currentStudent,
  students = [],
  onAddPost,
  onReactToPost,
  onAddComment,
  onDeletePost,
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
      alert('Please sign in to share your eco actions on the feed.');
      return;
    }

    if (!content.trim()) {
      alert('Please describe what eco action or innovation you undertook!');
      return;
    }

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#5ef2ff', '#34d399', '#a78bfa', '#fde047'],
      });
    } catch {
      // ignore
    }

    onAddPost({
      grNo: currentStudent.grNo,
      authorName: currentStudent.name,
      authorRole: currentStudent.role || 'Member',
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
    setPostBanner('Action shared with the community! Members can now interact, cheer, and collaborate.');

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
    <div className="space-y-6">
      
      {/* Feed Hero Header */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#080c1b]/80 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="hud-pill">
                <span className="hud-dot" />
                <span>ECO FEED // LIVE</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-400/30 text-violet-300 text-xs font-mono font-medium">
                {posts.length} Community Updates
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display">
              Verde Tech <span className="stai-gradient-text">Eco Feed</span>
            </h1>
            
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Real-time community social feed. Share verified green deeds, upcycling projects, clean energy tips, and cheer on fellow sustainability innovators.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onRefreshFeed && (
              <button
                onClick={handleRefreshClick}
                disabled={isRefreshing}
                className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-cyan-300 font-mono text-xs transition-all flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
                <span>{isRefreshing ? 'Syncing...' : 'Sync Feed'}</span>
              </button>
            )}

            {onOpenNetworkModal && (
              <button
                onClick={onOpenNetworkModal}
                className="btn-stai-outline"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Member Network</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Post Banner Notification */}
      {postBanner && (
        <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-400/40 text-cyan-200 text-sm flex items-center gap-3 animate-fadeIn">
          <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
          <span>{postBanner}</span>
        </div>
      )}

      {/* Post Composer */}
      {currentStudent && (
        <div className="stai-card p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-cyan-400/40 p-0.5 overflow-hidden bg-slate-900 shrink-0">
                <img
                  src={currentStudent.avatarUrl || '/laxman_sree_ram.jpg'}
                  alt={currentStudent.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-display">
                  Share Your Eco Action, {currentStudent.name}
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  Broadcast your sustainability initiatives to the network
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsComposerOpen(!isComposerOpen)}
              className="text-xs font-mono text-slate-400 hover:text-cyan-400 flex items-center gap-1"
            >
              <span>{isComposerOpen ? 'Collapse' : 'Expand'}</span>
              {isComposerOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {isComposerOpen && (
            <form onSubmit={handlePostSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-cyan-300 uppercase tracking-wider mb-1.5">
                    Action Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FeedCategory)}
                    className="w-full bg-black/60 border border-white/15 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 outline-none transition-colors"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-slate-950 text-slate-200">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-cyan-300 uppercase tracking-wider mb-1.5">
                    Headline / Quick Tag
                  </label>
                  <input
                    type="text"
                    value={doingTag}
                    onChange={(e) => setDoingTag(e.target.value)}
                    placeholder="e.g. Upcycled 12 Plastic Containers"
                    className="w-full bg-black/60 border border-white/15 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 placeholder-slate-500 outline-none transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-mono text-cyan-300 uppercase tracking-wider mb-1.5">
                    Action Description & Eco Tip *
                  </label>
                  <textarea
                    rows={3}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Describe what eco-action you took today, why it matters, or share a practical tip..."
                    className="w-full bg-black/60 border border-white/15 focus:border-cyan-400 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-cyan-300 uppercase tracking-wider mb-1.5">
                    Photo URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-black/60 border border-white/15 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 placeholder-slate-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-cyan-300 uppercase tracking-wider mb-1.5">
                    Location / Zone (Optional)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Solar Pavilion / Resource Station"
                    className="w-full bg-black/60 border border-white/15 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 placeholder-slate-500 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Suggestions */}
              <div className="pt-2">
                <span className="block text-[11px] font-mono text-slate-400 mb-2">
                  Quick Prompts:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {DOING_SUGGESTIONS.slice(0, 5).map((sugg) => (
                    <button
                      key={sugg}
                      type="button"
                      onClick={() => setDoingTag(sugg)}
                      className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-400/40 text-slate-300 hover:text-cyan-300 text-xs font-mono transition-all"
                    >
                      + {sugg}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-white/10">
                <button
                  type="submit"
                  className="btn-stai-cyan text-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish Action</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="stai-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search actions, contributors, tags..."
              className="w-full bg-black/50 border border-white/10 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 outline-none transition-colors"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full bg-black/50 border border-white/10 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 outline-none transition-colors"
            >
              <option value="All" className="bg-slate-950">All Categories ({posts.length})</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-950">{cat}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full bg-black/50 border border-white/10 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 outline-none transition-colors"
            >
              <option value="All" className="bg-slate-950">All Locations</option>
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc} className="bg-slate-950">{loc}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Posts Stream */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="stai-card p-12 text-center">
            <Sparkles className="w-12 h-12 text-cyan-400 mx-auto mb-3 opacity-60" />
            <h4 className="text-xl font-bold font-display text-white mb-2">No Community Updates Found</h4>
            <p className="text-sm text-slate-400 mb-4 max-w-md mx-auto">
              Be the first to share your sustainability actions or reset your filters to view all entries.
            </p>
            <button
              onClick={() => { setSelectedFilter('All'); setSelectedLocation('All'); setSearchQuery(''); }}
              className="btn-stai-outline"
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
              <article key={post.id} className="stai-card p-6 transition-all hover:border-cyan-400/30">
                
                {/* Author Info & Category */}
                <div className="flex items-center justify-between gap-4 pb-4 mb-4 border-b border-white/10">
                  <div 
                    onClick={() => handleAuthorClick(post.grNo, post.authorName)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="w-11 h-11 rounded-full border border-cyan-400/40 p-0.5 overflow-hidden bg-slate-900 group-hover:border-cyan-300 transition-colors shrink-0">
                      <img
                        src={post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={post.authorName}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white group-hover:text-cyan-300 transition-colors text-sm">
                          {post.authorName}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan-950/60 text-cyan-400 border border-cyan-400/20">
                          {post.authorRole || 'Contributor'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-0.5">
                        <span>ID: {post.grNo}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(post.timestamp)}</span>
                        {post.location && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-emerald-400">
                              <MapPin className="w-3 h-3" />
                              <span>{post.location}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
                      {post.category}
                    </span>
                    {isMyPost && (
                      <button
                        onClick={() => onDeletePost(post.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Title / Doing Tag */}
                {post.title && (
                  <h4 className="text-base sm:text-lg font-bold text-white font-display mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{post.title}</span>
                  </h4>
                )}

                {/* Content */}
                <p className="text-slate-300 text-sm leading-relaxed mb-4 whitespace-pre-line">
                  {post.content}
                </p>

                {/* Optional Photo */}
                {post.photoUrl && (
                  <div className="mb-4 rounded-2xl border border-white/10 overflow-hidden bg-black/40">
                    <img
                      src={post.photoUrl}
                      alt="Action proof"
                      className="w-full max-h-[380px] object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Reactions & Comments Count */}
                <div className="flex flex-wrap items-center justify-between pt-4 border-t border-white/10 gap-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onReactToPost(post.id, 'cheer')}
                      className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-400/30 text-xs font-mono text-slate-300 hover:text-red-300 transition-all flex items-center gap-1.5"
                    >
                      <Heart className="w-3.5 h-3.5 text-red-400" />
                      <span>Cheer ({post.reactions?.cheer || 0})</span>
                    </button>

                    <button
                      onClick={() => onReactToPost(post.id, 'fire')}
                      className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-400/30 text-xs font-mono text-slate-300 hover:text-amber-300 transition-all flex items-center gap-1.5"
                    >
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>Fire ({post.reactions?.fire || 0})</span>
                    </button>

                    <button
                      onClick={() => onReactToPost(post.id, 'leaf')}
                      className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-400/30 text-xs font-mono text-slate-300 hover:text-emerald-300 transition-all flex items-center gap-1.5"
                    >
                      <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Eco ({post.reactions?.leaf || 0})</span>
                    </button>

                    <button
                      onClick={() => onReactToPost(post.id, 'lightbulb')}
                      className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-yellow-500/10 border border-white/10 hover:border-yellow-400/30 text-xs font-mono text-slate-300 hover:text-yellow-300 transition-all flex items-center gap-1.5"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
                      <span>Tip ({post.reactions?.lightbulb || 0})</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setActiveCommentPostId(isCommentingOpen ? null : post.id)}
                    className="px-3 py-1.5 rounded-full bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-400/30 text-xs font-mono text-cyan-300 transition-all flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Comments ({commentsList.length})</span>
                  </button>
                </div>

                {/* Comments Section */}
                {isCommentingOpen && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-3 bg-black/40 p-4 rounded-2xl">
                    <h5 className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                      Discussion & Collaborations
                    </h5>
                    
                    {commentsList.length === 0 ? (
                      <p className="text-xs font-mono text-slate-500 italic">
                        No comments yet. Be the first to share thoughts or encourage this member!
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {commentsList.map((comm) => (
                          <div key={comm.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-white font-mono">{comm.authorName}</span>
                              <span className="text-[10px] font-mono text-slate-500">{formatRelativeTime(comm.timestamp)}</span>
                            </div>
                            <p className="text-xs text-slate-300 m-0">{comm.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {currentStudent ? (
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSendComment(post.id); }}
                          placeholder="Write a constructive thought or cheer..."
                          className="flex-1 bg-black/60 border border-white/15 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 outline-none transition-colors"
                        />
                        <button
                          onClick={() => handleSendComment(post.id)}
                          className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send</span>
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs font-mono text-slate-500">Sign in to join the conversation.</p>
                    )}
                  </div>
                )}

              </article>
            );
          })
        )}
      </div>

    </div>
  );
};
