import BrandLogo from "./BrandLogo.jsx";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/95 dark:bg-[#070b14]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-blue-500/15 pt-5 mobile-footer-safe md:pb-6 mt-auto no-print text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-2 text-center font-khmer">
        <div className="flex items-center justify-center gap-2">
          <BrandLogo size="xs" showSubtitle={false} />
          <span className="font-bold text-slate-900 dark:text-white">
            MyPintou (Myពិន្ទុ)
          </span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">ប្រព័ន្ធគ្រប់គ្រងពិន្ទុ និងការវាយតម្លៃសិក្សាឆ្លាតវៃ</span>
        </div>
        <div>
          <span>រក្សាសិទ្ធិគ្រប់យ៉ាង © {currentYear} លោកគ្រូ ធីលាង | Telegram </span>
          <a
            href="https://t.me/LeangOCL"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium underline font-mono"
          >
            @LeangOCL
          </a>
        </div>
      </div>
    </footer>
  );
}
