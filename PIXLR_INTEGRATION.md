# Pixlr Integration Guide

This document explains how the Pixlr image editor is integrated into the application.

## Overview

The application includes a complete Pixlr integration that allows users to:
- View images in a full-screen viewer
- Edit images using the Pixlr web editor
- Automatically save edited images back to Supabase storage
- Track AI-generated/edited images

## Architecture

### 1. Frontend Components

#### ImageViewer Component (`src/components/ImageViewer.tsx`)
- Full-screen modal image viewer
- "Edit in Pixlr" button that opens Pixlr web editor
- Download functionality
- Real-time communication with Pixlr editor via postMessage API
- Automatic image upload to Supabase after editing

#### Editor Page (`src/pages/Editor.tsx`)
- Grid display of all user assets
- Click any image to open the ImageViewer
- Upload new images functionality
- Integration with ImageViewer component

### 2. Backend (Supabase Edge Function)

#### Edge Function: `pixlr-callback`
Location: `supabase/functions/pixlr-callback/index.ts`

**Purpose**: Handle callbacks from Pixlr editor after user saves edits

**Endpoints**:

##### GET `/api/pixlr-callback`
Handles different states from Pixlr:

- **Cancel State** (`?state=cancel`): User cancelled editing
  - Returns HTML page that closes itself
  - Sends cancel message to parent window

- **Success State** (`?image=URL&type=image`): User saved edited image
  - Fetches the edited image from Pixlr's temporary URL
  - Converts to base64
  - Sends image data back to parent window via postMessage
  - Auto-closes after successful transfer

##### POST `/api/pixlr-callback`
- Receives POST data from Pixlr (if configured)
- Supports both JSON and multipart/form-data
- Returns success response

**CORS Configuration**:
- Allows all origins (can be restricted in production)
- Supports GET, POST, PUT, DELETE, OPTIONS methods
- Required headers for Supabase client compatibility

### 3. Communication Flow

```
1. User clicks "Edit in Pixlr" button
   ↓
2. ImageViewer opens Pixlr web editor in new window
   - Passes current image URL
   - Passes callback URL (pointing to Edge Function)
   ↓
3. User edits image in Pixlr
   ↓
4. User clicks "Save" in Pixlr
   ↓
5. Pixlr redirects to callback URL with edited image
   ↓
6. Edge Function receives callback
   - Fetches edited image from Pixlr's temporary URL
   - Converts to base64
   - Returns HTML that posts message to opener window
   ↓
7. ImageViewer receives postMessage
   - Decodes base64 image
   - Uploads to Supabase storage
   - Updates database record
   - Updates UI with new image
   ↓
8. Callback window closes automatically
```

## Code Implementation

### Opening Pixlr Editor

