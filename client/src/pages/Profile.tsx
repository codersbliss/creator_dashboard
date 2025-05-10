import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { User, Star, MailCheck, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileForm {
  name: string;
  email: string;
  bio: string;
  website: string;
  location: string;
  avatar?: File | null;
}

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState<ProfileForm>({
    name: '',
    email: '',
    bio: '',
    website: '',
    location: '',
    avatar: null
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileProgress, setProfileProgress] = useState(0);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profile = await userService.getProfile();
        
        setForm({
          name: profile.name || '',
          email: profile.email || '',
          bio: profile.bio || '',
          website: profile.website || '',
          location: profile.location || '',
          avatar: null
        });
        
        // Calculate profile completion
        calculateProfileProgress({
          name: profile.name || '',
          email: profile.email || '',
          bio: profile.bio || '',
          website: profile.website || '',
          location: profile.location || '',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const calculateProfileProgress = (data: Omit<ProfileForm, 'avatar'>) => {
    const fields = ['name', 'email', 'bio', 'website', 'location'];
    const completedFields = fields.filter(field => !!data[field as keyof typeof data]);
    const progress = Math.round((completedFields.length / fields.length) * 100);
    setProfileProgress(progress);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => {
      const newForm = { ...prev, [name]: value };
      calculateProfileProgress(newForm);
      return newForm;
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setForm(prev => ({ ...prev, avatar: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const updatedProfile = await userService.updateProfile({
        name: form.name,
        bio: form.bio,
        website: form.website,
        location: form.location,
      });
      
      updateUser(updatedProfile);
      toast.success('Profile updated successfully');

      // If profile is now completed, award credits
      if (profileProgress === 100 && !user?.profileCompleted) {
        toast.success('You earned 50 credits for completing your profile!', {
          icon: '🎉',
        });
        updateUser({ credits: (user?.credits || 0) + 50, profileCompleted: true });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Profile</h1>
          
          <div className="mb-6">
            <div className="flex items-center">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile Completion</h3>
                <div className="mt-1 flex items-center">
                  <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="absolute top-0 left-0 h-2 rounded-full bg-blue-600" 
                      style={{ width: `${profileProgress}%` }}
                    ></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {profileProgress}%
                  </span>
                </div>
              </div>
              
              {profileProgress === 100 ? (
                <div className="ml-4 flex items-center text-green-600 dark:text-green-400">
                  <Star className="h-5 w-5 mr-1" />
                  <span className="text-sm font-medium">Complete!</span>
                </div>
              ) : (
                <div className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                  {100 - profileProgress}% to go
                </div>
              )}
            </div>
            
            {!user?.profileCompleted && profileProgress < 100 && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Complete your profile to earn 50 credits!
              </p>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div className="flex flex-col-reverse md:flex-row md:space-x-6">
                <div className="flex-1 space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      <User className="h-4 w-4 inline mr-1" /> Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      <MailCheck className="h-4 w-4 inline mr-1" /> Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={form.email}
                      disabled
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 sm:text-sm cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Email address cannot be changed
                    </p>
                  </div>
                </div>
                
                <div className="mb-6 md:mb-0">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-300 dark:border-gray-600">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-gray-400">{form.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        id="avatar"
                        name="avatar"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                      <label
                        htmlFor="avatar"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                      >
                        Change
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  value={form.bio}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm"
                  placeholder="Tell us about yourself"
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm"
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm"
                  placeholder="City, Country"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Profile'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Account Information</h2>
          
          <dl className="divide-y divide-gray-200 dark:divide-gray-700">
            <div className="py-4 flex justify-between">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Member since</dt>
              <dd className="text-sm text-gray-900 dark:text-white flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
              </dd>
            </div>
            <div className="py-4 flex justify-between">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Account type</dt>
              <dd className="text-sm text-gray-900 dark:text-white">
                {user?.role === 'admin' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
                    Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                    Creator
                  </span>
                )}
              </dd>
            </div>
            <div className="py-4 flex justify-between">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Credit balance</dt>
              <dd className="text-sm text-gray-900 dark:text-white font-medium">{user?.credits} credits</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Profile;