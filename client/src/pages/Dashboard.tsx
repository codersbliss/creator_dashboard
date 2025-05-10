import React, { useEffect, useState } from 'react';
import { userService } from '../services/userService';
import { feedService } from '../services/feedService';
import { useAuth } from '../contexts/AuthContext';
import { Clock, BookOpen, Award, TrendingUp, CreditCard, Calendar, CheckCircle } from 'lucide-react';

interface CreditTransaction {
  _id: string;
  amount: number;
  reason: string;
  date: Date;
}

interface UserActivity {
  _id: string;
  action: string;
  details: string;
  date: Date;
}

interface SavedPost {
  id: string;
  source: 'twitter' | 'reddit';
  content: string;
  author: string;
  date: string;
  thumbnail?: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [creditStats, setCreditStats] = useState({ credits: 0, transactions: [] as CreditTransaction[] });
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [credits, activity, saved] = await Promise.all([
          userService.getCredits(),
          userService.getActivity(),
          feedService.getSavedPosts()
        ]);
        
        setCreditStats(credits);
        setActivities(activity);
        setSavedPosts(saved.slice(0, 3)); // Only show the 3 most recent saved posts
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Clock className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
      
      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-all hover:shadow-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Credits</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">{user?.credits}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-all hover:shadow-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Daily Login Streak</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">3 days</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-all hover:shadow-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Profile Completion</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {user?.profileCompleted ? '100%' : '70%'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent credit transactions */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
                <Award className="mr-2 h-5 w-5 text-blue-500" />
                Recent Credit Activity
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                Last 7 days
              </span>
            </div>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            {creditStats.transactions.length > 0 ? (
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                  {creditStats.transactions.map((transaction) => (
                    <li key={transaction._id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                          transaction.amount > 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                        }`}>
                          <span className={transaction.amount > 0 ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'}>
                            {transaction.amount > 0 ? '+' : '-'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {transaction.reason}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`text-sm font-semibold ${
                          transaction.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.amount > 0 ? `+${transaction.amount}` : transaction.amount} credits
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400">No recent credit activity</p>
              </div>
            )}
          </div>
          
          <div className="px-4 py-4 sm:px-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                View all credit history
              </span>
              <span className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Credits: <span className="ml-1 text-gray-900 dark:text-white font-bold">{user?.credits}</span>
              </span>
            </div>
          </div>
        </div>
        
        {/* Recent activity */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-purple-500" />
                Recent Activity
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
                Last 7 days
              </span>
            </div>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            {activities.length > 0 ? (
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                  {activities.map((activity) => (
                    <li key={activity._id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-gray-600 dark:text-gray-300 text-xs">
                            {activity.action.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {activity.action}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {activity.details}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
              </div>
            )}
          </div>
          
          <div className="px-4 py-4 sm:px-6 border-t border-gray-200 dark:border-gray-700">
            <a href="#" className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300">
              View all activity
            </a>
          </div>
        </div>
      </div>
      
      {/* Recently saved content */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-green-500" />
              Recently Saved Content
            </h3>
            <a href="/saved" className="text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300">
              View all saved content
            </a>
          </div>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          {savedPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {savedPosts.map((post) => (
                <div key={post.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {post.thumbnail && (
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 relative">
                      <img 
                        src={post.thumbnail} 
                        alt={`Thumbnail for post by ${post.author}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 px-2 py-1 bg-black bg-opacity-70 rounded-md">
                        <span className="text-xs text-white capitalize">{post.source}</span>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        @{post.author}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(post.date)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-3">
                      {post.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No saved content</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                You haven't saved any content yet. Start exploring the feed!
              </p>
              <div className="mt-6">
                <a
                  href="/feed"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go to feed
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;