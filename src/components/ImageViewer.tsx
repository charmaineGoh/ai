import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Palette, X, Loader, Download, Trash2, AlertCircle } from 'lucide-react';

interface ImageViewerProps {
  imageUrl: string;
  imageId: string;
  imageTitle?: string;
  onClose: () => void;
  onImageUpdated: (newUrl: string) => void;
}

export function ImageViewer({ imageUrl, imageId, imageTitle, onClose, onImageUpdated }: ImageViewerProps) {
  const { profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);

  const openPixlrEditor = () => {
    try {
      setIsEditing(true);
      setError(null);

      const callbackUrl = `${window.location.origin}/api/pixlr-callback`;

      const pixlrParams = new URLSearchParams({
        image: currentImageUrl,
        referrer: 'PixlrSocial',
        title: imageTitle || 'Edit Image',
        target: callbackUrl,
        exit: window.location.href,
        locktarget: '1',
        credentials: 'same-origin'
      });

      const editorUrl = `https://pixlr.com/editor/?${pixlrParams.toString()}`;

      const editorWindow = window.open(
        editorUrl,
        'pixlr_editor',
        'width=1400,height=900,resizable=yes,scrollbars=yes,status=yes'
      );

      if (!editorWindow) {
        throw new Error('Pop-up blocked. Please allow pop-ups for this site.');
      }

      const messageHandler = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'pixlr-callback') {
          try {
            const { imageData, assetId } = event.data;

            if (imageData && assetId === imageId) {
              const newUrl = await handleImageUpdate(imageData);
              setCurrentImageUrl(newUrl);
              onImageUpdated(newUrl);
              setIsEditing(false);
              setError(null);
            }
          } catch (err: any) {
            console.error('Error processing edited image:', err);
            setError(err.message || 'Failed to save edited image');
            setIsEditing(false);
          }
        } else if (event.data.type === 'pixlr-cancel') {
          setIsEditing(false);
          setError(null);
        } else if (event.data.type === 'pixlr-error') {
          setError(event.data.message || 'An error occurred in Pixlr editor');
          setIsEditing(false);
        }
      };

      window.addEventListener('message', messageHandler);

      const checkWindowClosed = setInterval(() => {
        if (editorWindow.closed) {
          clearInterval(checkWindowClosed);
          window.removeEventListener('message', messageHandler);
          setIsEditing(false);
        }
      }, 1000);

    } catch (err: any) {
      console.error('Error opening Pixlr editor:', err);
      setError(err.message || 'Failed to open Pixlr editor');
      setIsEditing(false);
    }
  };

  const handleImageUpdate = async (imageData: string): Promise<string> => {
    if (!profile?.id) {
      throw new Error('User not authenticated');
    }

    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });

    const timestamp = Date.now();
    const fileName = `${profile.id}-edited-${timestamp}.png`;
    const filePath = `assets/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload(filePath, blob, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('assets')
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('assets')
      .update({
        url: publicUrl,
        generated_by_ai: true
      })
      .eq('id', imageId);

    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    return publicUrl;
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(currentImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = imageTitle || 'image.png';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading image:', err);
      setError('Failed to download image');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {imageTitle || 'Image Viewer'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-900 font-medium">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="flex items-center justify-center min-h-full">
            <img
              src={currentImageUrl}
              alt={imageTitle || 'Image'}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isEditing && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader className="w-4 h-4 animate-spin" />
                <span>Editing in Pixlr...</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>

            <button
              onClick={openPixlrEditor}
              disabled={isEditing}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Palette className="w-4 h-4" />
              {isEditing ? 'Editing...' : 'Edit in Pixlr'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
