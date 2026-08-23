import React from 'react';
import { Film, Sun, Moon, User as UserIcon, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { UserAccount } from '../types';

interface NavbarProps {
  user: UserAccount | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenLogin,
  onLogout,
  isDarkMode,
  onToggleTheme,
}) => {
  return (
    <header className="w-full border-b border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/85 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-cyan-400 p-[1.5px] sm:p-[2px] shadow-sm flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-zinc-950 rounded-[9px] sm:rounded-[10px] flex items-center justify-center">
              <Film className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-base sm:text-lg text-zinc-900 dark:text-white tracking-tight truncate">
                TokDownloader
              </span>
              <span className="hidden xs:inline-block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-pink-100 dark:bg-pink-950/70 text-pink-700 dark:text-pink-300 border border-pink-200/60 dark:border-pink-800/50">
                HD No Watermark
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden md:block">TikTok Video & Audio Downloader</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Dark / Light Mode Toggle Switch */}
          <button
            id="theme-toggle-switch"
            type="button"
            role="switch"
            aria-checked={isDarkMode}
            aria-label="Toggle dark mode"
            onClick={onToggleTheme}
            className="flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/70 rounded-full p-1 transition-all cursor-pointer shadow-sm select-none"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <div
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all ${
                !isDarkMode
                  ? 'bg-amber-400 text-zinc-900 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all ${
                isDarkMode
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className="text-xs font-semibold px-1.5 pr-2 hidden md:inline text-zinc-700 dark:text-zinc-300">
              {isDarkMode ? 'Dark' : 'Light'}
            </span>
          </button>

          {/* User Login / Account Section */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 sm:px-3 py-1.5 max-w-[140px] sm:max-w-[200px]" title={user.email}>
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">
                  {user.name || user.email.split('@')[0]}
                </span>
                <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Unlimited Active" />
              </div>
              <button
                id="user-logout-btn"
                onClick={onLogout}
                className="p-1.5 text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="nav-login-btn"
              onClick={onOpenLogin}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:from-pink-700 hover:via-rose-700 hover:to-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm shadow-rose-600/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Log In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};


