import React from 'react';
import { Zap, Music2, Smartphone, Sparkles } from 'lucide-react';

export const FeatureHighlights: React.FC = () => {
  const features = [
    {
      icon: Sparkles,
      title: 'No Watermark',
      desc: 'Get crystal-clear original MP4 files with all TikTok logos, usernames, and watermarks removed.',
      badge: '1080p HD',
    },
    {
      icon: Zap,
      title: 'Instant Extraction',
      desc: 'Blazing fast processing speeds with high-speed direct downloads straight to your device.',
      badge: 'Zero Lag',
    },
    {
      icon: Music2,
      title: 'Extract MP3 Audio',
      desc: 'Extract and download original soundtrack audio files in 320kbps MP3 format with one click.',
      badge: 'HQ Audio',
    },
    {
      icon: Smartphone,
      title: 'All Devices & Browsers',
      desc: 'Fully compatible with iPhone, Android, iPad, Mac, Windows, and Linux across all web browsers.',
      badge: 'Cross-platform',
    },
  ];

  return (
    <section className="w-full max-w-5xl mx-auto py-8 sm:py-12 px-3.5 sm:px-6">
      <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
        <h2 className="text-xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Why Use TokDownloader?
        </h2>
        <p className="text-xs sm:text-base text-zinc-600 dark:text-zinc-400 mt-2">
          The fastest and cleanest TikTok media downloader designed for creators and viewers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-rose-300 dark:hover:border-rose-800 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-900/50">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 px-2 py-0.5 rounded">
                    {f.badge}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white mb-1.5">{f.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
