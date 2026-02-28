import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heading,
  Paragraph,
  Search,
  SearchInput,
  SearchClear,
  Card,
  CardBlock,
  Spinner,
  Alert,
} from '@digdir/designsystemet-react';
import type { Org, OrgList } from '../types';
import { getText, OrgLogo } from '../helpers';
import { useLang } from '../lang';

export default function HomePage() {
  const { lang, t } = useLang();
  const [orgs, setOrgs] = useState<Record<string, Org>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/v1/tt02/resource/orgs')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch orgs: ${res.status}`);
        return res.json() as Promise<OrgList>;
      })
      .then((data) => {
        setOrgs(data.orgs ?? {});
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const sortedOrgs = useMemo(() => {
    return Object.entries(orgs)
      .map(([code, org]) => ({ code, ...org }))
      .filter((org) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const name = getText(org.name, lang).toLowerCase();
        return name.includes(q) || org.code.toLowerCase().includes(q);
      })
      .sort((a, b) => getText(a.name, lang).localeCompare(getText(b.name, lang), lang === 'nb' ? 'nb' : 'en'));
  }, [orgs, searchQuery, lang]);

  return (
    <>
      {/* Hero */}
      <section className="text-center mb-10">
        <Heading level={2} data-size="xl" className="mb-3">
          {t('home.hero.title')}
        </Heading>
        <Paragraph data-size="lg">
          {t('home.hero.subtitle')}
        </Paragraph>
      </section>

      {/* Search */}
      <section className="max-w-lg mx-auto mb-10">
        <Search>
          <SearchInput
            aria-label={t('home.search.aria')}
            placeholder={t('home.search.placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchClear onClick={() => setSearchQuery('')} />
        </Search>
      </section>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <Spinner aria-label={t('loading')} data-size="lg" />
        </div>
      )}

      {/* Error */}
      {error && (
        <Alert data-color="danger" className="mb-6">
          {t('error.loadOrgs')}: {error}
        </Alert>
      )}

      {/* Org grid */}
      {!loading && !error && (
        <>
          <div className="flex items-center justify-between mb-6">
            <Heading level={3} data-size="sm">
              {t('home.serviceOwners')} ({sortedOrgs.length})
            </Heading>
          </div>

          {sortedOrgs.length === 0 ? (
            <Paragraph className="text-center py-16 text-gray-500">
              {t('home.noMatch')}
            </Paragraph>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {sortedOrgs.map((org) => (
                <Link key={org.code} to={`/org/${org.code}`} className="no-underline">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardBlock className="flex flex-col items-center text-center p-4 gap-3">
                      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                        {org.logo ? (
                          <OrgLogo src={org.logo} alt={getText(org.name, lang)} fallback={org.code} />
                        ) : (
                          <span className="text-lg font-semibold text-gray-400">
                            {org.code.substring(0, 3).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <Heading level={4} data-size="2xs">
                        {getText(org.name, lang)}
                      </Heading>
                    </CardBlock>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
