import api from './api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  credits: number;
  profileCompleted: boolean;
  lastLogin: Date;
  createdAt: Date;
}

interface CreditTransaction {
  _id: string;
  userId: string;
  amount: number;
  reason: string;
  date: Date;
}

interface UserActivity {
  _id: string;
  userId: string;
  action: string;
  details: string;
  date: Date;
}

export const userService = {
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },
  
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.put('/users/me', userData);
    return response.data;
  },
  
  getCredits: async (): Promise<{ credits: number; transactions: CreditTransaction[] }> => {
    const response = await api.get('/users/credits');
    return response.data;
  },
  
  getActivity: async (): Promise<UserActivity[]> => {
    const response = await api.get('/users/activity');
    return response.data;
  },
  
  // Admin endpoints
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  
  getUserById: async (userId: string): Promise<User> => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },
  
  updateUserCredits: async (userId: string, amount: number, reason: string): Promise<User> => {
    const response = await api.post(`/admin/users/${userId}/credits`, { amount, reason });
    return response.data;
  },

};