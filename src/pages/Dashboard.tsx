import React, { useEffect, useState } from 'react';
import { supabase, ContentPost, Platform } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  PlusCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Calendar as CalendarIcon,
  Palette
} from 'lucide-react';

export function Dashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [postsResult, platformsResult] = await Promise.all([
        supabase.from('content_posts').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('platforms').select('*').eq('connected', true)
      ]);

      if (postsResult.data) setPosts(postsResult.data);
      if (platformsResult.data) setPlatforms(platformsResult.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      name: 'Total Posts',
      value: posts.length,
      icon: CalendarIcon,
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Scheduled',
      value: posts.filter(p => p.status === 'scheduled').length,
      icon: Clock,
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      name: 'Posted',
      value: posts.filter(p => p.status === 'posted').length,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'Connected Platforms',
      value: platforms.length,
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'scheduled': return 'bg-cyan-100 text-cyan-700';
      case 'posted': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.full_name}
          </h1>
          <p className="text-gray-600 mt-1">Manage your social media content with Pixlr AI</p>
        </div>
        <button
          onClick={() => onNavigate('editor')}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          Create Content
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Recent Posts</h2>
          </div>
          <div className="p-6">
            {posts.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No posts yet</p>
                <button
                  onClick={() => onNavigate('calendar')}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create your first post
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.slice(0, 5).map((post) => (
                  <div key={post.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 line-clamp-2">{post.caption || 'No caption'}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(post.status)}`}>
                          {post.status}
                        </span>
                        {post.scheduled_at && (
                          <span className="text-xs text-gray-500">
                            {new Date(post.scheduled_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Connected Platforms</h2>
          </div>
          <div className="p-6">
            {platforms.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No platforms connected</p>
                <button
                  onClick={() => onNavigate('connections')}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Connect a platform
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {platforms.map((platform) => (
                  <div key={platform.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{platform.name}</h3>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        Connected
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Palette className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Create stunning content with Pixlr AI</h3>
              <p className="text-purple-100">Generate, edit, and resize images for all your social platforms</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('editor')}
            className="px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors whitespace-nowrap"
          >
            Try Editor
          </button>
        </div>
      </div>
    </div>
  );
}
