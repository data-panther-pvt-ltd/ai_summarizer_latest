'use client';

import { useLanguage } from './LanguageContext';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  const isArabic = language === 'ar';
  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded border text-gray-700 hover:bg-gray-100"
      aria-label={isArabic ? 'Switch to English' : 'التحويل إلى العربية'}
      title={isArabic ? 'Switch to English' : 'التحويل إلى العربية'}
   >
      <span className="text-sm font-medium">{isArabic ? 'AR' : 'EN'}</span>
      <span className="text-xs text-gray-500">{isArabic ? 'العربية' : 'English'}</span>
    </button>
  );
}


