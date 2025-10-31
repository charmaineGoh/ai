import React, { useEffect, useState } from 'react';
import { supabase, Analytics as AnalyticsType, Post } from '../lib/supabase';
import {
  TrendingUp,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  MousePointerClick,
  Instagram,
  Linkedin,
  Twitter,
  Facebook
} from 'lucide-react';

export function Analytics() {
  const [analytics, setAnalytics] = useState<(AnalyticsType & { post?: Post })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('analytics')
        .select('*, post:posts(*)')
        .order('fetched_at', { ascending: false });

      if (error) throw error;
      setAnalytics(data || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalStats = analytics.reduce(
    (acc, curr) => ({
      likes: acc.likes + curr.likes,
      comments: acc.comments + curr.comments,
      shares: acc.shares + curr.shares,
      impressions: acc.impressions + curr.impressions,
      clicks: acc.clicks + curr.clicks
    }),
    { likes: 0, comments: 0, shares: 0, impressions: 0, clicks: 0 }
  );

  const avgEngagementRate =
    analytics.length > 0
      ? (analytics.reduce((acc, curr) => acc + curr.engagement_rate, 0) / analytics.length).toFixed(2)
      : '0.00';

  const stats = [
    {
      name: 'Total Likes',
      value: totalStats.likes.toLocaleString(),
      icon: Heart,
      color: 'from-red-500 to-pink-500'
    },
    {
      name: 'Total Comments',
      value: totalStats.comments.toLocaleString(),
      icon: MessageCircle,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Total Shares',
      value: totalStats.shares.toLocaleString(),
      icon: Share2,
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'Avg Engagement',
      value: `${avgEngagementRate}%`,
      icon: TrendingUp,
      color: 'from-orange-500 to-amber-500'
    }
  ];

  const platformIcons: Record<string, any> = {
    instagram: Instagram,
    linkedin: Linkedin,
    twitter: Twitter,
    facebook: Facebook
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Track your content performance across all platforms</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Post Performance</h2>
          </div>
          <div className="p-6">
            {analytics.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No analytics data yet</p>
                <p className="text-sm text-gray-500">Publish some posts to see performance metrics</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.slice(0, 10).map((item) => {
                  const PlatformIcon = platformIcons[item.platform] || Twitter;
                  return (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="bg-gray-100 p-2 rounded-lg">
                            <PlatformIcon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {(item as any).post?.title || 'Untitled Post'}
                            </h3>
                            <p className="text-sm text-gray-500 capitalize">{item.platform}</p>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-blue-600">
                          {item.engagement_rate.toFixed(2)}%
                        </span>
                      </div>

                      <div className="grid grid-cols-5 gap-4">
                        <div className="text-center">
                          <Heart className="w-4 h-4 text-red-500 mx-auto mb-1" />
                          <p className="text-sm font-semibold text-gray-900">{item.likes}</p>
                          <p className="text-xs text-gray-500">Likes</p>
                        </div>
                        <div className="text-center">
                          <MessageCircle className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                          <p className="text-sm font-semibold text-gray-900">{item.comments}</p>
                          <p className="text-xs text-gray-500">Comments</p>
                        </div>
                        <div className="text-center">
                          <Share2 className="w-4 h-4 text-green-500 mx-auto mb-1" />
                          <p className="text-sm font-semibold text-gray-900">{item.shares}</p>
                          <p className="text-xs text-gray-500">Shares</p>
                        </div>
                        <div className="text-center">
                          <Eye className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                          <p className="text-sm font-semibold text-gray-900">{item.impressions}</p>
                          <p className="text-xs text-gray-500">Views</p>
                        </div>
                        <div className="text-center">
                          <MousePointerClick className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                          <p className="text-sm font-semibold text-gray-900">{item.clicks}</p>
                          <p className="text-xs text-gray-500">Clicks</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Platform Breakdown</h3>
            {analytics.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No data available</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(
                  analytics.reduce((acc, curr) => {
                    acc[curr.platform] = (acc[curr.platform] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([platform, count]) => {
                  const PlatformIcon = platformIcons[platform] || Twitter;
                  const percentage = ((count / analytics.length) * 100).toFixed(0);
                  return (
                    <div key={platform}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <PlatformIcon className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {platform}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
            <TrendingUp className="w-10 h-10 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Performance Insights</h3>
            <p className="text-sm text-gray-600 mb-4">
              {analytics.length > 0
                ? `You've published ${analytics.length} posts with an average engagement rate of ${avgEngagementRate}%. Keep up the great work!`
                : 'Start publishing content to get personalized insights about your performance.'}
            </p>
            {analytics.length > 0 && (
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Best performing platform: {Object.entries(
                    analytics.reduce((acc, curr) => {
                      acc[curr.platform] = (acc[curr.platform] || 0) + curr.engagement_rate;
                      return acc;
                    }, {} as Record<string, number>)
                  ).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Total reach: {totalStats.impressions.toLocaleString()} impressions</span>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
