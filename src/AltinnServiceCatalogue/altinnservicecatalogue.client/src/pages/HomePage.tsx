import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  Button,
  Checkbox,
  Fieldset,
  Select,
} from '@digdir/designsystemet-react';

const RESOURCE_TYPES = [
  'Default', 'Systemresource', 'MaskinportenSchema', 'Altinn2Service',
  'AltinnApp', 'GenericAccessResource', 'BrokerService', 'CorrespondenceService', 'Consent',
];
const AVAILABLE_FOR_TYPES = [
  'PrivatePerson', 'LegalEntityEnterprise', 'Company', 'BankruptcyEstate', 'SelfRegisteredUser',
];
const SEARCH_DISPLAY_LIMIT = 100;

function toggleArrayItem(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}
import type { Org, OrgList, ServiceResource, AreaGroupDto, RoleDto } from '../types';
import { getText, OrgLogo } from '../helpers';
import { useLang } from '../lang';
import { useEnv } from '../env';
import { ResourceTypeTag, RESOURCE_TYPE_COLORS } from '../components/ResourceTypeTag';

const TAB_PATHS: Record<string, string> = {
  '/': 'serviceOwner',
  '/owners': 'serviceOwner',
  '/types': 'resourceType',
  '/packages': 'accessPackages',
  '/roles': 'roles',
  '/keywords': 'keywords',
  '/search': 'search',
};

const PATH_FOR_TAB: Record<string, string> = {
  serviceOwner: '/owners',
  search: '/search',
  resourceType: '/types',
  accessPackages: '/packages',
  roles: '/roles',
  keywords: '/keywords',
};

