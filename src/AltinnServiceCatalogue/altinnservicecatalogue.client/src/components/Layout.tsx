import { Link, Outlet } from 'react-router-dom';
import { Heading } from '@digdir/designsystemet-react';
import { useLang } from '../lang';

export default function Layout() {
  const { lang, setLang, t } = useLang();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="no-underline">
            <Heading level={1} data-size="md">
              {t('app.title')}
            </Heading>
          </Link>
          <div className="flex items-center gap-5">
            <nav className="flex gap-4 text-sm">
              <Link className="hover:underline" to="/">
                {t('nav.home')}
              </Link>
              <a className="hover:underline" href="#">
                {t('nav.about')}
              </a>
            </nav>
            <div className="flex gap-1 items-center">
              <button
                onClick={() => setLang('nb')}
                className={`text-xl leading-none p-1 rounded ${lang === 'nb' ? 'ring-2 ring-blue-500' : 'opacity-60 hover:opacity-100'}`}
                aria-label="Norsk"
                title="Norsk"
              >
                &#127475;&#127476;
              </button>
              <button
                onClick={() => setLang('en')}
                className={`text-xl leading-none p-1 rounded ${lang === 'en' ? 'ring-2 ring-blue-500' : 'opacity-60 hover:opacity-100'}`}
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
