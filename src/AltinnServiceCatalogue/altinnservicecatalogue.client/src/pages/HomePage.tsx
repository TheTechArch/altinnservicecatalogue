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
  Tabs,
  Tag,
} from '@digdir/designsystemet-react';
import type { Org, OrgList, ServiceResource } from '../types';
import { getText, OrgLogo } from '../helpers';
import { useLang } from '../lang';
import { useEnv } from '../env';

export default function HomePage() {
  const { lang, t } = useLang();
  const { env } = useEnv();

  // Org tab state
  const [orgs, setOrgs] = useState<Record<string, Org>>({});
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [errorOrgs, setErrorOrgs] = useState<string | null>(null);
  const [orgSearch, setOrgSearch] = useState('');

  // Resource type tab state
  const [resources, setResources] = useState<ServiceResource[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [errorTypes, setErrorTypes] = useState<string | null>(null);

  // Fetch orgs
  useEffect(() => {
    setLoadingOrgs(true);
    setErrorOrgs(null);
    fetch(`/api/v1/${env}/resource/orgs`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch orgs: ${res.status}`);
        return res.json() as Promise<OrgList>;
      })
      .then((data) => {
        setOrgs(data.orgs ?? {});
      })
      .catch((err) => {
        setErrorOrgs(err.message);
      })
      .finally(() => {
        setLoadingOrgs(false);
      });
  }, [env]);

  // Fetch resource list (for type grouping)
  useEffect(() => {
    setLoadingTypes(true);
    setErrorTypes(null);
    fetch(`/api/v1/${env}/resource/resourcelist`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch resources: ${res.status}`);
        return res.json() as Promise<ServiceResource[]>;
      })
      .then((data) => {
        setResources(data);
      })
      .catch((err) => {
        setErrorTypes(err.message);
      })
      .finally(() => {
        setLoadingTypes(false);
      });
  }, [env]);

  const sortedOrgs = useMemo(() => {
    return Object.entries(orgs)
      .map(([code, org]) => ({ code, ...org }))
      .filter((org) => {
        if (!orgSearch) return true;
        const q = orgSearch.toLowerCase();
        const name = getText(org.name, lang).toLowerCase();
        return name.includes(q) || org.code.toLowerCase().includes(q);
      })
      .sort((a, b) => getText(a.name, lang).localeCompare(getText(b.name, lang), lang === 'nb' ? 'nb' : 'en'));
  }, [orgs, orgSearch, lang]);

  const resourceTypes = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of resources) {
      if (r.resourceType) {
        counts[r.resourceType] = (counts[r.resourceType] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }, [resources]);

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

      {/* Tabs */}
      <Tabs defaultValue="serviceOwner">
        <Tabs.List>
          <Tabs.Tab value="serviceOwner">{t('home.tabs.serviceOwner')}</Tabs.Tab>
          <Tabs.Tab value="resourceType">{t('home.tabs.resourceType')}</Tabs.Tab>
          <Tabs.Tab value="accessPackages">{t('home.tabs.accessPackages')}</Tabs.Tab>
          <Tabs.Tab value="roles">{t('home.tabs.roles')}</Tabs.Tab>
        </Tabs.List>

        {/* Tab: Service owner */}
        <Tabs.Panel value="serviceOwner">
          <div className="pt-6">
            {/* Search */}
            <section className="max-w-lg mx-auto mb-8">
              <Search>
                <SearchInput
                  aria-label={t('home.search.aria')}
                  placeholder={t('home.search.placeholder')}
                  value={orgSearch}
                  onChange={(e) => setOrgSearch(e.target.value)}
                />
                <SearchClear onClick={() => setOrgSearch('')} />
              </Search>
            </section>

            {loadingOrgs && (
              <div className="flex justify-center py-20">
                <Spinner aria-label={t('loading')} data-size="lg" />
              </div>
            )}

            {errorOrgs && (
              <Alert data-color="danger" className="mb-6">
                {t('error.loadOrgs')}: {errorOrgs}
              </Alert>
            )}

            {!loadingOrgs && !errorOrgs && (
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
          </div>
        </Tabs.Panel>

        {/* Tab: Resource type */}
        <Tabs.Panel value="resourceType">
          <div className="pt-6">
            {loadingTypes && (
              <div className="flex justify-center py-20">
                <Spinner aria-label={t('loading')} data-size="lg" />
              </div>
            )}

            {errorTypes && (
              <Alert data-color="danger" className="mb-6">
                {t('error.loadData')}: {errorTypes}
              </Alert>
            )}

            {!loadingTypes && !errorTypes && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <Heading level={3} data-size="sm">
                    {t('home.resourceTypes')} ({resourceTypes.length})
                  </Heading>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {resourceTypes.map(({ type, count }) => (
                    <Link key={type} to={`/type/${encodeURIComponent(type)}`} className="no-underline">
                      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardBlock className="flex flex-col items-center text-center p-5 gap-3">
                          <Heading level={4} data-size="2xs">
                            {type}
                          </Heading>
                          <Tag data-size="sm" data-color="neutral">
                            {count} {t('type.services').toLowerCase()}
                          </Tag>
                        </CardBlock>
                      </Card>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </Tabs.Panel>

        {/* Tab: Access packages (placeholder) */}
        <Tabs.Panel value="accessPackages">
          <div className="pt-6">
            <Paragraph className="text-center py-16 text-gray-500">
              {t('home.tabs.comingSoon')}
            </Paragraph>
          </div>
        </Tabs.Panel>

        {/* Tab: Roles (placeholder) */}
        <Tabs.Panel value="roles">
          <div className="pt-6">
            <Paragraph className="text-center py-16 text-gray-500">
              {t('home.tabs.comingSoon')}
            </Paragraph>
          </div>
        </Tabs.Panel>
      </Tabs>
    </>
  );
}
