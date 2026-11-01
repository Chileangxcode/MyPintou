import React, { useState, useEffect } from "react";
import { WifiOff, Wifi, AlertCircle } from "lucide-react";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowRestored(true);
      const timer = setTimeout(() => setShowRestored(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowRestored(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline && !showRestored) {
    return null;
  }

  return (
    <div className="no-print">
      {isOffline && (
        <div className="bg-rose-600/95 text-white px-4 py-2 text-xs font-khmer flex items-center justify-center gap-2 shadow-md backdrop-blur-md sticky top-0 z-50">
          <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
          <span>
            <strong>គ្មានការតភ្ជាប់អ៊ីនធឺណិត (Offline)៖</strong> កម្មវិធីកំពុងដំណើរការក្នុងទម្រង់ Offline Shell។ ទិន្នន័យថ្មី ឬការកែប្រែពិន្ទុតម្រូវឱ្យមានអ៊ីនធឺណិត ដើម្បីធ្វើសមកាលកម្មជាមួយ Google Sheets។
          </span>
        </div>
      )}

      {showRestored && !isOffline && (
        <div className="bg-emerald-600/95 text-white px-4 py-2 text-xs font-khmer flex items-center justify-center gap-2 shadow-md backdrop-blur-md sticky top-0 z-50 animate-fade-in">
          <Wifi className="w-4 h-4 shrink-0" />
          <span>
            <strong>ការតភ្ជាប់បានត្រឡប់មកវិញ (Online)៖</strong> សេវាអ៊ីនធឺណិតដំណើរការឡើងវិញជាធម្មតា។
          </span>
        </div>
      )}
    </div>
  );
}

