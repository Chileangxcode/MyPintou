import React from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';

/**
 * MyPintou (Myពិន្ទុ) - Official Brand Logo Component
 * Incorporates Gen Z, Gamified (LevelUp), and Cyber-Academic aesthetics:
 * - App Icon: Stylized 'P' with Upward Growth Arrow
 * - Text: 'My' in Tech Cyan, 'ពិន្ទុ' in vibrant Sunset Gradient
 * - Accent: A+ Star Badge & LevelUp micro-badge
 */
import { useSchool } from '../context/SchoolContext.jsx';

export default function BrandLogo({ 
  size = 'md', 
  showSubtitle = true, 
  showIcon = true,
  iconOnly = false,
  customLogo = null,
  className = '' 
}) {
  const { schoolInfo } = useSchool();
  const logoSrc = customLogo || schoolInfo?.schoolLogoUrl || "/assets/images/app_icon.svg";

  const sizeMap = {
    xs: { icon: 'w-6 h-6', text: 'text-base', sub: 'text-[9px]', badge: 'text-[8px] px-1 py-0.5' },
    sm: { icon: 'w-8 h-8', text: 'text-lg', sub: 'text-[10px]', badge: 'text-[9px] px-1.5 py-0.5' },
    md: { icon: 'w-10 h-10', text: 'text-xl', sub: 'text-xs', badge: 'text-[10px] px-2 py-0.5' },
    lg: { icon: 'w-14 h-14', text: 'text-3xl', sub: 'text-sm', badge: 'text-xs px-2.5 py-1' },
    xl: { icon: 'w-20 h-20', text: 'text-4xl', sub: 'text-base', badge: 'text-sm px-3 py-1' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  if (iconOnly) {
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <img 
          src={logoSrc} 
          alt="School Logo" 
          onError={(e) => { e.currentTarget.src = "/assets/images/app_icon.svg"; }}
          className={`${currentSize.icon} object-contain rounded-2xl shadow-lg shadow-cyan-500/20 hover:scale-105 transition-transform duration-300`} 
        />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-gradient-to-r from-amber-400 to-rose-500"></span>
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
      {showIcon && (
        <div className="relative flex-shrink-0">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-pink-500 to-amber-400 rounded-2xl blur-md opacity-40 group-hover:opacity-75 transition duration-500"></div>
          <img 
            src={logoSrc} 
            alt="School Logo" 
            onError={(e) => { e.currentTarget.src = "/assets/images/app_icon.svg"; }}
            className={`relative ${currentSize.icon} object-contain rounded-xl shadow-md transform group-hover:rotate-3 transition duration-300`} 
          />
        </div>
      )}

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black font-khmer tracking-tight ${currentSize.text} text-cyan-400 dark:text-cyan-300 drop-shadow-[0_2px_10px_rgba(6,182,212,0.4)]`}>
            My
          </span>
          <span className={`font-black font-khmer tracking-tight ${currentSize.text} bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(244,63,94,0.35)]`}>
            ពិន្ទុ
          </span>
          <span className={`font-bold font-khmer uppercase tracking-wider rounded-full bg-gradient-to-r from-amber-400/20 via-pink-500/20 to-cyan-500/20 border border-amber-400/40 text-amber-500 dark:text-amber-300 ${currentSize.badge} flex items-center gap-0.5 ml-0.5 shadow-sm`}>
            <Sparkles className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
            <span>A+</span>
          </span>
        </div>

        {showSubtitle && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`font-medium font-khmer text-slate-500 dark:text-slate-400 tracking-wide ${currentSize.sub}`}>
              MyPintou
            </span>
            <span className="w-1 h-1 rounded-full bg-cyan-400"></span>
            <span className={`font-semibold font-khmer text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 ${currentSize.sub} flex items-center gap-0.5`}>
              <TrendingUp className="w-2.5 h-2.5 text-cyan-400 inline" /> រីកចម្រើន LevelUp
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
