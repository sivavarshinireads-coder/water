import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Globe, ChevronDown, Search, Check } from 'lucide-react';

// ─── Full Language List ────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'en', name: 'English',    native: 'English',         flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi',      native: 'हिन्दी',           flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi',    native: 'मराठी',            flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil',      native: 'தமிழ்',             flag: '🇮🇳' },
  { code: 'te', name: 'Telugu',     native: 'తెలుగు',            flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada',    native: 'ಕನ್ನಡ',             flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam',  native: 'മലയാളം',           flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali',    native: 'বাংলা',             flag: '🇧🇩' },
  { code: 'gu', name: 'Gujarati',   native: 'ગુજરાતી',           flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi',    native: 'ਪੰਜਾਬੀ',            flag: '🇮🇳' },
  { code: 'or', name: 'Odia',       native: 'ଓଡ଼ିଆ',             flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu',       native: 'اردو',              flag: '🇵🇰' },
  { code: 'ne', name: 'Nepali',     native: 'नेपाली',            flag: '🇳🇵' },
  { code: 'si', name: 'Sinhala',    native: 'සිංහල',             flag: '🇱🇰' },
  { code: 'es', name: 'Spanish',    native: 'Español',          flag: '🇪🇸' },
  { code: 'fr', name: 'French',     native: 'Français',         flag: '🇫🇷' },
  { code: 'de', name: 'German',     native: 'Deutsch',          flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', native: 'Português',        flag: '🇧🇷' },
  { code: 'it', name: 'Italian',    native: 'Italiano',         flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch',      native: 'Nederlands',       flag: '🇳🇱' },
  { code: 'pl', name: 'Polish',     native: 'Polski',           flag: '🇵🇱' },
  { code: 'ru', name: 'Russian',    native: 'Русский',          flag: '🇷🇺' },
  { code: 'uk', name: 'Ukrainian',  native: 'Українська',       flag: '🇺🇦' },
  { code: 'cs', name: 'Czech',      native: 'Čeština',          flag: '🇨🇿' },
  { code: 'sk', name: 'Slovak',     native: 'Slovenčina',       flag: '🇸🇰' },
  { code: 'ro', name: 'Romanian',   native: 'Română',           flag: '🇷🇴' },
  { code: 'hu', name: 'Hungarian',  native: 'Magyar',           flag: '🇭🇺' },
  { code: 'sv', name: 'Swedish',    native: 'Svenska',          flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian',  native: 'Norsk',            flag: '🇳🇴' },
  { code: 'da', name: 'Danish',     native: 'Dansk',            flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish',    native: 'Suomi',            flag: '🇫🇮' },
  { code: 'el', name: 'Greek',      native: 'Ελληνικά',         flag: '🇬🇷' },
  { code: 'tr', name: 'Turkish',    native: 'Türkçe',           flag: '🇹🇷' },
  { code: 'ar', name: 'Arabic',     native: 'العربية',           flag: '🇸🇦' },
  { code: 'fa', name: 'Persian',    native: 'فارسی',             flag: '🇮🇷' },
  { code: 'he', name: 'Hebrew',     native: 'עברית',             flag: '🇮🇱' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', native: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', native: '繁體中文', flag: '🇹🇼' },
  { code: 'ja', name: 'Japanese',   native: '日本語',             flag: '🇯🇵' },
  { code: 'ko', name: 'Korean',     native: '한국어',             flag: '🇰🇷' },
  { code: 'th', name: 'Thai',       native: 'ภาษาไทย',           flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt',       flag: '🇻🇳' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia',  flag: '🇮🇩' },
  { code: 'ms', name: 'Malay',      native: 'Bahasa Melayu',    flag: '🇲🇾' },
  { code: 'fil', name: 'Filipino',  native: 'Filipino',         flag: '🇵🇭' },
  { code: 'sw', name: 'Swahili',    native: 'Kiswahili',        flag: '🇰🇪' },
  { code: 'am', name: 'Amharic',    native: 'አማርኛ',             flag: '🇪🇹' },
  { code: 'af', name: 'Afrikaans',  native: 'Afrikaans',        flag: '🇿🇦' },
];

// Trigger Google Translate for a given language code
function triggerGoogleTranslate(langCode: string) {
  // Method 1: via the select element Google Translate injects
  const trySelect = () => {
    const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
      return true;
    }
    return false;
  };

  if (!trySelect()) {
    // Script may still be loading – retry for up to 3s
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (trySelect() || attempts > 30) clearInterval(interval);
    }, 100);
  }
}

interface GoogleTranslateProps {
  variant?: 'light' | 'dark'; // light = for dashboards, dark = for landing hero
}

const GoogleTranslate: React.FC<GoogleTranslateProps> = ({ variant = 'light' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(LANGUAGES[0]);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = search.trim()
    ? LANGUAGES.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.native.toLowerCase().includes(search.toLowerCase())
      )
    : LANGUAGES;

  const handleSelect = useCallback((lang: typeof LANGUAGES[0]) => {
    setSelected(lang);
    setIsOpen(false);
    setSearch('');
    if (lang.code === 'en') {
      // Restore original page
      const banner = document.querySelector<HTMLElement>('.goog-te-banner-frame');
      if (banner) banner.style.display = 'none';
      const iframe = document.querySelector<HTMLIFrameElement>('.goog-te-banner-frame');
      if (iframe) (iframe as any).src = '';
      triggerGoogleTranslate('en');
      // Try to revert
      const restore = (window as any).google?.translate?.TranslateElement?.restorePage;
      if (restore) restore();
    } else {
      triggerGoogleTranslate(lang.code);
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => searchRef.current?.focus(), 80);
  }, [isOpen]);

  const isDark = variant === 'dark';

  const btnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 11px 6px 9px',
    borderRadius: 10,
    border: isDark ? '1px solid rgba(255,255,255,0.25)' : '1.5px solid #e2e8f0',
    background: isDark ? 'rgba(255,255,255,0.12)' : '#fff',
    backdropFilter: isDark ? 'blur(12px)' : 'none',
    color: isDark ? '#fff' : '#1e293b',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    whiteSpace: 'nowrap' as const,
    fontFamily: 'inherit',
    boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.07)',
  };

  return (
    <>
      <style>{`
        .gt-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 270px;
          background: #fff;
          border: 1.5px solid #e8edf5;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.08);
          z-index: 99999;
          overflow: hidden;
          animation: gt-drop-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes gt-drop-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .gt-search-wrap {
          padding: 10px 10px 6px;
          border-bottom: 1px solid #f1f5f9;
        }
        .gt-search-inner {
          display: flex;
          align-items: center;
          gap: 7px;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 9px;
          padding: 7px 10px;
          transition: border-color 0.15s;
        }
        .gt-search-inner:focus-within {
          border-color: #0d9488;
          background: #fff;
        }
        .gt-search-input {
          flex: 1;
          border: none;
          outline: none;
          background: none;
          font-size: 13px;
          color: #1e293b;
          font-family: inherit;
        }
        .gt-search-input::placeholder { color: #94a3b8; }
        .gt-list {
          max-height: 260px;
          overflow-y: auto;
          padding: 6px 6px;
          scrollbar-width: thin;
          scrollbar-color: #e2e8f0 transparent;
        }
        .gt-list::-webkit-scrollbar { width: 4px; }
        .gt-list::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
        .gt-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 9px;
          cursor: pointer;
          transition: background 0.12s;
          font-family: inherit;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }
        .gt-item:hover { background: #f0fdf9; }
        .gt-item--active { background: #f0fdf9; }
        .gt-flag { font-size: 18px; line-height: 1; flex-shrink: 0; }
        .gt-names { flex: 1; min-width: 0; }
        .gt-name { font-size: 13px; font-weight: 600; color: #1e293b; }
        .gt-native { font-size: 11.5px; color: #64748b; margin-top: 1px; }
        .gt-check { color: #0d9488; flex-shrink: 0; }
        .gt-header {
          padding: 8px 14px 4px;
          font-size: 10.5px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .gt-btn:hover {
          border-color: #0d9488 !important;
          background: ${isDark ? 'rgba(255,255,255,0.2)' : '#f0fdf9'} !important;
        }
        /* Hide the ugly Google Translate bar at the top */
        .goog-te-banner-frame { display: none !important; }
        body { top: 0 !important; }
        .skiptranslate { display: none !important; }
      `}</style>

      <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
        <button
          className="gt-btn"
          style={btnStyle}
          onClick={() => setIsOpen(v => !v)}
          aria-label="Select language"
          title="Change language"
        >
          <Globe size={14} style={{ opacity: 0.8, flexShrink: 0 }} />
          <span style={{ fontSize: 15 }}>{selected.flag}</span>
          <span>{selected.code === 'zh-CN' ? 'ZH' : selected.code === 'zh-TW' ? 'ZH' : selected.code === 'fil' ? 'FIL' : selected.code.toUpperCase()}</span>
          <ChevronDown
            size={13}
            style={{
              opacity: 0.65,
              flexShrink: 0,
              transition: 'transform 0.2s',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
            }}
          />
        </button>

        {isOpen && (
          <div className="gt-dropdown">
            {/* Search */}
            <div className="gt-search-wrap">
              <div className="gt-search-inner">
                <Search size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                <input
                  ref={searchRef}
                  className="gt-search-input"
                  type="text"
                  placeholder="Search language..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Language list */}
            <div className="gt-list">
              {!search && (
                <div className="gt-header">All Languages ({LANGUAGES.length})</div>
              )}
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8', fontSize: 13 }}>
                  No languages found
                </div>
              )}
              {filtered.map(lang => (
                <button
                  key={lang.code}
                  className={`gt-item ${selected.code === lang.code ? 'gt-item--active' : ''}`}
                  onClick={() => handleSelect(lang)}
                >
                  <span className="gt-flag">{lang.flag}</span>
                  <div className="gt-names">
                    <div className="gt-name">{lang.name}</div>
                    <div className="gt-native">{lang.native}</div>
                  </div>
                  {selected.code === lang.code && (
                    <Check size={14} className="gt-check" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GoogleTranslate;
