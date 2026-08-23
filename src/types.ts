export interface AuthorInfo {
  id?: string;
  unique_id: string;
  nickname: string;
  avatar: string;
}

export interface VideoStats {
  likes: number;
  comments: number;
  shares: number;
  plays: number;
}

export interface MusicInfo {
  id?: string;
  title: string;
  author: string;
  url: string;
  cover?: string;
  duration?: number;
}

export interface DownloadOption {
  id: string;
  label: string;
  quality: string;
  description?: string;
  badge?: string;
  type: 'video_hd' | 'video_nowatermark' | 'video_watermark' | 'audio' | 'image' | 'cover';
  url: string;
  sizeFormatted?: string;
  extension: 'mp4' | 'mp3' | 'jpg' | 'png';
  recommend?: boolean;
}

export interface TikTokMediaResult {
  id: string;
  title: string;
  duration: number; // in seconds
  cover: string;
  originCover?: string;
  dynamicCover?: string;
  author: AuthorInfo;
  stats: VideoStats;
  music?: MusicInfo;
  isPhotoSlide: boolean;
  images?: string[];
  downloads: DownloadOption[];
  originalUrl: string;
  extractedAt: number;
}

export interface HistoryItem {
  id: string;
  title: string;
  author: string;
  authorUsername: string;
  cover: string;
  timestamp: number;
  url: string;
  isPhotoSlide: boolean;
}

export interface UserAccount {
  email: string;
  name?: string;
  createdAt: number;
}

