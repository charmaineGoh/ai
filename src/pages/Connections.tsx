import React, { useEffect, useState } from 'react';
import { supabase, SocialAccount } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Link2,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  CheckCircle,
  XCircle,
  Plus,
  Trash2
} from 'lucide-react';

export function Connections() {
  const { profile } = useAuth();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const platforms = [
    {
      name: 'Instagram',
      value: 'instagram',
      icon: Instagram,
      color: 'from-pink-500 to-purple-500',
      description: 'Connect your Instagram Business account'
    },
    {
      name: 'LinkedIn',
      value: 'linkedin',
      icon: Linkedin,
      color: 'from-blue-600 to-blue-700',
      description: 'Connect your LinkedIn Company page'
    },
    {
      name: 'Twitter',
      value: 'twitter',
      icon: Twitter,
      color: 'from-sky-400 to-blue-500',
      description: 'Connect your Twitter account'
    },
    {
      name: 'Facebook',
      value: 'facebook',
      icon: Facebook,
      color: 'from-blue-500 to-blue-600',
      description: 'Connect your Facebook Page'
    }
  ];

  const handleConnect = async (platform: string) => {
    alert(`In a production environment, this would redirect you to ${platform}'s OAuth flow to authorize the connection. For this demo, we'll simulate a connection.`);

    try {
      const { error } = await supabase.from('social_accounts').insert({
        user_id: profile?.id,
        platform: platform as any,
        account_name: `Demo ${platform} Account`,
        account_id: `demo_${Date.now()}`,
        is_active: true
      });

      if (error) throw error;
      loadAccounts();
    } catch (error) {
      console.error('Error connecting account:', error);
      alert('Failed to connect account');
    }
  };

  const handleDisconnect = async (accountId: string) => {
    if (!confirm('Are you sure you want to disconnect this account?')) return;

    try {
      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;
      loadAccounts();
    } catch (error) {
      console.error('Error disconnecting account:', error);
      alert('Failed to disconnect account');
    }
  };

  const getConnectedAccount = (platform: string) => {
    return accounts.find(acc => acc.platform === platform && acc.is_active);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Platform Connections</h1>
        <p className="text-gray-600 mt-1">Connect your social media accounts to enable automated posting</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <Link2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">About Connections</p>
            <p className="text-blue-800">
              Connect your social media accounts to enable automated posting and analytics tracking.
              Your credentials are securely encrypted and stored. You can disconnect at any time.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map((platform) => {
          const PlatformIcon = platform.icon;
          const connectedAccount = getConnectedAccount(platform.value);
          const isConnected = !!connectedAccount;

          return (
            <div
              key={platform.value}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className={`bg-gradient-to-r ${platform.color} p-6`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                      <PlatformIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{platform.name}</h3>
                      <p className="text-sm text-white text-opacity-90">{platform.description}</p>
                    </div>
                  </div>
                  {isConnected ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <XCircle className="w-6 h-6 text-white text-opacity-50" />
                  )}
                </div>
              </div>

              <div className="p-6">
                {isConnected ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-green-900">Connected</p>
                        <p className="text-xs text-green-700 mt-0.5">
                          {connectedAccount.account_name}
                        </p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>

                    <button
                      onClick={() => handleDisconnect(connectedAccount.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(platform.value)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Connect {platform.name}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {accounts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Connected Accounts</h2>
          <div className="space-y-3">
            {accounts.map((account) => {
              const platform = platforms.find(p => p.value === account.platform);
              const PlatformIcon = platform?.icon || Link2;

              return (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`bg-gradient-to-r ${platform?.color || 'from-gray-400 to-gray-500'} p-2 rounded-lg`}>
                      <PlatformIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{account.account_name}</h4>
                      <p className="text-sm text-gray-500 capitalize">{account.platform}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {account.is_active ? (
                      <span className="flex items-center gap-1 text-sm text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <XCircle className="w-4 h-4" />
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Need Help Connecting?</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>• Make sure you have admin access to the social media accounts you want to connect</p>
          <p>• For Instagram, you'll need a Business or Creator account</p>
          <p>• LinkedIn requires a Company Page with admin privileges</p>
          <p>• All connections use secure OAuth authentication</p>
        </div>
      </div>
    </div>
  );
}
