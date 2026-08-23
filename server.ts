import 'dotenv/config';
import express from 'express';
import path from 'path';
import { initializeApp, cert } from 'firebase-admin';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK if service account is provided
let db: Firestore | null = null;
try {
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccountEnv) {
    const serviceAccount = JSON.parse(serviceAccountEnv);
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    initializeApp({
      credential: cert(serviceAccount),
    });
    db = getFirestore();
    console.log('--- Firebase Firestore: INITIALIZED ---');
  } else {
    console.warn('--- Firebase Firestore: NO CREDENTIALS FOUND (using in-memory fallback) ---');
  }
} catch (err) {
  console.error('--- Firebase Firestore Initialization Error:', err);
}

const app = express();
app.use(express.json());



  // Helper to format byte size
  function formatBytes(bytes?: number): string | undefined {
    if (!bytes || bytes <= 0) return undefined;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  // Sanitize filename for download
  function sanitizeFilename(name: string): string {
    const cleaned = name
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // remove illegal filesystem characters
      .replace(/[\s_]+/g, '_') // normalize spaces and underscores
      .trim()
      .slice(0, 120);
    return cleaned || 'tiktok_download';
  }

  // Expand short URLs (e.g., vm.tiktok.com, vt.tiktok.com, /t/...)
  async function resolveTikTokUrl(inputUrl: string): Promise<string> {
    try {
      const trimmed = inputUrl.trim();
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        return `https://${trimmed}`;
      }
      
      // If it's a short URL, resolve the redirect
      if (trimmed.includes('vm.tiktok.com') || trimmed.includes('vt.tiktok.com') || trimmed.includes('/t/')) {
        const headRes = await fetch(trimmed, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });
        if (headRes.url && headRes.url !== trimmed) {
          return headRes.url;
        }
      }
      return trimmed;
    } catch {
      return inputUrl.trim();
    }
  }

  // Extract media from TikTok without API key using TikWM service + fallback handlers
  async function extractTikTokMedia(targetUrl: string) {
    const cleanUrl = await resolveTikTokUrl(targetUrl);

    // Primary: TikWM API
    try {
      const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(cleanUrl)}&hd=1`;
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json, text/plain, */*',
        },
      });

      if (response.ok) {
        const json = await response.json();
        if (json && (json.code === 0 || json.data)) {
          const data = json.data;
          const isPhotoSlide = Array.isArray(data.images) && data.images.length > 0;
          const title = data.title || 'TikTok Media';
          const safeTitle = sanitizeFilename(title);

          const downloads = [];

          const playUrl = data.play ? (data.play.startsWith('http') ? data.play : `https://www.tikwm.com${data.play}`) : null;
          const hdUrl = data.hdplay ? (data.hdplay.startsWith('http') ? data.hdplay : `https://www.tikwm.com${data.hdplay}`) : null;
          const wmUrl = data.wmplay ? (data.wmplay.startsWith('http') ? data.wmplay : `https://www.tikwm.com${data.wmplay}`) : null;

          // 1. HD No Watermark (Highest quality, no watermark)
          if (hdUrl) {
            downloads.push({
              id: 'hd_video',
              label: 'Download HD Video',
              quality: 'Full HD 1080p',
              description: 'Crisp, highest resolution video with zero watermarks or logos',
              badge: '1080p HD • No Watermark',
              type: 'video_hd',
              url: hdUrl,
              sizeFormatted: data.hd_size ? formatBytes(data.hd_size) : undefined,
              extension: 'mp4',
              recommend: true,
            });
          }

          // 2. Standard No Watermark (if available and not identical to HD)
          if (playUrl && playUrl !== hdUrl) {
            const isOnlyOption = !hdUrl;
            downloads.push({
              id: 'nowm_video',
              label: isOnlyOption ? 'Download Video (No Watermark)' : 'Download Fast MP4 (No Watermark)',
              quality: isOnlyOption ? 'High Quality (No Watermark)' : 'Standard Quality (Fast Download)',
              description: isOnlyOption
                ? 'Clean high quality MP4 video without TikTok logo'
                : 'Smaller file size for fast download and universal device compatibility',
              badge: isOnlyOption ? 'No Watermark' : 'Fast Server • 720p',
              type: 'video_nowatermark',
              url: playUrl,
              sizeFormatted: data.size ? formatBytes(data.size) : undefined,
              extension: 'mp4',
              recommend: isOnlyOption,
            });
          }

          // 3. Watermarked Video (ONLY if it is a genuinely different stream from playUrl and hdUrl)
          if (wmUrl && wmUrl !== playUrl && wmUrl !== hdUrl && data.wm_size !== 0) {
            downloads.push({
              id: 'wm_video',
              label: 'Download with TikTok Watermark',
              quality: 'Original Watermark',
              description: 'Original TikTok post containing creator username and TikTok logo',
              badge: 'With Creator Logo',
              type: 'video_watermark',
              url: wmUrl,
              sizeFormatted: data.wm_size ? formatBytes(data.wm_size) : undefined,
              extension: 'mp4',
              recommend: false,
            });
          }

          // 4. Audio (MP3)
          const rawAudioUrl = data.music || data.music_info?.play;
          if (rawAudioUrl) {
            const fullAudioUrl = rawAudioUrl.startsWith('http') ? rawAudioUrl : `https://www.tikwm.com${rawAudioUrl}`;
            downloads.push({
              id: 'audio_mp3',
              label: 'Download Audio (MP3)',
              quality: 'Audio Soundtrack (320kbps)',
              description: 'Extract and save background music / original sound as MP3',
              badge: 'MP3 Audio',
              type: 'audio',
              url: fullAudioUrl,
              extension: 'mp3',
              recommend: isPhotoSlide,
            });
          }

          // 5. Cover / Thumbnail
          const rawCoverUrl = data.origin_cover || data.cover;
          if (rawCoverUrl) {
            const fullCoverUrl = rawCoverUrl.startsWith('http') ? rawCoverUrl : `https://www.tikwm.com${rawCoverUrl}`;
            downloads.push({
              id: 'cover_image',
              label: 'Download HD Thumbnail',
              quality: 'Original Resolution Cover',
              description: 'Full-resolution video cover artwork image (JPG)',
              badge: 'HD Image',
              type: 'cover',
              url: fullCoverUrl,
              extension: 'jpg',
              recommend: false,
            });
          }

          return {
            id: data.id || String(Date.now()),
            title: title,
            duration: data.duration || 0,
            cover: data.cover || data.origin_cover || '',
            originCover: data.origin_cover,
            dynamicCover: data.dynamic_cover,
            author: {
              id: data.author?.id,
              unique_id: data.author?.unique_id || 'tiktok_user',
              nickname: data.author?.nickname || 'TikTok Creator',
              avatar: data.author?.avatar || '',
            },
            stats: {
              likes: data.digg_count || 0,
              comments: data.comment_count || 0,
              shares: data.share_count || 0,
              plays: data.play_count || 0,
            },
            music: data.music_info
              ? {
                  id: data.music_info.id,
                  title: data.music_info.title || 'Original Sound',
                  author: data.music_info.author || data.author?.nickname || 'TikTok',
                  url: data.music_info.play || data.music || '',
                  duration: data.music_info.duration,
                  cover: data.music_info.cover,
                }
              : undefined,
            isPhotoSlide,
            images: data.images || [],
            downloads,
            originalUrl: cleanUrl,
            extractedAt: Date.now(),
          };
        }
      }
    } catch (err) {
      console.warn('Primary extraction error:', err);
    }

    // Fallback 2: Direct TikTok oEmbed metadata extraction
    try {
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(cleanUrl)}`;
      const oembedRes = await fetch(oembedUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (oembedRes.ok) {
        const oembedData = await oembedRes.json();
        if (oembedData && oembedData.title) {
          return {
            id: String(Date.now()),
            title: oembedData.title || 'TikTok Video',
            duration: 0,
            cover: oembedData.thumbnail_url || '',
            originCover: oembedData.thumbnail_url,
            author: {
              unique_id: oembedData.author_unique_id || oembedData.author_name || 'tiktok_user',
              nickname: oembedData.author_name || 'TikTok Creator',
              avatar: '',
            },
            stats: {
              likes: 0,
              comments: 0,
              shares: 0,
              plays: 0,
            },
            isPhotoSlide: false,
            downloads: [
              {
                id: 'cover_image',
                label: 'Download Thumbnail Image',
                quality: 'High Definition Cover',
                type: 'cover',
                url: oembedData.thumbnail_url,
                extension: 'jpg',
                recommend: true,
              },
            ],
            originalUrl: cleanUrl,
            extractedAt: Date.now(),
          };
        }
      }
    } catch (fallbackErr) {
      console.warn('Fallback oEmbed error:', fallbackErr);
    }

    throw new Error('Could not extract video from the provided link. Please ensure the TikTok video is public and the link is valid.');
  }

  // API 1: Extract Video Endpoint
  app.post('/api/extract', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string' || !url.trim()) {
        return res.status(400).json({ error: 'Please provide a valid TikTok video URL' });
      }

      const input = url.trim();
      const isTikTok =
        input.includes('tiktok.com') ||
        input.includes('douyin.com') ||
        input.startsWith('http://') ||
        input.startsWith('https://');

      if (!isTikTok) {
        return res.status(400).json({ error: 'Please enter a valid TikTok URL (e.g., https://www.tiktok.com/@user/video/...)' });
      }

      const result = await extractTikTokMedia(input);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      console.error('Extraction error:', err);
      return res.status(500).json({
        error: err?.message || 'Failed to extract TikTok video. Please try again with a public TikTok video URL.',
      });
    }
  });

  // API 2: Proxy Download with Attachment Headers
  // This bypasses browser CORS / TikTok hotlink restrictions and prompts immediate file download
  app.get('/api/proxy-download', async (req, res) => {
    try {
      const { url, filename, ext } = req.query;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Missing target URL parameter' });
      }

      // DO NOT call decodeURIComponent: Express already decodes query params.
      // Calling it again corrupts signed CDN query parameters like x-signature=%2B...
      const targetUrl = url.trim();
      const safeFilename = sanitizeFilename(typeof filename === 'string' ? filename : 'tiktok_media');

      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          Referer: targetUrl.includes('tikwm.com') ? 'https://www.tikwm.com/' : 'https://www.tiktok.com/',
        },
      });

      if (!response.ok) {
        console.warn(`Upstream download failed (${response.status}) for: ${targetUrl.slice(0, 80)}`);
        return res.status(response.status).json({
          error: `Upstream media server returned status ${response.status}`,
        });
      }

      const upstreamContentType = response.headers.get('content-type') || '';
      let fileExt = typeof ext === 'string' ? ext.replace('.', '').toLowerCase() : 'mp4';

      // Ensure appropriate extension matching content type
      if (upstreamContentType.includes('image/webp')) {
        fileExt = 'webp';
      } else if (upstreamContentType.includes('image/jpeg') || upstreamContentType.includes('image/jpg')) {
        fileExt = 'jpg';
      } else if (upstreamContentType.includes('image/png')) {
        fileExt = 'png';
      } else if (upstreamContentType.includes('audio/mpeg') || upstreamContentType.includes('audio/mp3')) {
        fileExt = 'mp3';
      } else if (upstreamContentType.includes('video/mp4')) {
        fileExt = 'mp4';
      }

      const downloadFilename = `${safeFilename}.${fileExt}`;
      const contentType =
        upstreamContentType ||
        (fileExt === 'mp3'
          ? 'audio/mpeg'
          : fileExt === 'webp'
          ? 'image/webp'
          : fileExt === 'png'
          ? 'image/png'
          : fileExt === 'jpg'
          ? 'image/jpeg'
          : 'video/mp4');

      const contentLength = response.headers.get('content-length');

      res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
      res.setHeader('Content-Type', contentType);
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }
      res.setHeader('Cache-Control', 'public, max-age=3600');

      if (response.body) {
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            res.end();
            break;
          }
          res.write(Buffer.from(value));
        }
      } else {
        const buffer = await response.arrayBuffer();
        res.end(Buffer.from(buffer));
      }
    } catch (err: any) {
      console.error('Download stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to process media download stream' });
      }
    }
  });

  // API 3: Proxy Stream for In-App Audio / Video Preview
  app.get('/api/proxy-stream', async (req, res) => {
    try {
      const { url } = req.query;
      if (!url || typeof url !== 'string') {
        return res.status(400).send('Missing media URL');
      }

      // DO NOT call decodeURIComponent: Express already decodes query params.
      const targetUrl = url.trim();
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Referer: targetUrl.includes('tikwm.com') ? 'https://www.tikwm.com/' : 'https://www.tiktok.com/',
          Range: req.headers.range || 'bytes=0-',
        },
      });

      if (!response.ok && response.status !== 206) {
        return res.status(response.status).send('Unable to stream media');
      }

      const contentType = response.headers.get('content-type') || 'video/mp4';
      const contentRange = response.headers.get('content-range');
      const contentLength = response.headers.get('content-length');

      res.status(response.status);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Accept-Ranges', 'bytes');
      if (contentRange) res.setHeader('Content-Range', contentRange);
      if (contentLength) res.setHeader('Content-Length', contentLength);

      if (response.body) {
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            res.end();
            break;
          }
          res.write(Buffer.from(value));
        }
      } else {
        const buffer = await response.arrayBuffer();
        res.end(Buffer.from(buffer));
      }
    } catch (err) {
      console.error('Stream error:', err);
      if (!res.headersSent) {
        res.status(500).send('Streaming error');
      }
    }
  });

  // API 4: Verified Sample Links for Instant Testing
  app.get('/api/samples', (req, res) => {
    res.json({
      samples: [
        {
          label: 'Trending Video',
          url: 'https://vm.tiktok.com/ZMhYv2p4k/',
          description: 'High-definition video with crystal-clear audio',
        },
        {
          label: 'Viral Clip',
          url: 'https://www.tiktok.com/@scout2015/video/6718335390845095173',
          description: 'Popular viral sound & video sample',
        },
      ],
    });
  });

  // In-memory registered users store
  const registeredUsers = new Map<string, { email: string; name?: string; createdAt: number }>();

  // API 5: Register / Sign In User
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, name } = req.body;
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ error: 'Please enter a valid email address' });
      }

      const normalizedEmail = email.trim().toLowerCase();

      if (db) {
        const userRef = db.collection('users').doc(normalizedEmail);
        const docSnap = await userRef.get();
        if (docSnap.exists) {
          const existingUser = docSnap.data();
          return res.json({ success: true, user: existingUser, message: 'Welcome back!' });
        }

        const newUser = {
          email: normalizedEmail,
          name: typeof name === 'string' && name.trim() ? name.trim() : normalizedEmail.split('@')[0],
          createdAt: Date.now(),
        };
        await userRef.set(newUser);
        return res.json({ success: true, user: newUser, message: 'Account created successfully!' });
      } else {
        const existing = registeredUsers.get(normalizedEmail);
        if (existing) {
          return res.json({ success: true, user: existing, message: 'Welcome back!' });
        }

        const newUser = {
          email: normalizedEmail,
          name: typeof name === 'string' && name.trim() ? name.trim() : normalizedEmail.split('@')[0],
          createdAt: Date.now(),
        };
        registeredUsers.set(normalizedEmail, newUser);
        return res.json({ success: true, user: newUser, message: 'Account created successfully!' });
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      return res.status(500).json({ error: err?.message || 'Failed to register' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ error: 'Please enter a valid email address' });
      }

      const normalizedEmail = email.trim().toLowerCase();

      if (db) {
        const userRef = db.collection('users').doc(normalizedEmail);
        const docSnap = await userRef.get();
        let user;
        if (docSnap.exists) {
          user = docSnap.data();
        } else {
          // Auto-create on first sign in
          user = {
            email: normalizedEmail,
            name: normalizedEmail.split('@')[0],
            createdAt: Date.now(),
          };
          await userRef.set(user);
        }
        return res.json({ success: true, user, message: 'Logged in successfully!' });
      } else {
        let user = registeredUsers.get(normalizedEmail);
        if (!user) {
          // Auto-create on first sign in
          user = {
            email: normalizedEmail,
            name: normalizedEmail.split('@')[0],
            createdAt: Date.now(),
          };
          registeredUsers.set(normalizedEmail, user);
        }
        return res.json({ success: true, user, message: 'Logged in successfully!' });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      return res.status(500).json({ error: err?.message || 'Failed to login' });
    }
  });

  // Vite middleware and port listening for local development / production (not on Vercel)
  if (!process.env.VERCEL) {
    const bootstrap = async () => {
      if (process.env.NODE_ENV !== 'production') {
        const { createServer: createViteServer } = await import('vite');
        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: 'spa',
        });
        app.use(vite.middlewares);
      } else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
          res.sendFile(path.join(distPath, 'index.html'));
        });
      }

      const PORT = process.env.PORT || 3000;
      app.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`TikTok Downloader Server running on http://0.0.0.0:${PORT}`);
      });
    };
    bootstrap();
  }

  export default app;

