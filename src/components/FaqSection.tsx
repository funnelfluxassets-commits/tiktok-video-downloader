import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: 'How do I download a TikTok video without the watermark?',
    a: 'Simply copy the TikTok video link from the app or website, paste it into the URL field above, and click "Download". Our system automatically extracts and serves the clean MP4 video without watermarks.',
  },
  {
    q: 'Can I extract and download only the audio (MP3) from a TikTok video?',
    a: 'Yes! When a video is extracted, you will see a "Download Audio (MP3)" option. You can listen to the sound in our player or download the high-quality 320kbps MP3 audio file directly.',
  },
  {
    q: 'Does it work with TikTok slideshows / photo mode?',
    a: 'Yes, if you paste a link to a TikTok photo carousel, you will be able to download each photo in full HD quality along with the background music track.',
  },
  {
    q: 'Where are the downloaded videos saved on my phone or computer?',
    a: 'Videos and MP3 files are saved to your browser\'s default "Downloads" folder. On iPhones, you can find them in the Files app or your Safari downloads menu.',
  },
  {
    q: 'Can I download private TikTok videos?',
    a: 'No. To respect user privacy and copyright guidelines, this tool only processes publicly accessible TikTok videos.',
  },
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="w-full max-w-4xl mx-auto pt-8 sm:pt-12 pb-[80px] px-3.5 sm:px-6">
      <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800/60 mb-7">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Got Questions? We’ve Got Answers.
        </h2>
      </div>

      <div className="space-y-2.5 sm:space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-all shadow-sm"
            >
              <button
                id={`faq-toggle-${idx}`}
                onClick={() => toggle(idx)}
                className="w-full px-4 sm:px-6 py-3.5 sm:py-4 text-left flex items-center justify-between gap-3 font-semibold text-zinc-900 dark:text-zinc-100 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
              >
                <span className="text-xs sm:text-sm md:text-base leading-snug">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 text-zinc-400 dark:text-zinc-500 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-rose-600 dark:text-rose-400' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 sm:px-6 pb-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
