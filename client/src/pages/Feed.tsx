import React, { useState, useEffect, useRef, useCallback } from 'react';
import { feedService } from '../services/feedService';
import { Bookmark, Share2, Flag, MessageCircle, Heart, BookmarkCheck, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface Post {
  id: string;
  source: 'twitter' | 'reddit';
  content: string;
  author: string;
  date: string;
  link: string;
  thumbnail?: string;
  likes?: number;
  comments?: number;
}

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'twitter' | 'reddit'>('all');
  
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  // Fetch saved posts
  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        const saved = await feedService.getSavedPosts();
        setSavedPosts(new Set(saved.map(post => post.id)));
      } catch (error) {
        console.error('Error fetching saved posts:', error);
      }
    };
    
    fetchSavedPosts();
  }, []);

  // Fetch feed posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await feedService.getFeed(page);
        
        if (page === 1) {
          setPosts(response.posts);
        } else {
          setPosts(prevPosts => [...prevPosts, ...response.posts]);
        }
        
        setHasMore(!!response.nextPage);
      } catch (error) {
        console.error('Error fetching feed:', error);
        setError('Failed to load feed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPosts();
  }, [page]);

  const handleSavePost = async (postId: string) => {
    try {
      if (savedPosts.has(postId)) {
        await feedService.removeSavedPost(postId);
        setSavedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
        toast.success('Post removed from saved items');
      } else {
        await feedService.savePost(postId);
        setSavedPosts(prev => new Set(prev).add(postId));
        toast.success('Post saved successfully');
      }
    } catch (error) {
      toast.error('Failed to save post');
      console.error('Error saving post:', error);
    }
  };

  const handleSharePost = (post: Post) => {
    navigator.clipboard.writeText(post.link)
      .then(() => toast.success('Link copied to clipboard'))
      .catch(() => toast.error('Failed to copy link'));
  };

  const openReportModal = (postId: string) => {
    setReportingPostId(postId);
    setReportModalOpen(true);
  };

  const handleReportPost = async () => {
    if (!reportingPostId || !reportReason) return;
    
    try {
      await feedService.reportPost(reportingPostId, reportReason);
      toast.success('Post reported successfully');
      setReportModalOpen(false);
      setReportReason('');
      setReportingPostId(null);
    } catch (error) {
      toast.error('Failed to report post');
      console.error('Error reporting post:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredPosts = filter === 'all' 
    ? posts 
    : posts.filter(post => post.source === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Feed</h1>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Filter by:</span>
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                filter === 'all'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter('twitter')}
              className={`px-4 py-2 text-sm font-medium border-t border-b ${
                filter === 'twitter'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Twitter
            </button>
            <button
              type="button"
              onClick={() => setFilter('reddit')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
                filter === 'reddit'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Reddit
            </button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPosts.map((post, index) => {
          const isLastElement = index === filteredPosts.length - 1;
          return (
            <div
              ref={isLastElement ? lastPostElementRef : null}
              key={post.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {post.thumbnail && (
                <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                  <img 
                    src={post.thumbnail} 
                    alt={`Thumbnail for post by ${post.author}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black bg-opacity-70 rounded-md">
                    <span className="text-xs text-white capitalize">{post.source}</span>
                  </div>
                </div>
              )}
              
              <div className="p-5">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium">
                    {post.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">@{post.author}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(post.date)}</p>
                  </div>
                </div>
                
                <p className="mb-4 text-gray-800 dark:text-gray-200">{post.content}</p>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-4">
                    <button className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span className="text-xs">{post.likes || 0}</span>
                    </button>
                    <button className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-xs">{post.comments || 0}</span>
                    </button>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleSavePost(post.id)}
                      className={`p-1.5 rounded-full ${
                        savedPosts.has(post.id) 
                          ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      aria-label={savedPosts.has(post.id) ? "Unsave post" : "Save post"}
                    >
                      {savedPosts.has(post.id) ? (
                        <BookmarkCheck className="h-4 w-4" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </button>
                    
                    <button 
                      onClick={() => handleSharePost(post)}
                      className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      aria-label="Share post"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    
                    <a 
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      aria-label="Open original post"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    
                    <button 
                      onClick={() => openReportModal(post.id)}
                      className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      aria-label="Report post"
                    >
                      <Flag className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {!isLoading && filteredPosts.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 shadow rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No posts found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try changing your filter or check back later for new content.
          </p>
        </div>
      )}
      
      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Report Content</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Please select a reason for reporting this content. Your report will be reviewed by our moderation team.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for reporting
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select a reason</option>
                  <option value="spam">Spam</option>
                  <option value="harassment">Harassment</option>
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="misinformation">Misinformation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReportPost}
                  disabled={!reportReason}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;