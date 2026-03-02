import { Link, Outlet } from 'react-router-dom';
import { useLang } from '../lang';
import { useEnv } from '../env';

function FlagNorway() {
  return (
    <svg viewBox="0 0 22 16" width="22" height="16" aria-hidden="true">
      <rect width="22" height="16" fill="#EF2B2D" />
      <rect x="6" width="4" height="16" fill="#FFFFFF" />
      <rect y="6" width="22" height="4" fill="#FFFFFF" />
      <rect x="7" width="2" height="16" fill="#002868" />
      <rect y="7" width="22" height="2" fill="#002868" />
    </svg>
  );
}

function FlagUK() {
  return (
    <svg viewBox="0 0 60 30" width="22" height="16" aria-hidden="true">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}

export default function Layout() {
  const { lang, setLang, t } = useLang();
  const { env, setEnv } = useEnv();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--ds-color-neutral-background-tinted)' }}>
      <header style={{ backgroundColor: 'var(--ds-color-neutral-base-default)', color: 'var(--ds-color-neutral-base-contrast-default)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="no-underline flex items-center gap-3 text-white">
            <img src="/logo_houses.png" alt="" className="h-9" />
            <span className="text-lg font-semibold">tjenesteoversikten.no</span>
          </Link>
          <div className="flex items-center gap-5">
            <nav className="flex gap-4 text-sm">
              <Link className="text-white/80 hover:text-white hover:underline" to="/">
                {t('nav.home')}
              </Link>
              <Link className="text-white/80 hover:text-white hover:underline" to="/about">
                {t('nav.about')}
              </Link>
            </nav>
            <div className="flex gap-1 items-center">
              <button
                onClick={() => setEnv('tt02')}
                className={`text-xs font-medium px-2 py-1 rounded ${env === 'tt02' ? 'bg-white/20 text-white ring-1 ring-white/50' : 'text-white/60 hover:text-white'}`}
                aria-label="TT02"
                title="Test environment (TT02)"
              >
                TT02
              </button>
              <button
                onClick={() => setEnv('prod')}
                className={`text-xs font-medium px-2 py-1 rounded ${env === 'prod' ? 'bg-white/20 text-white ring-1 ring-white/50' : 'text-white/60 hover:text-white'}`}
                aria-label="Prod"
                title="Production environment"
              >
                PROD
              </button>
            </div>
            <div className="flex gap-1 items-center">
              <button
                onClick={() => setLang('nb')}
                className={`leading-none p-1 rounded flex items-center ${lang === 'nb' ? 'ring-1 ring-white/50' : 'opacity-60 hover:opacity-100'}`}
                aria-label="Norsk"
                title="Norsk"
              >
                <FlagNorway />
              </button>
              <button
                onClick={() => setLang('en')}
                className={`leading-none p-1 rounded flex items-center ${lang === 'en' ? 'ring-1 ring-white/50' : 'opacity-60 hover:opacity-100'}`}
                aria-label="English"
                title="English"
              >
                <FlagUK />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
