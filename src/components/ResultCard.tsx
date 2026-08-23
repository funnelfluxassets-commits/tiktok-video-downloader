import React, { useState, useMemo } from 'react';
import { TikTokMediaResult, DownloadOption } from '../types';
import {
  Download,
  Play,
  Pause,
  Music,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  FileVideo,
  FileAudio,
  AlertCircle,
  FileEdit,
  RotateCcw,
  Tag,
} from 'lucide-react';

interface ResultCardProps {
  result: TikTokMediaResult;
  onDownloadAttempt?: () => boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, onDownloadAttempt }) => {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [selectedDownloadId, setSelectedDownloadId] = useState<string | null>(
    () => result.downloads.find((d) => d.recommend)?.id || result.downloads[0]?.id || null
  );

  // Helper to sanitize strings for filesystem safety
  const cleanForFilename = (str: string): string => {
    return str
      .replace(/[^\w\s-]/gi, '') // Remove emojis & special symbols
      .replace(/[\s_]+/g, '_') // Convert spaces to underscores
      .replace(/^_+|_+$/g, '') // Trim underscores
      .slice(0, 80);
  };

  // Smart Filename Presets
  const titleSlug = useMemo(() => {
    const raw = result.title || '';
    const cleaned = cleanForFilename(raw);
    return cleaned || 'video';
  }, [result.title]);

  const authorSlug = useMemo(() => {
    return cleanForFilename(result.author.unique_id || 'tiktok');
  }, [result.author.unique_id]);

  const presetCreatorCaption = useMemo(() => {
    return `${authorSlug}_${titleSlug}`;
  }, [authorSlug, titleSlug]);

  const presetCaptionOnly = useMemo(() => {
    return titleSlug;
  }, [titleSlug]);

  const presetCreatorId = useMemo(() => {
    return `${authorSlug}_${result.id}`;
  }, [authorSlug, result.id]);

  // User-customizable filename state
  const [customFilename, setCustomFilename] = useState<string>(presetCreatorCaption);
  const [isEditingFilename, setIsEditingFilename] = useState<boolean>(false);

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const handleCopyCaption = () => {
    if (result.title) {
      navigator.clipboard.writeText(result.title);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    }
  };

  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleTriggerDownload = async (option: DownloadOption) => {
    if (onDownloadAttempt && !onDownloadAttempt()) {
      return;
    }
    setDownloadingId(option.id);
    setDownloadError(null);
    try {
      // Use customized filename with format indicator if applicable
      const baseName = cleanForFilename(customFilename.trim()) || presetCreatorCaption;
      let suffix = '';
      if (option.type === 'audio') {
        suffix = '_audio';
      } else if (option.type === 'cover') {
        suffix = '_cover';
      } else if (option.type === 'video_watermark') {
        suffix = '_watermarked';
      }

      const safeTitle = `${baseName}${suffix}`;
      const downloadEndpoint = `/api/proxy-download?url=${encodeURIComponent(option.url)}&filename=${encodeURIComponent(safeTitle)}&ext=${option.extension}`;
      
      const response = await fetch(downloadEndpoint);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Download failed with status ${response.status}`);
      }

      // Extract filename from Content-Disposition header if present, or fallback
      let finalFilename = `${safeTitle}.${option.extension}`;
      const disposition = response.headers.get('Content-Disposition');
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          finalFilename = match[1];
        }
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', finalFilename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
    } catch (err: any) {
      console.error('Download error:', err);
      setDownloadError(err?.message || 'Failed to download file. Please try another format.');
      setTimeout(() => setDownloadError(null), 5000);
    } finally {
      setDownloadingId(null);
    }
  };

  const videoStreamUrl = result.downloads.find((d) => d.type === 'video_hd' || d.type === 'video_nowatermark')?.url;
  const audioStreamUrl = result.music?.url || result.downloads.find((d) => d.type === 'audio')?.url;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-900/5 dark:shadow-black/40 overflow-hidden transition-all">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-800 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-900 text-white px-3.5 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2.5 sm:gap-3 border-b border-zinc-800">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {result.author.avatar ? (
            <img
              src={result.author.avatar}
              alt={result.author.nickname}
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-white/20 shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-white shrink-0 text-sm">
              {result.author.nickname?.charAt(0) || 'T'}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-white text-xs sm:text-base truncate max-w-[140px] sm:max-w-[200px]">{result.author.nickname}</span>
              <span className="text-[10px] sm:text-xs text-zinc-400 truncate max-w-[100px] sm:max-w-[150px]">@{result.author.unique_id}</span>
            </div>
            <p className="text-[10px] sm:text-xs text-emerald-400 flex items-center gap-1 font-medium mt-0.5">
              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>Ready to download</span>
            </p>
          </div>
        </div>

        <a
          href={result.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-zinc-300 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors shrink-0"
        >
          <span className="hidden xs:inline">View on </span>TikTok
          <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </a>
      </div>

      {/* Main Content Body */}
      <div className="p-3.5 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8">
        {/* Left Column: Media Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full max-w-[240px] sm:max-w-[280px] aspect-[9/16] rounded-2xl overflow-hidden bg-zinc-950 shadow-lg border border-zinc-100 dark:border-zinc-800 flex items-center justify-center group">
            {result.isPhotoSlide && result.images && result.images.length > 0 ? (
              <div className="relative w-full h-full">
                <img
                  src={result.images[activeSlideIndex]}
                  alt={`Slide ${activeSlideIndex + 1}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {result.images.length > 1 && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 px-3">
                    {result.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveSlideIndex(i)}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          i === activeSlideIndex ? 'w-6 bg-pink-500' : 'w-2 bg-white/60 hover:bg-white'
                        }`}
                      />
                    ))}
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] text-white font-medium flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  <span>{activeSlideIndex + 1} / {result.images.length}</span>
                </div>
              </div>
            ) : isPlayingVideo && videoStreamUrl ? (
              <video
                src={`/api/proxy-stream?url=${encodeURIComponent(videoStreamUrl)}`}
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="relative w-full h-full">
                <img
                  src={result.cover || result.originCover}
                  alt={result.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                  {videoStreamUrl && (
                    <button
                      id="play-video-preview-btn"
                      onClick={() => setIsPlayingVideo(true)}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-pink-600/90 text-white flex items-center justify-center shadow-lg hover:scale-110 hover:bg-pink-600 transition-all cursor-pointer"
                      title="Play Preview"
                    >
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-1" />
                    </button>
                  )}
                </div>
                {result.duration > 0 && (
                  <div className="absolute bottom-3 right-3 bg-black/70 px-2 py-0.5 rounded text-[11px] font-medium text-white">
                    {Math.floor(result.duration / 60)}:{(result.duration % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Audio Player Component */}
          {audioStreamUrl && (
            <div className="w-full max-w-[240px] sm:max-w-[280px] mt-3 sm:mt-4 p-2.5 sm:p-3 bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700/80 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {result.music?.title || 'Original Sound'}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                    {result.music?.author || result.author.nickname}
                  </p>
                </div>
              </div>
              <audio
                controls
                src={`/api/proxy-stream?url=${encodeURIComponent(audioStreamUrl)}`}
                className="w-full h-7 sm:h-8"
              />
            </div>
          )}
        </div>

        {/* Right Column: Video Details & Download Options */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            {/* Title / Description */}
            <div className="mb-4 sm:mb-5">
              <div className="flex items-start justify-between gap-2.5">
                <p className="text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm md:text-base font-normal leading-relaxed line-clamp-3 sm:line-clamp-4">
                  {result.title || 'No description provided for this video.'}
                </p>
                {result.title && (
                  <button
                    id="copy-caption-btn"
                    onClick={handleCopyCaption}
                    className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-2 sm:px-2.5 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer"
                    title="Copy Caption"
                  >
                    {copiedCaption ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                    <span>{copiedCaption ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Engagement Statistics */}
            <div className="grid grid-cols-4 gap-1 sm:gap-3 py-2.5 sm:py-3.5 px-2 sm:px-4 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/60 rounded-2xl mb-4 sm:mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-rose-500 dark:text-rose-400 mb-0.5">
                  <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                  <span className="text-[11px] sm:text-xs font-bold text-zinc-900 dark:text-zinc-100">{formatNumber(result.stats.likes)}</span>
                </div>
                <span className="text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Likes</span>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-blue-500 dark:text-blue-400 mb-0.5">
                  <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="text-[11px] sm:text-xs font-bold text-zinc-900 dark:text-zinc-100">{formatNumber(result.stats.comments)}</span>
                </div>
                <span className="text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Comments</span>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-500 dark:text-emerald-400 mb-0.5">
                  <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="text-[11px] sm:text-xs font-bold text-zinc-900 dark:text-zinc-100">{formatNumber(result.stats.shares)}</span>
                </div>
                <span className="text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Shares</span>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-purple-500 dark:text-purple-400 mb-0.5">
                  <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="text-[11px] sm:text-xs font-bold text-zinc-900 dark:text-zinc-100">{formatNumber(result.stats.plays)}</span>
                </div>
                <span className="text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Plays</span>
              </div>
            </div>

            {/* Custom File Name Control */}
            <div className="bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/90 dark:border-zinc-700/70 rounded-2xl p-3 sm:p-3.5 space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200">
                  <FileEdit className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>File Name</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingFilename(!isEditingFilename)}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {isEditingFilename ? 'Done' : 'Customize Name'}
                </button>
              </div>

              {/* Editable input field */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value)}
                  placeholder="Enter file name..."
                  className="w-full pl-3 pr-20 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 rounded-xl text-xs font-mono text-zinc-800 dark:text-zinc-100 transition-all"
                />
                <span className="absolute right-3 text-[11px] font-semibold text-zinc-400 select-none">
                  .mp4 / .mp3
                </span>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-0.5 mr-0.5">
                  <Tag className="w-2.5 h-2.5" /> Presets:
                </span>

                <button
                  type="button"
                  onClick={() => setCustomFilename(presetCreatorCaption)}
                  title={presetCreatorCaption}
                  className={`text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
                    customFilename === presetCreatorCaption
                      ? 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-semibold'
                      : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  Creator + Caption
                </button>

                {presetCaptionOnly && presetCaptionOnly !== presetCreatorCaption && (
                  <button
                    type="button"
                    onClick={() => setCustomFilename(presetCaptionOnly)}
                    title={presetCaptionOnly}
                    className={`text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
                      customFilename === presetCaptionOnly
                        ? 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-semibold'
                        : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Caption Only
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setCustomFilename(presetCreatorId)}
                  title={presetCreatorId}
                  className={`text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
                    customFilename === presetCreatorId
                      ? 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-semibold'
                      : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  Creator + ID
                </button>

                <button
                  type="button"
                  onClick={() => setCustomFilename(presetCreatorCaption)}
                  title="Reset to default"
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 ml-auto cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Download Buttons Section */}
            <div className="space-y-2.5 sm:space-y-3">
              {downloadError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>{downloadError}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <h3 className="text-[11px] sm:text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Download Options
                </h3>
                <span className="text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Direct High-Speed
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:gap-2.5">
                {result.downloads.map((opt, index) => {
                  const isDownloading = downloadingId === opt.id;
                  const isTopCard = index === 0;
                  const isSelected = selectedDownloadId === opt.id;

                  return (
                    <button
                      key={opt.id}
                      id={`download-opt-${opt.id}`}
                      onClick={() => {
                        setSelectedDownloadId(opt.id);
                        handleTriggerDownload(opt);
                      }}
                      disabled={isDownloading}
                      className={`w-full flex items-center justify-between p-2.5 sm:p-3.5 rounded-xl text-left transition-all cursor-pointer group bg-zinc-50 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 ${
                        isSelected
                          ? 'border-2 border-rose-600 dark:border-rose-500 shadow-md shadow-rose-600/10'
                          : 'border border-zinc-200 dark:border-zinc-700 hover:border-rose-600 dark:hover:border-rose-500'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-1.5 sm:pr-2">
                        {/* Grey box with thin red outline and white icon */}
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-zinc-700 dark:bg-zinc-700 border border-rose-600 dark:border-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                          {opt.type.includes('video') ? (
                            <FileVideo className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : opt.type === 'audio' ? (
                            <FileAudio className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-0.5">
                            <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate">
                              {opt.label}
                            </span>
                            {opt.badge && (
                              <span
                                className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide ${
                                  opt.recommend
                                    ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60'
                                    : opt.type === 'video_watermark'
                                    ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                                    : 'bg-zinc-200/80 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-300/60 dark:border-zinc-600'
                                }`}
                              >
                                {opt.badge}
                              </span>
                            )}
                            {opt.sizeFormatted && (
                              <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                {opt.sizeFormatted}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] sm:text-xs truncate text-zinc-500 dark:text-zinc-400">
                            {opt.description || opt.quality}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="inline-flex items-center gap-1 sm:gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm transition-all group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-rose-600 group-hover:text-white">
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden xs:inline">{isDownloading ? 'Saving...' : 'Download'}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Photo Slideshow extra actions if applicable */}
              {result.isPhotoSlide && result.images && result.images.length > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <h4 className="text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-2">Individual Photos ({result.images.length})</h4>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {result.images.map((imgUrl, i) => (
                      <button
                        key={i}
                        id={`download-slide-img-${i}`}
                        onClick={async () => {
                          if (onDownloadAttempt && !onDownloadAttempt()) {
                            return;
                          }
                          const baseName = cleanForFilename(customFilename.trim()) || presetCreatorCaption;
                          const safeFilename = `${baseName}_photo_${i + 1}`;
                          try {
                            const downloadEndpoint = `/api/proxy-download?url=${encodeURIComponent(imgUrl)}&filename=${encodeURIComponent(safeFilename)}&ext=jpg`;
                            const response = await fetch(downloadEndpoint);
                            if (!response.ok) throw new Error('Download failed');
                            const blob = await response.blob();
                            const blobUrl = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = blobUrl;
                            link.setAttribute('download', `${safeFilename}.jpg`);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="relative aspect-square rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 group hover:border-pink-500 transition-colors cursor-pointer"
                      >
                        <img
                          src={imgUrl}
                          alt={`Slide ${i + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                          <Download className="w-4 h-4" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
