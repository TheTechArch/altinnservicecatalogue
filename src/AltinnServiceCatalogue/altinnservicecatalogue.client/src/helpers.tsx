import { useState } from 'react';

export function getText(dict: Record<string, string> | undefined | null, lang = 'nb'): string {
  if (!dict) return '';
  return dict[lang] || dict['nb'] || dict['nn'] || dict['en'] || Object.values(dict)[0] || '';
}

export function OrgLogo({ src, alt, fallback }: { src: string; alt: string; fallback: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="text-lg font-semibold text-gray-400">
        {fallback.substring(0, 3).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={`${alt} logo`}
      className="w-12 h-12 object-contain"
      onError={() => setFailed(true)}
    />
  );
}
