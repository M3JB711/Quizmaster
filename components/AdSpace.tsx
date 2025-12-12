import React, { useEffect, useRef } from 'react';
import { translations, Language } from '../translations';

// --- AD CONFIGURATION ---
// Toggle this to 'adsense' to use the HTML snippets defined below.
// Toggle to 'manual' to use the images defined below.
const AD_MODE: 'manual' | 'adsense' = 'manual';

const AD_DATA = {
  manual: {
    sidebar: {
      image: 'https://placehold.co/300x600/4f46e5/ffffff?text=Your+Ad+Here',
      link: 'https://example.com'
    },
    banner: {
      image: 'https://placehold.co/728x90/4f46e5/ffffff?text=Your+Ad+Here',
      link: 'https://example.com'
    }
  },
  adsense: {
    // PASTE YOUR SIDEBAR AD CODE BELOW
    // Example: <ins class="adsbygoogle" ...></ins>
    sidebar: `
      <div style="background:#f1f5f9; height:600px; display:flex; align-items:center; justify-content:center; color:#64748b; font-size:14px; text-align:center; padding:20px;">
        <p>AdSense Sidebar Unit<br/>(Paste code in components/AdSpace.tsx)</p>
      </div>
    `,
    // PASTE YOUR BOTTOM BANNER AD CODE BELOW
    banner: `
      <div style="background:#f1f5f9; height:90px; display:flex; align-items:center; justify-content:center; color:#64748b; font-size:14px;">
        <p>AdSense Banner Unit</p>
      </div>
    `
  }
};

interface AdSpaceProps {
  position: 'sidebar' | 'banner';
  language: Language;
  className?: string;
}

const AdSpace: React.FC<AdSpaceProps> = ({ position, language, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  useEffect(() => {
    // Cast AD_MODE to string to avoid TypeScript "no overlap" error when AD_MODE is strictly 'manual'
    if ((AD_MODE as string) === 'adsense' && containerRef.current) {
      // If using actual AdSense <ins> tags, you often need to trigger the push:
      // try {
      //   (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      //   (window as any).adsbygoogle.push({});
      // } catch (e) {
      //   console.error("AdSense error:", e);
      // }
    }
  }, [position]);

  return (
    <div className={`w-full flex flex-col items-center justify-center my-6 ${className}`}>
      <span className="text-[10px] uppercase tracking-widest text-slate-400 mb-2 font-semibold">
        {t.sponsored}
      </span>
      
      <div 
        ref={containerRef}
        className="overflow-hidden bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
      >
        {AD_MODE === 'manual' ? (
          <a 
            href={AD_DATA.manual[position].link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block opacity-95 hover:opacity-100 transition-opacity"
          >
            <img 
              src={AD_DATA.manual[position].image} 
              alt="Advertisement" 
              className={`object-cover ${
                position === 'sidebar' 
                  ? 'w-full max-w-[300px] h-auto' 
                  : 'w-full max-w-[728px] h-auto'
              }`}
            />
          </a>
        ) : (
          <div 
             className={`${
                position === 'sidebar' 
                  ? 'min-h-[250px] w-full max-w-[300px]' 
                  : 'min-h-[90px] w-full max-w-[728px]'
             }`}
             dangerouslySetInnerHTML={{ __html: AD_DATA.adsense[position] }}
          />
        )}
      </div>
    </div>
  );
};

export default AdSpace;