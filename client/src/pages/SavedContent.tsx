import React, { useState, useEffect } from 'react';
import { feedService } from '../services/feedService';
import { Trash2, ExternalLink, BookmarkX } from 'lucide-react';
import toast from 'react-hot-toast';

interface SavedPost {
  id: string;
  source: 'twitter' | 'reddit';
  content: string;
  author: string;
  date: string;
  link: string;
  thumbnail?: string;
}

const SavedContent: React.FC = () => {
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'twitter' | 'reddit'>('all');

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        setIsLoading(true);
        const posts = await feedService.getSavedPosts();
        setSavedPosts(posts);
      } catch (error) {
        console.error('Error fetching saved posts:', error);
        toast.error('Failed to load saved content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedPosts();
  }, []);

  const handleRemovePost = async (postId: string) => {
    try {
      await feedService.removeSavedPost(postId);
      setSavedPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      toast.success('Post removed from saved items');
    } catch (error) {
      console.error('Error removing saved post:', error);
      toast.error('Failed to remove post');
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredPosts = filter === 'all' 
    ? savedPosts 
    : savedPosts.filter(post => post.source === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Saved Content</h1>
        
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
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div 
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
                
                <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Original
                  </a>
                  
                  <button
                    onClick={() => handleRemovePost(post.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-gray-800 shadow rounded-lg">
          <BookmarkX className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No saved content</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            You haven't saved any content yet.
          </p>
          <div className="mt-6">
            <a
              href="/feed"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Explore feed
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedContent;