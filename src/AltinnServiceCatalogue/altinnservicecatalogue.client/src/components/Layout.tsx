import { Link, Outlet } from 'react-router-dom';
import { Heading } from '@digdir/designsystemet-react';
import { useLang } from '../lang';
import { useEnv } from '../env';

export default function Layout() {
  const { lang, setLang, t } = useLang();
  const { env, setEnv } = useEnv();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--ds-color-neutral-background-tinted)' }}>
      <header style={{ backgroundColor: 'var(--ds-color-neutral-base-default)', color: 'var(--ds-color-neutral-base-contrast-default)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="no-underline flex items-center gap-3 text-white">
            <img src="/altinn-logo.svg" alt="Altinn" className="h-7 invert" />
            <Heading level={1} data-size="md" className="text-white">
              {t('app.title')}
            </Heading>
          </Link>
          <div className="flex items-center gap-5">
            <nav className="flex gap-4 text-sm">
              <Link className="text-white/80 hover:text-white hover:underline" to="/">
                {t('nav.home')}
              </Link>
              <a className="text-white/80 hover:text-white hover:underline" href="#">
                {t('nav.about')}
              </a>
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
                className={`text-xl leading-none p-1 rounded ${lang === 'nb' ? 'ring-1 ring-white/50' : 'opacity-60 hover:opacity-100'}`}
                aria-label="Norsk"
                title="Norsk"
              >
                &#127475;&#127476;
              </button>
              <button
                onClick={() => setLang('en')}
                className={`text-xl leading-none p-1 rounded ${lang === 'en' ? 'ring-1 ring-white/50' : 'opacity-60 hover:opacity-100'}`}
                aria-label="English"
                title="English"
              >
                &#127468;&#127463;
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
