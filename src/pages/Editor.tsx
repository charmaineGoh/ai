import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Asset } from '../lib/supabase';
import {
  Palette,
  Upload,
  Sparkles,
  Image as ImageIcon,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

export function Editor() {
  const { profile } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      if (data) setAssets(data);
    } catch (error) {
      console.error('Error loading assets:', error);
    }
  };

  const openPixlrEditor = (imageUrl?: string) => {
    const params = new URLSearchParams();
    if (imageUrl) params.set('imageUrl', imageUrl);
    if (profile?.id) params.set('userId', profile.id);

    const editorUrl = `/editor.html?${params.toString()}`;
    window.open(editorUrl, '_blank', 'width=1200,height=800');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile?.id}-${Date.now()}.${fileExt}`;
      const filePath = `assets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from('assets')
        .insert({
          user_id: profile?.id,
          title: file.name,
          type: file.type.startsWith('video/') ? 'video' : 'image',
          url: publicUrl,
          generated_by_ai: false
        });

      if (insertError) throw insertError;

      await loadAssets();
      alert('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pixlr Image Editor</h1>
          <p className="text-gray-600 mt-1">Create and edit stunning visuals with AI-powered tools</p>
        </div>
        <button
          onClick={() => openPixlrEditor()}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all"
        >
          <Sparkles className="w-5 h-5" />
          Create New
        </button>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-start gap-4">
          <div className="bg-white p-3 rounded-lg">
            <Palette className="w-8 h-8 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">About Pixlr Editor</h3>
            <p className="text-gray-700 mb-3">
              Pixlr is a powerful AI-powered image editor that runs directly in your browser.
              You can create designs from scratch, edit existing images, apply filters, remove backgrounds,
              and resize images for different social media platforms.
            </p>
            <div className="flex items-center gap-2 text-sm text-purple-700">
              <ExternalLink className="w-4 h-4" />
              <span>Opens in a new window</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-lg w-fit mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">AI Generation</h3>
          <p className="text-sm text-gray-600">
            Generate unique images using AI prompts and templates
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-lg w-fit mb-4">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Smart Resize</h3>
          <p className="text-sm text-gray-600">
            Auto-resize images for Instagram, TikTok, Facebook, and more
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-lg w-fit mb-4">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Pro Editing</h3>
          <p className="text-sm text-gray-600">
            Access professional editing tools, filters, and effects
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Your Assets</h2>
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={loading}
              />
            </label>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No assets yet</p>
              <p className="text-sm text-gray-500 mb-4">
                Upload images or create new designs with Pixlr
              </p>
              <button
                onClick={() => openPixlrEditor()}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Create your first design
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-purple-300 transition-colors cursor-pointer"
                  onClick={() => asset.url && openPixlrEditor(asset.url)}
                >
                  {asset.url ? (
                    <img
                      src={asset.url}
                      alt={asset.title || 'Asset'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white rounded-lg px-3 py-2 text-sm font-medium text-gray-900">
                        Edit in Pixlr
                      </div>
                    </div>
                  </div>
                  {asset.generated_by_ai && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-900">
            <p className="font-medium mb-1">Setup Required</p>
            <p>
              To use the Pixlr editor, you need to add your Pixlr Client ID in the <code className="bg-yellow-100 px-1 rounded">editor.html</code> file.
              Replace <code className="bg-yellow-100 px-1 rounded">PASTE_YOUR_PIXLR_CLIENT_ID_HERE</code> with your actual client ID from{' '}
              <a href="https://pixlr.com/developer/" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                pixlr.com/developer
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
