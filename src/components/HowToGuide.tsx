import React from 'react';
import { Copy, Link, DownloadCloud, Sparkles } from 'lucide-react';

export const HowToGuide: React.FC = () => {
  const steps = [
    {
      num: '1',
      title: 'Copy the TikTok Link',
      desc: 'Open TikTok on your phone or browser, find your video, tap the "Share" icon and click "Copy Link".',
      icon: Link,
      color: 'from-pink-500 to-rose-500',
    },
    {
      num: '2',
      title: 'Paste into TikExtract',
      desc: 'Paste the copied URL into the box above and tap the "Download" button to fetch high-definition formats.',
      icon: Copy,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      num: '3',
      title: 'Save HD Video or MP3',
      desc: 'Choose your desired format (HD with no watermark, standard MP4, or MP3 audio) and download instantly.',
      icon: DownloadCloud,
      color: 'from-emerald-500 to-teal-500',
    },
  ];

  return (
    <section id="how-it-works-section" className="w-full max-w-5xl mx-auto py-8 sm:py-12 px-3.5 sm:px-6">
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800/60 mb-7">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simple 3-Step Process</span>
        </div>
        <h2 className="text-xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          How to Download TikTok Videos Without Watermark
        </h2>
        <p className="text-xs sm:text-base text-zinc-600 dark:text-zinc-400 mt-2">
          Extract original TikTok MP4 videos and MP3 sounds with zero software installation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="relative bg-white dark:bg-zinc-900 rounded-2xl p-5 md:p-4.5 lg:p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${s.color} text-white flex items-center justify-center shadow-md`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-zinc-200/90 dark:text-zinc-800">{s.num}</span>
                </div>
                <h3 className="text-sm md:text-[15px] lg:text-base font-bold text-zinc-900 dark:text-white mb-1.5 md:tracking-tight md:whitespace-nowrap lg:whitespace-normal">{s.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