```typescript
const openPixlrEditor = () => {
  const callbackUrl = `${window.location.origin}/api/pixlr-callback`;

  const pixlrParams = new URLSearchParams({
    image: currentImageUrl,          // Current image to edit
    referrer: 'PixlrSocial',        // App identifier
    title: imageTitle,               // Editor title
    target: callbackUrl,             // Callback URL
    exit: window.location.href,      // Return URL on cancel
    locktarget: '1',                 // Lock callback URL
    credentials: 'same-origin'       // Cookie handling
  });

  const editorUrl = `https://pixlr.com/editor/?${pixlrParams.toString()}`;

  const editorWindow = window.open(
    editorUrl,
    'pixlr_editor',
    'width=1400,height=900,resizable=yes'
  );
};
```

### Handling Callbacks

```typescript
window.addEventListener('message', async (event) => {
  if (event.origin !== window.location.origin) return;

  if (event.data.type === 'pixlr-callback') {
    const { imageData, assetId } = event.data;

    // Upload edited image to Supabase
    const newUrl = await handleImageUpdate(imageData);

    // Update UI
    setCurrentImageUrl(newUrl);
    onImageUpdated(newUrl);
  } else if (event.data.type === 'pixlr-cancel') {
    // User cancelled editing
    setIsEditing(false);
  } else if (event.data.type === 'pixlr-error') {
    // Error occurred
    setError(event.data.message);
  }
});
```

### Uploading to Supabase

```typescript
const handleImageUpdate = async (imageData: string) => {
  // Convert base64 to blob
  const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
  const byteCharacters = atob(base64Data);
  const byteArray = new Uint8Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteArray[i] = byteCharacters.charCodeAt(i);
  }

  const blob = new Blob([byteArray], { type: 'image/png' });

  // Upload to Supabase Storage
  const fileName = `${userId}-edited-${Date.now()}.png`;
  const filePath = `assets/${fileName}`;

  await supabase.storage
    .from('assets')
    .upload(filePath, blob);

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('assets')
    .getPublicUrl(filePath);

  // Update database
  await supabase
    .from('assets')
    .update({ url: publicUrl, generated_by_ai: true })
    .eq('id', assetId);

  return publicUrl;
};
```

## Configuration

### Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Vite Proxy Configuration

In development, API calls are proxied to Supabase Edge Functions:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api/pixlr-callback': {
      target: process.env.VITE_SUPABASE_URL,
      changeOrigin: true,
      rewrite: (path) => path.replace(
        '/api/pixlr-callback',
        '/functions/v1/pixlr-callback'
      ),
    },
  },
}
```

### Production Redirects

For production deployment (e.g., Netlify), add to `public/_redirects`:

```
/api/pixlr-callback  /.netlify/functions/pixlr-callback  200
```

Or configure your hosting provider to proxy `/api/pixlr-callback` to your Supabase Edge Function URL.

## Error Handling

### Frontend Errors
- Pop-up blocker detection
- Network errors during image upload
- Invalid image data
- Supabase upload failures

### Backend Errors
- Invalid request methods
- Missing parameters
- Image fetch failures
- CORS issues

All errors are caught and displayed to the user with helpful messages.

## Security Considerations

1. **CORS**: Currently allows all origins. Restrict in production:
   ```typescript
   const corsHeaders = {
     "Access-Control-Allow-Origin": "https://yourdomain.com",
     // ... other headers
   };
   ```

2. **Authentication**: Edge Function has `verify_jwt: false` for public access. Add authentication if needed.

3. **File Size Limits**: Consider adding file size validation before upload.

4. **Storage Permissions**: Ensure proper RLS policies on Supabase storage bucket.

## Testing

### Test Flow:
1. Upload an image to the Editor page
2. Click the uploaded image to open ImageViewer
3. Click "Edit in Pixlr" button
4. Make edits in Pixlr editor
5. Click "Save" in Pixlr
6. Verify edited image appears in your library
7. Check that image is marked as AI-generated

### Test Cancel Flow:
1. Open image in Pixlr
2. Click "Cancel" or close Pixlr window
3. Verify no changes were made
4. Verify no errors are displayed

## Troubleshooting

### Issue: Pop-up Blocked
**Solution**: Allow pop-ups for your domain

### Issue: Callback Not Received
**Checks**:
- Verify Edge Function is deployed
- Check browser console for CORS errors
- Verify callback URL is accessible
- Check network tab for callback request

### Issue: Image Not Uploading
**Checks**:
- Verify Supabase storage bucket exists
- Check storage permissions
- Verify sufficient storage quota
- Check browser console for upload errors

### Issue: Editor Opens But Doesn't Load Image
**Checks**:
- Verify image URL is publicly accessible
- Check CORS headers on image URL
- Try with a different image format

## Future Enhancements

- Add support for multiple file formats (JPEG, WebP, SVG)
- Implement image compression before upload
- Add progress indicators during upload
- Support batch editing
- Add undo/redo functionality
- Implement version history for edited images
- Add custom Pixlr editor themes
- Integrate Pixlr AI features (background removal, filters, etc.)

## Resources

- [Pixlr Editor Documentation](https://pixlr.com/editor/)
- [Pixlr API Documentation](https://pixlr.com/developer/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [PostMessage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
