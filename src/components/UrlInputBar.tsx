import React, { useState } from 'react';
import { Search, Clipboard, X, Loader2, Sparkles, Link2, Clock, Zap, ShieldCheck } from 'lucide-react';

interface UrlInputBarProps {
  url: string;
  setUrl: (url: string) => void;
  onSubmit: (url: string) => void;
  isLoading: boolean;
  onSelectSample: (sampleUrl: string) => void;
  downloadCount: number;
  maxFreeDownloads: number;
  isLoggedIn: boolean;
  onOpenAuth: () => void;
  historyCount: number;
  onOpenHistory: () => void;
}

const SAMPLE_LINKS = [
  {
    label: 'Trending Video',
    url: 'https://vm.tiktok.com/ZMhYv2p4k/',
  },
  {
    label: 'Viral Sound & Clip',
    url: 'https://www.tiktok.com/@scout2015/video/6718335390845095173',
  },
];

export const UrlInputBar: React.FC<UrlInputBarProps> = ({
  url,
  setUrl,
  onSubmit,
  isLoading,
  onSelectSample,
  downloadCount,
  maxFreeDownloads,
  isLoggedIn,
  onOpenAuth,
  historyCount,
  onOpenHistory,
}) => {
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && !isLoading) {
      onSubmit(url.trim());
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setCopiedNotification(true);
        setTimeout(() => setCopiedNotification(false), 2000);
      }
    } catch {
      // Clipboard access might be denied in some iframe permissions, fallback gracefully
    }
  };

  const remainingDownloads = Math.max(0, maxFreeDownloads - downloadCount);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-white dark:bg-zinc-900 rounded-2xl p-2 sm:p-2.5 shadow-xl shadow-rose-500/5 border-2 border-zinc-200 dark:border-zinc-800 focus-within:border-rose-500 dark:focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10 dark:focus-within:ring-rose-500/20 transition-all">
          <div className="flex items-center flex-1 min-w-0 px-3 py-2 sm:py-0 bg-transparent dark:bg-transparent">
            <Link2 className="w-5 h-5 text-zinc-400 dark:text-zinc-500 shrink-0 mr-2.5" />
            <input
              id="tiktok-url-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste TikTok video link here (e.g. https://www.tiktok.com/@user/video/...)"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              className="w-full text-sm sm:text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-transparent dark:bg-transparent disabled:bg-transparent dark:disabled:bg-transparent disabled:opacity-80 border-none outline-none focus:outline-none focus:ring-0 shadow-none"
              disabled={isLoading}
            />

            {url && (
              <button
                id="clear-url-btn"
                type="button"
                onClick={() => setUrl('')}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors mr-1 cursor-pointer"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              id="paste-clipboard-btn"
              type="button"
              onClick={handlePaste}
              className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 border border-rose-100 dark:border-zinc-700 px-2.5 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer"
              title="Paste link from clipboard"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Paste Link</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full mt-2 sm:mt-0 sm:flex sm:items-center sm:w-auto">
            <button
              id="mobile-paste-btn"
              type="button"
              onClick={handlePaste}
              className="sm:hidden w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 border border-rose-100 dark:border-zinc-700 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Clipboard className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Paste Link</span>
            </button>

            <button
              id="download-submit-btn"
              type="submit"
              disabled={isLoading || !url.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 disabled:opacity-50 text-white font-semibold text-xs py-2 sm:py-1.5 px-3 sm:px-3.5 rounded-lg shadow-md shadow-pink-600/20 active:scale-[0.98] transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Download</span>
                </>
              )}
            </button>
          </div>
        </div>

        {copiedNotification && (
          <p className="absolute -top-7 left-4 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-zinc-900 border border-rose-200 dark:border-zinc-700 px-2 py-0.5 rounded shadow-sm">
            Pasted from clipboard!
          </p>
        )}
      </form>

      {/* Quick Links, Download Counter & History Button Bar */}
      <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500 font-medium">
          <Sparkles className="w-3 h-3 text-rose-500" />
          Test with sample:
        </span>

        {SAMPLE_LINKS.map((sample, idx) => (
          <button
            key={idx}
            id={`sample-link-${idx}`}
            onClick={() => {
              setUrl(sample.url);
              onSelectSample(sample.url);
            }}
            className="text-zinc-600 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 bg-zinc-100/80 dark:bg-zinc-900 hover:bg-rose-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 hover:border-rose-200 dark:hover:border-zinc-700 px-2.5 py-1 rounded-full transition-colors font-medium cursor-pointer"
          >
            {sample.label}
          </button>
        ))}

        {/* Separator */}
        <span className="text-zinc-300 dark:text-zinc-700 select-none hidden xs:inline">•</span>

        {/* Counter Button (next to Viral Sound & Clip) */}
        {isLoggedIn ? (
          <div
            id="download-counter-badge"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-xs"
            title="Unlimited downloads unlocked"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Unlimited Downloads</span>
          </div>
        ) : (
          <button
            id="download-counter-btn"
            type="button"
            onClick={onOpenAuth}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold transition-all cursor-pointer border shadow-xs ${
              remainingDownloads > 0
                ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60'
                : 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 animate-pulse'
            }`}
            title={remainingDownloads > 0 ? `${remainingDownloads} free downloads remaining. Click to create free account.` : '0 free downloads remaining. Click to create free account to continue.'}
          >
            <Zap className={`w-3.5 h-3.5 ${remainingDownloads > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`} />
            <span>
              {remainingDownloads > 0 ? (
                <>
                  <strong className="font-bold">{remainingDownloads}/3</strong> Free Downloads
                </>
              ) : (
                <>
                  <strong className="font-bold">0/3</strong> Free Downloads • <span className="underline">Sign In</span>
                </>
              )}
            </span>
          </button>
        )}

        {/* History Button (moved down into the body next to counter) */}
        <button
          id="body-history-btn"
          type="button"
          onClick={onOpenHistory}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer shadow-xs"
          title="View recent downloaded videos"
        >
          <Clock className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
          <span>History</span>
          {historyCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[16px] h-4 text-[10px] font-bold text-white bg-rose-600 rounded-full px-1">
              {historyCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

