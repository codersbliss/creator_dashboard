import api from './api';

interface Post {
  id: string;
  source: 'twitter' | 'reddit';
  content: string;
  author: string;
  date: string;
  link: string;
  thumbnail?: string;
}

interface FeedResponse {
  posts: Post[];
  nextPage?: string;
}

export const feedService = {
  getFeed: async (page = 1): Promise<FeedResponse> => {
    const response = await api.get(`/feed?page=${page}`);
    return response.data;
  },
  
  savePost: async (postId: string): Promise<void> => {
    await api.post('/feed/save', { postId });
  },
  
  reportPost: async (postId: string, reason: string): Promise<void> => {
    await api.post('/feed/report', { postId, reason });
  },
  
  getSavedPosts: async (): Promise<Post[]> => {
    const response = await api.get('/feed/saved');
    return response.data;
  },
  
  removeSavedPost: async (postId: string): Promise<void> => {
    await api.delete(`/feed/saved/${postId}`);
  }
};