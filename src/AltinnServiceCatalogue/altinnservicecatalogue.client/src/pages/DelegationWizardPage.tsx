import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  Tag,
  Button,
  Checkbox,
} from '@digdir/designsystemet-react';
import type { ServiceResource, PolicyRule, PackageDto } from '../types';
import { getText } from '../helpers';
import { useLang } from '../lang';
import { useEnv } from '../env';
import { ResourceTypeTag } from '../components/ResourceTypeTag';

const RESULT_LIMIT = 20;

const ACTION_COLORS: Record<string, 'info' | 'success' | 'warning' | 'danger' | 'neutral'> = {
  read: 'info',
  write: 'success',
  sign: 'warning',
  confirmationrequired: 'neutral',
};

const OLD_ALTINN_ID_MARKERS = ['_a2-', '_a1-', 'se_', 'migrated'];

function isOldAltinnService(id: string): boolean {
  const lower = id.toLowerCase();
  return OLD_ALTINN_ID_MARKERS.some((marker) => lower.includes(marker));
}

interface PackageMatch {
  urnValue: string;
  actions: string[];
  pkg?: PackageDto;
  resolved: boolean;
}

export default function DelegationWizardPage() {
  const { lang, t } = useLang();
  const { env } = useEnv();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('resource') ?? '';

  const [resources, setResources] = useState<ServiceResource[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [errorResources, setErrorResources] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [hideOldAltinn, setHideOldAltinn] = useState(true);

  const [selectedResource, setSelectedResource] = useState<ServiceResource | null>(null);
  const [loadingSelected, setLoadingSelected] = useState(false);
  const [errorSelected, setErrorSelected] = useState<string | null>(null);

  const [packages, setPackages] = useState<PackageMatch[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [errorPackages, setErrorPackages] = useState<string | null>(null);

  useEffect(() => {
    setLoadingResources(true);
    setErrorResources(null);
    fetch(`/api/v1/${env}/resource/resourcelist?includeApps=true&includeAltinn2=true`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        return res.json() as Promise<ServiceResource[]>;
      })
      .then(setResources)
      .catch((err) => setErrorResources(err.message))
      .finally(() => setLoadingResources(false));
  }, [env]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedResource(null);
      setErrorSelected(null);
      return;
    }
    setLoadingSelected(true);
    setErrorSelected(null);
    fetch(`/api/v1/${env}/resource/${encodeURIComponent(selectedId)}`)
      .then((res) => {
        if (res.status === 404) {
          setSelectedResource(null);
          return null;
        }
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json() as Promise<ServiceResource>;
      })
      .then((data) => {
        if (data) setSelectedResource(data);
      })
      .catch((err) => setErrorSelected(err.message))
      .finally(() => setLoadingSelected(false));
  }, [selectedId, env]);

  useEffect(() => {
    if (!selectedId) {
      setPackages([]);
      setErrorPackages(null);
      return;
    }
    setLoadingPackages(true);
    setErrorPackages(null);

    let cancelled = false;

    fetch(`/api/v1/${env}/resource/${encodeURIComponent(selectedId)}/policy/rules`)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json() as Promise<PolicyRule[]>;
      })
      .then(async (rules) => {
        const map = new Map<string, Set<string>>();
        for (const rule of rules) {
          for (const subject of rule.subject) {
            if (subject.type !== 'urn:altinn:accesspackage') continue;
            if (!map.has(subject.value)) map.set(subject.value, new Set());
            map.get(subject.value)!.add(rule.action.value);
          }
        }

        const entries: PackageMatch[] = [...map.entries()]
          .map(([urnValue, actions]) => ({
            urnValue,
            actions: [...actions],
            resolved: false,
          }))
          .sort((a, b) => a.urnValue.localeCompare(b.urnValue));

        if (cancelled) return;
        setPackages(entries);

        const resolved = await Promise.all(
          entries.map(async (entry) => {
            try {
              const res = await fetch(
                `/api/v1/${env}/meta/info/accesspackages/urn/${encodeURIComponent(entry.urnValue)}`,
              );
              if (!res.ok) return { ...entry, resolved: true };
              const pkg: PackageDto = await res.json();
              return { ...entry, pkg, resolved: true };
            } catch {
              return { ...entry, resolved: true };
            }
          }),
        );

        if (cancelled) return;
        setPackages(resolved);
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorPackages(err.message);
        setPackages([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingPackages(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId, env]);

  const searchResults = useMemo(() => {
    if (!query || query.length < 2) return [] as ServiceResource[];
    const q = query.toLowerCase();
    return resources.filter((r) => {
      if (hideOldAltinn && isOldAltinnService(r.identifier)) return false;
      return (
        r.identifier.toLowerCase().includes(q) ||
        getText(r.title, lang).toLowerCase().includes(q) ||
        getText(r.description, lang).toLowerCase().includes(q)
      );
    });
  }, [query, resources, lang, hideOldAltinn]);

  function pickResource(id: string) {
    setSearchParams({ resource: id });
    setQuery('');
  }

  function clearSelection() {
    setSearchParams({});
    setSelectedResource(null);
    setPackages([]);
  }

  const sortedPackages = useMemo(() => {
    return [...packages].sort((a, b) => {
      const an = a.pkg?.name ?? a.urnValue;
      const bn = b.pkg?.name ?? b.urnValue;
      return an.localeCompare(bn, lang === 'nb' ? 'nb' : 'en');
    });
  }, [packages, lang]);

  return (
    <>
      <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
        <Link to="/" className="hover:underline">
          {t('nav.home')}
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--ds-color-neutral-text-default)' }}>{t('wizard.title')}</span>
      </nav>

      <section className="mb-8">
        <Heading level={2} data-size="lg" className="mb-3">
          {t('wizard.title')}
        </Heading>
        <Paragraph data-size="md">{t('wizard.intro')}</Paragraph>
      </section>

      {/* Step 1 */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Tag data-size="sm" data-color={selectedResource ? 'neutral' : 'info'}>
            {t('wizard.step1.label')}
          </Tag>
          <Heading level={3} data-size="sm">
            {t('wizard.step1.title')}
          </Heading>
        </div>

        {!selectedResource && (
          <>
            <div className="max-w-2xl mb-2">
              <Search>
                <SearchInput
                  aria-label={t('wizard.step1.aria')}
                  placeholder={t('wizard.step1.placeholder')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <SearchClear onClick={() => setQuery('')} />
              </Search>
            </div>
            <div className="max-w-2xl mb-2">
              <Checkbox
                label={t('wizard.step1.hideOld')}
                data-size="sm"
                checked={hideOldAltinn}
                onChange={(e) => setHideOldAltinn((e.target as HTMLInputElement).checked)}
              />
            </div>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('wizard.step1.hint')}
            </Paragraph>

            {loadingResources && (
              <div className="flex justify-center py-10">
                <Spinner aria-label={t('loading')} data-size="md" />
              </div>
            )}
            {errorResources && (
              <Alert data-color="danger" className="mt-4">
                {t('error.loadData')}: {errorResources}
              </Alert>
            )}

            {!loadingResources && query.length >= 2 && (
              <div className="mt-4">
                {searchResults.length === 0 ? (
                  <Paragraph className="py-8 text-center" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('wizard.step1.noResults')}
                  </Paragraph>
                ) : (
                  <>
                    <Paragraph data-size="sm" className="mb-3" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {t('wizard.step1.showingOf')
                        .replace('{shown}', String(Math.min(RESULT_LIMIT, searchResults.length)))
                        .replace('{total}', String(searchResults.length))}
                    </Paragraph>
                    <div className="flex flex-col gap-2">
                      {searchResults.slice(0, RESULT_LIMIT).map((r) => (
                        <button
                          key={r.identifier}
                          type="button"
                          onClick={() => pickResource(r.identifier)}
                          className="text-left rounded-lg transition-shadow hover:shadow-md cursor-pointer p-4"
                          style={{
                            backgroundColor: 'var(--ds-color-neutral-background-default)',
                            border: '1px solid var(--ds-color-neutral-border-subtle)',
                            color: 'var(--ds-color-neutral-text-default)',
                          }}
                        >
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <span className="font-medium">{getText(r.title, lang)}</span>
                            <ResourceTypeTag type={r.resourceType} />
                          </div>
                          <div className="text-xs font-mono" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                            {r.identifier}
                          </div>
                          {getText(r.hasCompetentAuthority?.name, lang) && (
                            <div className="text-xs mt-1" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                              {getText(r.hasCompetentAuthority?.name, lang)}
                            </div>
                          )}
                          {getText(r.description, lang) && (
                            <div className="text-sm mt-2 line-clamp-3" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                              {getText(r.description, lang)}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {selectedResource && (
          <Card>
            <CardBlock className="p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('wizard.selectedService')}
                  </div>
                  <Heading level={4} data-size="xs">
                    {getText(selectedResource.title, lang)}
                  </Heading>
                  <div className="text-xs font-mono mt-1" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {selectedResource.identifier}
                  </div>
                </div>
                <Button variant="tertiary" data-size="sm" onClick={clearSelection}>
                  {t('wizard.changeService')}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <ResourceTypeTag type={selectedResource.resourceType} />
                {selectedResource.status && (
                  <Tag data-size="sm" data-color={selectedResource.status === 'Active' ? 'success' : 'neutral'}>
                    {selectedResource.status}
                  </Tag>
                )}
                <Tag data-size="sm" data-color={selectedResource.delegable ? 'info' : 'warning'}>
                  {selectedResource.delegable ? t('resource.delegable') : t('packages.notDelegable')}
                </Tag>
              </div>
              <Link
                to={`/resource/${encodeURIComponent(selectedResource.identifier)}`}
                className="text-sm hover:underline"
                style={{ color: 'var(--ds-color-accent-text-default)' }}
              >
                {t('wizard.viewService')} &rarr;
              </Link>
            </CardBlock>
          </Card>
        )}

        {loadingSelected && (
          <div className="flex justify-center py-6">
            <Spinner aria-label={t('loading')} data-size="md" />
          </div>
        )}
        {errorSelected && (
          <Alert data-color="danger" className="mt-4">
            {t('error.loadResource')}: {errorSelected}
          </Alert>
        )}
        {selectedId && !loadingSelected && !selectedResource && !errorSelected && (
          <Alert data-color="warning" className="mt-4">
            {t('wizard.resourceNotFound')}
          </Alert>
        )}
      </section>

      {/* Step 2 */}
      {selectedResource && (
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Tag data-size="sm" data-color="info">
              {t('wizard.step2.label')}
            </Tag>
            <Heading level={3} data-size="sm">
              {t('wizard.step2.title')}
            </Heading>
          </div>

          {!selectedResource.delegable && (
            <Alert data-color="warning" className="mb-4">
              {t('wizard.notDelegableAlert')}
            </Alert>
          )}

          {loadingPackages && (
            <div className="flex items-center gap-3 py-6">
              <Spinner aria-label={t('loading')} data-size="md" />
              <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>{t('wizard.loadingPackages')}</span>
            </div>
          )}

          {errorPackages && (
            <Alert data-color="danger" className="mb-4">
              {t('wizard.error.loadRules')}: {errorPackages}
            </Alert>
          )}

          {!loadingPackages && !errorPackages && packages.length === 0 && (
            <Alert data-color="warning">
              <Heading level={4} data-size="2xs" className="mb-2">
                {t('wizard.noPackagesTitle')}
              </Heading>
              <Paragraph data-size="sm" className="mb-3">
                {t('wizard.noPackagesBody')}
              </Paragraph>
              <div className="flex flex-wrap gap-3">
                <Link to={`/resource/${encodeURIComponent(selectedResource.identifier)}`} className="no-underline">
                  <Button variant="secondary" data-size="sm" asChild>
                    <span>{t('wizard.noPackagesSeeRoles')}</span>
                  </Button>
                </Link>
                <Button variant="tertiary" data-size="sm" onClick={clearSelection}>
                  {t('wizard.tryAnother')}
                </Button>
              </div>
            </Alert>
          )}

          {!loadingPackages && !errorPackages && packages.length > 0 && (
            <>
              <Paragraph data-size="sm" className="mb-4" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t('wizard.resultCount').replace('{count}', String(packages.length))}
              </Paragraph>

              <div className="flex flex-col gap-3">
                {sortedPackages.map((entry) => {
                  const pkg = entry.pkg;
                  const displayName = pkg?.name ?? entry.urnValue;
                  const description = pkg?.description;
                  const areaName = pkg?.area?.name;
                  const groupName = pkg?.area?.group?.name;
                  const link = pkg?.id
                    ? `/package/${encodeURIComponent(pkg.id)}`
                    : `/package/${encodeURIComponent(entry.urnValue)}`;

                  return (
                    <Card key={entry.urnValue}>
                      <CardBlock className="p-5 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="min-w-0">
                            {(groupName || areaName) && (
                              <div className="text-xs mb-1" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                                {groupName}
                                {groupName && areaName && <> &rsaquo; </>}
                                {areaName}
                              </div>
                            )}
                            <Heading level={4} data-size="xs">
                              {displayName}
                            </Heading>
                            {description && (
                              <Paragraph data-size="sm" className="mt-1" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                                {description}
                              </Paragraph>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {pkg && (
                              <Tag data-size="sm" data-color={pkg.isDelegable ? 'success' : 'neutral'}>
                                {pkg.isDelegable ? t('packages.delegable') : t('packages.notDelegable')}
                              </Tag>
                            )}
                          </div>
                        </div>

                        {entry.actions.length > 0 && (
                          <div>
                            <div className="text-xs font-medium mb-2" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                              {t('wizard.actions')}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {entry.actions.map((action) => (
                                <Tag key={action} data-size="sm" data-color={ACTION_COLORS[action] ?? 'neutral'}>
                                  {action}
                                </Tag>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="text-xs font-mono" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                            {entry.urnValue}
                          </div>
                          <Link to={link} className="no-underline">
                            <Button variant="secondary" data-size="sm" asChild>
                              <span>{t('wizard.viewPackage')} &rarr;</span>
                            </Button>
                          </Link>
                        </div>
                      </CardBlock>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </section>
      )}
    </>
  );
}