export default function HomePage() {
  const { lang, t } = useLang();
  const { env } = useEnv();
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = TAB_PATHS[location.pathname] ?? 'serviceOwner';

  // Org tab state
  const [orgs, setOrgs] = useState<Record<string, Org>>({});
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [errorOrgs, setErrorOrgs] = useState<string | null>(null);
  const [orgSearch, setOrgSearch] = useState('');

  // Resource type tab state
  const [resources, setResources] = useState<ServiceResource[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [errorTypes, setErrorTypes] = useState<string | null>(null);

  // Access packages tab state
  const [groups, setGroups] = useState<AreaGroupDto[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [errorPackages, setErrorPackages] = useState<string | null>(null);
  const [packageSearch, setPackageSearch] = useState('');

  // Roles tab state
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [errorRoles, setErrorRoles] = useState<string | null>(null);
  const [roleSearch, setRoleSearch] = useState('');

  // Keywords tab state
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loadingKeywords, setLoadingKeywords] = useState(true);
  const [errorKeywords, setErrorKeywords] = useState<string | null>(null);
  const [keywordSearch, setKeywordSearch] = useState('');

  // Advanced search tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTypes, setSearchTypes] = useState<string[]>([]);
  const [searchStatus, setSearchStatus] = useState('');
  const [searchAvailableFor, setSearchAvailableFor] = useState<string[]>([]);
  const [searchDelegable, setSearchDelegable] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchSelfIdentified, setSearchSelfIdentified] = useState(false);
  const [searchEnterprise, setSearchEnterprise] = useState(false);
  const [searchAccessList, setSearchAccessList] = useState(false);
  const [searchMigratedAltinn2, setSearchMigratedAltinn2] = useState(false);

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
    fetch(`/api/v1/${env}/resource/resourcelist?includeApps=true&includeAltinn2=true`)
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

  // Fetch access packages export
  useEffect(() => {
    setLoadingPackages(true);
    setErrorPackages(null);
    fetch(`/api/v1/${env}/meta/info/accesspackages/export`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch packages: ${res.status}`);
        return res.json() as Promise<AreaGroupDto[]>;
      })
      .then((data) => {
        setGroups(data);
      })
      .catch((err) => {
        setErrorPackages(err.message);
      })
      .finally(() => {
        setLoadingPackages(false);
      });
  }, [env]);

  // Fetch roles
  useEffect(() => {
    setLoadingRoles(true);
    setErrorRoles(null);
    fetch(`/api/v1/${env}/meta/info/roles`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch roles: ${res.status}`);
        return res.json() as Promise<RoleDto[]>;
      })
      .then((data) => {
        setRoles(data);
      })
      .catch((err) => {
        setErrorRoles(err.message);
      })
      .finally(() => {
        setLoadingRoles(false);
      });
  }, [env]);

  // Fetch keywords
  useEffect(() => {
    setLoadingKeywords(true);
    setErrorKeywords(null);
    fetch(`/api/v1/${env}/resource/keywords`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch keywords: ${res.status}`);
        return res.json() as Promise<string[]>;
      })
      .then((data) => {
        setKeywords(data);
      })
      .catch((err) => {
        setErrorKeywords(err.message);
      })
      .finally(() => {
        setLoadingKeywords(false);
      });
  }, [env]);

  const filteredKeywords = useMemo(() => {
    if (!keywordSearch) return keywords;
    const q = keywordSearch.toLowerCase();
    return keywords.filter((kw) => kw.toLowerCase().includes(q));
  }, [keywords, keywordSearch]);

  // Filter groups/areas/packages by search
  const filteredGroups = useMemo(() => {
    if (!packageSearch) return groups;
    const q = packageSearch.toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        areas: (g.areas ?? [])
          .map((a) => ({
            ...a,
            packages: (a.packages ?? []).filter(
              (p) =>
                p.name.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q),
            ),
          }))
          .filter((a) => a.packages.length > 0 || a.name.toLowerCase().includes(q)),
      }))
      .filter((g) => g.areas.length > 0);
  }, [groups, packageSearch]);

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

  // Group roles by provider, with search filter
  const rolesByProvider = useMemo(() => {
    const q = roleSearch.toLowerCase();
    const filtered = roles.filter((r) => {
      if (!roleSearch) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
      );
    });

    const map = new Map<string, { provider: string; roles: RoleDto[] }>();
    for (const role of filtered) {
      const providerName = role.provider?.name ?? 'Ukjent';
      if (!map.has(providerName)) {
        map.set(providerName, { provider: providerName, roles: [] });
      }
      map.get(providerName)!.roles.push(role);
    }

    // Sort: key roles first within each group, then alphabetically
    for (const group of map.values()) {
      group.roles.sort((a, b) => {
        if (a.isKeyRole !== b.isKeyRole) return a.isKeyRole ? -1 : 1;
        return a.name.localeCompare(b.name, lang === 'nb' ? 'nb' : 'en');
      });
    }

    return [...map.values()].sort((a, b) => a.provider.localeCompare(b.provider));
  }, [roles, roleSearch, lang]);

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

  // Advanced search computed values
  const distinctStatuses = useMemo(() => {
    const s = new Set<string>();
    for (const r of resources) { if (r.status) s.add(r.status); }
    return [...s].sort();
  }, [resources]);

  const availableResourceTypes = useMemo(() =>
    RESOURCE_TYPES.filter((t) => resources.some((r) => r.resourceType === t)),
    [resources],
  );

  const filteredSearchResults = useMemo(() => {
    return resources.filter((r) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const title = getText(r.title, lang).toLowerCase();
        const desc = getText(r.description, lang).toLowerCase();
        if (!title.includes(q) && !desc.includes(q) && !r.identifier.toLowerCase().includes(q)) return false;
      }
      if (searchTypes.length > 0 && !searchTypes.includes(r.resourceType)) return false;
      if (searchStatus && r.status !== searchStatus) return false;
      if (searchAvailableFor.length > 0) {
        if (!r.availableForType || !searchAvailableFor.some((t) => r.availableForType!.includes(t))) return false;
      }
      if (searchDelegable && !r.delegable) return false;
      if (searchVisible && !r.visible) return false;
      if (searchSelfIdentified && !r.selfIdentifiedUserEnabled) return false;
      if (searchEnterprise && !r.enterpriseUserEnabled) return false;
      if (searchAccessList && r.accessListMode !== 'Enabled') return false;
      if (searchMigratedAltinn2 && !r.resourceReferences?.some((ref) => ref.referenceType === 'ServiceCode')) return false;
      return true;
    });
  }, [resources, searchQuery, searchTypes, searchStatus, searchAvailableFor,
    searchDelegable, searchVisible, searchSelfIdentified, searchEnterprise, searchAccessList, searchMigratedAltinn2, lang]);

  const hasActiveFilters = !!(searchQuery || searchTypes.length > 0 || searchStatus ||
    searchAvailableFor.length > 0 || searchDelegable || searchVisible ||
    searchSelfIdentified || searchEnterprise || searchAccessList || searchMigratedAltinn2);

  function clearSearchFilters() {
    setSearchQuery(''); setSearchTypes([]); setSearchStatus('');
    setSearchAvailableFor([]); setSearchDelegable(false); setSearchVisible(false);
    setSearchSelfIdentified(false); setSearchEnterprise(false); setSearchAccessList(false);
    setSearchMigratedAltinn2(false);
  }

  return (
    <>
      {/* Hero */}
      <section className="text-center mb-10">
        <img src="/tjenesteoversikten_logo.png" alt="tjenesteoversikten.no" className="h-20 mx-auto mb-6" />
        <Heading level={2} data-size="xl" className="mb-3">
          {t('home.hero.title')}
        </Heading>
        <Paragraph data-size="lg">
          {t('home.hero.subtitle')}{' '}
          {t('home.hero.source')}
          <a
            href="https://docs.altinn.studio/nb/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('home.hero.sourceText')}
          </a>
          .
        </Paragraph>
        <Paragraph data-size="sm" className="mt-2 opacity-60">
          {t('home.hero.disclaimer')}
        </Paragraph>
      </section>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(val) => navigate(PATH_FOR_TAB[val] ?? '/')}>
        <Tabs.List>
          <Tabs.Tab value="serviceOwner">{t('home.tabs.serviceOwner')}</Tabs.Tab>
          <Tabs.Tab value="resourceType">{t('home.tabs.resourceType')}</Tabs.Tab>
          <Tabs.Tab value="accessPackages">{t('home.tabs.accessPackages')}</Tabs.Tab>
          <Tabs.Tab value="roles">{t('home.tabs.roles')}</Tabs.Tab>
          <Tabs.Tab value="keywords">{t('home.tabs.keywords')}</Tabs.Tab>
          <Tabs.Tab value="search">{t('home.tabs.search')}</Tabs.Tab>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {resourceTypes.map(({ type, count }) => {
                    const color = RESOURCE_TYPE_COLORS[type] ?? 'neutral';
                    return (
                      <Link key={type} to={`/type/${encodeURIComponent(type)}`} className="no-underline">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer h-full" style={{ overflow: 'hidden' }}>
                          <div className="flex h-full">
                            <div
                              data-color={color}
                              style={{ width: '4px', flexShrink: 0, background: 'var(--ds-color-base-default)' }}
                            />
                            <div className="p-5 flex flex-col gap-3 flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <Heading level={4} data-size="xs">
                                  {t(`resourceType.${type}`)}
                                </Heading>
                                <Tag data-size="sm" data-color={color} className="flex-shrink-0">
                                  {count} {t('type.services').toLowerCase()}
                                </Tag>
                              </div>
                              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                                {t(`resourceType.description.${type}`)}
                              </Paragraph>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </Tabs.Panel>

        {/* Tab: Access packages */}
        <Tabs.Panel value="accessPackages">
          <div className="pt-6">
            {/* Search */}
            <section className="max-w-lg mx-auto mb-8">
              <Search>
                <SearchInput
                  aria-label={t('packages.search.aria')}
                  placeholder={t('packages.search.placeholder')}
                  value={packageSearch}
                  onChange={(e) => setPackageSearch(e.target.value)}
                />
                <SearchClear onClick={() => setPackageSearch('')} />
              </Search>
            </section>

            {loadingPackages && (
              <div className="flex justify-center py-20">
                <Spinner aria-label={t('loading')} data-size="lg" />
              </div>
            )}

            {errorPackages && (
              <Alert data-color="danger" className="mb-6">
                {t('error.loadData')}: {errorPackages}
              </Alert>
            )}

            {!loadingPackages && !errorPackages && filteredGroups.length === 0 && packageSearch && (
              <Paragraph className="text-center py-16 text-gray-500">
                {t('packages.noMatch')}
              </Paragraph>
            )}

            {!loadingPackages && !errorPackages && filteredGroups.map((group) => (
              <section key={group.id} className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <Heading level={3} data-size="sm">
                    {group.name}
                  </Heading>
                  <Tag data-size="sm" data-color="neutral">{group.type}</Tag>
                </div>

                {(group.areas ?? []).map((area) => (
                  <div key={area.id} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      {area.iconUrl && (
                        <img src={area.iconUrl} alt="" className="w-6 h-6" />
                      )}
                      <Heading level={4} data-size="xs">
                        {area.name}
                      </Heading>
                      <Tag data-size="sm" data-color="neutral">
                        {(area.packages ?? []).length} {t('packages.packages')}
                      </Tag>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 ml-8">
                      {(area.packages ?? []).map((pkg) => (
                        <Link
                          key={pkg.id}
                          to={`/package/${pkg.id}`}
                          state={{ pkg }}
                          className="no-underline"
                        >
                          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                            <CardBlock className="p-4 flex flex-col gap-2">
                              <Heading level={5} data-size="2xs">
                                {pkg.name}
                              </Heading>
                              {pkg.description && (
                                <Paragraph data-size="sm" className="text-gray-600 line-clamp-2">
                                  {pkg.description}
                                </Paragraph>
                              )}
                              <div className="flex flex-wrap gap-1 mt-1">
                                <Tag
                                  data-size="sm"
                                  data-color={pkg.isDelegable ? 'success' : 'neutral'}
                                >
                                  {pkg.isDelegable ? t('packages.delegable') : t('packages.notDelegable')}
                                </Tag>
                              </div>
                            </CardBlock>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            ))}
          </div>
        </Tabs.Panel>

        {/* Tab: Roles */}
        <Tabs.Panel value="roles">
          <div className="pt-6">
            {/* Search */}
            <section className="max-w-lg mx-auto mb-8">
              <Search>
                <SearchInput
                  aria-label={t('roles.search.aria')}
                  placeholder={t('roles.search.placeholder')}
                  value={roleSearch}
                  onChange={(e) => setRoleSearch(e.target.value)}
                />
                <SearchClear onClick={() => setRoleSearch('')} />
              </Search>
            </section>

            {loadingRoles && (
              <div className="flex justify-center py-20">
                <Spinner aria-label={t('loading')} data-size="lg" />
              </div>
            )}

            {errorRoles && (
              <Alert data-color="danger" className="mb-6">
                {t('error.loadData')}: {errorRoles}
              </Alert>
            )}

            {!loadingRoles && !errorRoles && rolesByProvider.length === 0 && roleSearch && (
              <Paragraph className="text-center py-16 text-gray-500">
                {t('roles.noMatch')}
              </Paragraph>
            )}

            {!loadingRoles && !errorRoles && rolesByProvider.map((group) => (
              <section key={group.provider} className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <Heading level={3} data-size="sm">
                    {group.provider}
                  </Heading>
                  <Tag data-size="sm" data-color="neutral">
                    {group.roles.length} {t('roles.roles')}
                  </Tag>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {group.roles.map((role) => (
                    <Link
                      key={role.id}
                      to={`/role/${role.id}`}
                      state={{ role }}
                      className="no-underline"
                    >
                      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardBlock className="p-4 flex flex-col gap-2">
                          <Heading level={5} data-size="2xs">
                            {role.name}
                          </Heading>
                          {role.description && (
                            <Paragraph data-size="sm" className="text-gray-600 line-clamp-2">
                              {role.description}
                            </Paragraph>
                          )}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {role.isKeyRole && (
                              <Tag data-size="sm" data-color="info">
                                {t('roles.keyRole')}
                              </Tag>
                            )}
                            <Tag data-size="sm" data-color="neutral">
                              {role.code}
                            </Tag>
                          </div>
                        </CardBlock>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </Tabs.Panel>

        {/* Tab: Advanced Search */}
        <Tabs.Panel value="search">
          <div className="pt-6">
            {/* Text search */}
            <section className="mb-6">
              <Search>
                <SearchInput
                  aria-label={t('search.aria')}
                  placeholder={t('search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <SearchClear onClick={() => setSearchQuery('')} />
              </Search>
            </section>

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
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Filter sidebar */}
                <aside
                  className="w-full md:w-64 flex-shrink-0 rounded-xl p-5 flex flex-col gap-5"
                  style={{ backgroundColor: 'var(--ds-color-neutral-surface-default)' }}
                >
                  <div className="flex items-center justify-between">
                    <Heading level={3} data-size="xs">
                      {t('search.filters')}
                    </Heading>
                    {hasActiveFilters && (
                      <Button variant="tertiary" data-size="sm" onClick={clearSearchFilters}>
                        {t('search.clearFilters')}
                      </Button>
                    )}
                  </div>

                  {/* Resource type */}
                  {availableResourceTypes.length > 0 && (
                    <Fieldset>
                      <Fieldset.Legend data-size="sm">{t('search.resourceType')}</Fieldset.Legend>
                      {availableResourceTypes.map((type) => (
                        <Checkbox
                          key={type}
                          label={t(`resourceType.${type}`)}
                          data-size="sm"
                          checked={searchTypes.includes(type)}
                          onChange={() => setSearchTypes(toggleArrayItem(searchTypes, type))}
                        />
                      ))}
                    </Fieldset>
                  )}

                  {/* Status */}
                  {distinctStatuses.length > 0 && (
                    <Fieldset>
                      <Fieldset.Legend data-size="sm">{t('search.status')}</Fieldset.Legend>
                      <Select
                        aria-label={t('search.status')}
                        data-size="sm"
                        value={searchStatus}
                        onChange={(e) => setSearchStatus((e.target as HTMLSelectElement).value)}
                      >
                        <Select.Option value="">{t('search.allStatuses')}</Select.Option>
                        {distinctStatuses.map((s) => (
                          <Select.Option key={s} value={s}>{s}</Select.Option>
                        ))}
                      </Select>
                    </Fieldset>
                  )}

                  {/* Available for */}
                  <Fieldset>
                    <Fieldset.Legend data-size="sm">{t('search.availableFor')}</Fieldset.Legend>
                    {AVAILABLE_FOR_TYPES.map((type) => (
                      <Checkbox
                        key={type}
                        label={t(`partyType.${type}`)}
                        data-size="sm"
                        checked={searchAvailableFor.includes(type)}
                        onChange={() => setSearchAvailableFor(toggleArrayItem(searchAvailableFor, type))}
                      />
                    ))}
                  </Fieldset>

                  {/* Boolean properties */}
                  <Fieldset>
                    <Fieldset.Legend data-size="sm">{t('search.properties')}</Fieldset.Legend>
                    <Checkbox
                      label={t('search.onlyDelegable')}
                      data-size="sm"
                      checked={searchDelegable}
                      onChange={(e) => setSearchDelegable((e.target as HTMLInputElement).checked)}
                    />
                    <Checkbox
                      label={t('search.onlyVisible')}
                      data-size="sm"
                      checked={searchVisible}
                      onChange={(e) => setSearchVisible((e.target as HTMLInputElement).checked)}
                    />
                    <Checkbox
                      label={t('search.selfIdentified')}
                      data-size="sm"
                      checked={searchSelfIdentified}
                      onChange={(e) => setSearchSelfIdentified((e.target as HTMLInputElement).checked)}
                    />
                    <Checkbox
                      label={t('search.enterpriseUsers')}
                      data-size="sm"
                      checked={searchEnterprise}
                      onChange={(e) => setSearchEnterprise((e.target as HTMLInputElement).checked)}
                    />
                    <Checkbox
                      label={t('search.accessListEnabled')}
                      data-size="sm"
                      checked={searchAccessList}
                      onChange={(e) => setSearchAccessList((e.target as HTMLInputElement).checked)}
                    />
                    <Checkbox
                      label={t('search.migratedFromAltinn2')}
                      data-size="sm"
                      checked={searchMigratedAltinn2}
                      onChange={(e) => setSearchMigratedAltinn2((e.target as HTMLInputElement).checked)}
                    />
                  </Fieldset>
                </aside>

                {/* Results */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-4">
                    <Heading level={3} data-size="sm">
                      {filteredSearchResults.length > SEARCH_DISPLAY_LIMIT
                        ? `${t('search.showing')} ${SEARCH_DISPLAY_LIMIT} ${t('search.of')} ${filteredSearchResults.length} ${t('search.results')}`
                        : `${filteredSearchResults.length} ${t('search.results')}`}
                    </Heading>
                  </div>

                  {filteredSearchResults.length === 0 ? (
                    <Paragraph className="text-center py-16" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {t('search.noResults')}
                    </Paragraph>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {filteredSearchResults.slice(0, SEARCH_DISPLAY_LIMIT).map((r) => (
                        <Link key={r.identifier} to={`/resource/${encodeURIComponent(r.identifier)}`} className="no-underline">
                          <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardBlock className="p-4 flex flex-col gap-2">
                              <div className="flex items-start justify-between gap-3">
                                <Heading level={4} data-size="2xs">
                                  {getText(r.title, lang)}
                                </Heading>
                                <div className="flex flex-wrap gap-1 flex-shrink-0">
                                  <ResourceTypeTag type={r.resourceType} />
                                  {r.status && (
                                    <Tag data-size="sm" data-color="neutral">{r.status}</Tag>
                                  )}
                                </div>
                              </div>
                              {getText(r.description, lang) && (
                                <Paragraph data-size="sm" className="line-clamp-2" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                                  {getText(r.description, lang)}
                                </Paragraph>
                              )}
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs font-mono" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                                  {r.identifier}
                                </span>
                                {r.hasCompetentAuthority?.name && (
                                  <span className="text-xs" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                                    · {getText(r.hasCompetentAuthority.name, lang)}
                                  </span>
                                )}
                              </div>
                            </CardBlock>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Tabs.Panel>

        {/* Tab: Keywords */}
        <Tabs.Panel value="keywords">
          <div className="pt-6">
            <section className="max-w-lg mx-auto mb-8">
              <Search>
                <SearchInput
                  aria-label={t('keywords.search.aria')}
                  placeholder={t('keywords.search.placeholder')}
                  value={keywordSearch}
                  onChange={(e) => setKeywordSearch(e.target.value)}
                />
                <SearchClear onClick={() => setKeywordSearch('')} />
              </Search>
            </section>

            {loadingKeywords && (
              <div className="flex justify-center py-20">
                <Spinner aria-label={t('loading')} data-size="lg" />
              </div>
            )}

            {errorKeywords && (
              <Alert data-color="danger" className="mb-6">
                {t('error.loadData')}: {errorKeywords}
              </Alert>
            )}

            {!loadingKeywords && !errorKeywords && filteredKeywords.length === 0 && keywordSearch && (
              <Paragraph className="text-center py-16 text-gray-500">
                {t('keywords.noMatch')}
              </Paragraph>
            )}

            {!loadingKeywords && !errorKeywords && filteredKeywords.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <Heading level={3} data-size="sm">
                    {t('keywords.total')} ({filteredKeywords.length})
                  </Heading>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filteredKeywords.map((kw) => (
                    <Link key={kw} to={`/keyword/${encodeURIComponent(kw)}`} className="no-underline">
                      <Tag
                        data-size="md"
                        data-color="neutral"
                        className="cursor-pointer hover:shadow-sm transition-shadow"
                      >
                        {kw}
                      </Tag>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </Tabs.Panel>
      </Tabs>
    </>
  );
}
