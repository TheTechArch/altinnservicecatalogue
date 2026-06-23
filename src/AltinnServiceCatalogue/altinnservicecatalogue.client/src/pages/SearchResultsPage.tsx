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
} from '@digdir/designsystemet-react';
import type { ServiceResource, AreaGroupDto, PackageDto } from '../types';
import { getText, packagePath, getPackageUrnValue, fetchPackageGroupsBilingual } from '../helpers';
import { useLang } from '../lang';
import { useEnv } from '../env';
import { ResourceTypeTag } from '../components/ResourceTypeTag';

interface PackageHit {
  pkg: PackageDto;
  areaName: string;
  groupName: string;
}

export default function SearchResultsPage() {
  const { lang, t } = useLang();
  const { env } = useEnv();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const [resources, setResources] = useState<ServiceResource[]>([]);
  const [groups, setGroups] = useState<AreaGroupDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`/api/v1/${env}/resource/resourcelist?includeApps=true&includeAltinn2=true`).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch resources: ${res.status}`);
        return res.json() as Promise<ServiceResource[]>;
      }),
      fetchPackageGroupsBilingual(env),
    ])
      .then(([resourceData, groupData]) => {
        setResources(resourceData);
        setGroups(groupData);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [env]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return { services: [] as ServiceResource[], packages: [] as PackageHit[] };

    const services = resources.filter((r) => {
      const title = getText(r.title, lang).toLowerCase();
      const desc = getText(r.description, lang).toLowerCase();
      return r.identifier.toLowerCase().includes(q) || title.includes(q) || desc.includes(q);
    });

    const packages: PackageHit[] = [];
    for (const g of groups) {
      for (const a of g.areas ?? []) {
        for (const p of a.packages ?? []) {
          if (
            p.id.toLowerCase().includes(q) ||
            p.name.toLowerCase().includes(q) ||
            p.urn.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.nameEn?.toLowerCase().includes(q) ||
            p.descriptionEn?.toLowerCase().includes(q)
          ) {
            packages.push({ pkg: p, areaName: a.name, groupName: g.name });
          }
        }
      }
    }

    return { services, packages };
  }, [query, resources, groups, lang]);

  const hasQuery = query.trim().length >= 2;
  const totalHits = results.services.length + results.packages.length;

  function updateQuery(value: string) {
    setSearchParams(value ? { q: value } : {}, { replace: true });
  }

  return (
    <>
      {/* Back */}
      <Link to="/">
        <Button variant="tertiary" data-size="sm" className="mb-4" asChild>
          <span>&larr; {t('results.back')}</span>
        </Button>
      </Link>

      {/* Header */}
      <section className="mb-8">
        <Heading level={2} data-size="lg">
          {t('results.title')}
        </Heading>
      </section>

      {/* Search */}
      <section className="max-w-lg mb-8">
        <Search>
          <SearchInput
            aria-label={t('results.search.aria')}
            placeholder={t('results.search.placeholder')}
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
          />
          <SearchClear onClick={() => updateQuery('')} />
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
          {t('error.loadData')}: {error}
        </Alert>
      )}

      {/* Content */}
      {!loading && !error && !hasQuery && (
        <Paragraph className="text-center py-16" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('results.empty')}
        </Paragraph>
      )}

      {!loading && !error && hasQuery && totalHits === 0 && (
        <Paragraph className="text-center py-16" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('results.noResults')} &laquo;{query.trim()}&raquo;
        </Paragraph>
      )}

      {!loading && !error && hasQuery && totalHits > 0 && (
        <>
          {/* Services */}
          {results.services.length > 0 && (
            <section className="mb-10">
              <Heading level={3} data-size="sm" className="mb-6">
                {t('results.services')} ({results.services.length})
              </Heading>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.services.map((resource) => (
                  <Link
                    key={resource.identifier}
                    to={`/resource/${encodeURIComponent(resource.identifier)}`}
                    className="no-underline"
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                      <CardBlock className="p-5 flex flex-col gap-2">
                        <Heading level={4} data-size="2xs">
                          {getText(resource.title, lang)}
                        </Heading>
                        <Paragraph data-size="sm" className="text-gray-600 line-clamp-3">
                          {getText(resource.description, lang)}
                        </Paragraph>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {resource.resourceType && <ResourceTypeTag type={resource.resourceType} />}
                          {resource.hasCompetentAuthority?.name && (
                            <Tag data-size="sm" data-color="neutral">
                              {getText(resource.hasCompetentAuthority.name, lang)}
                            </Tag>
                          )}
                          {resource.status && (
                            <Tag
                              data-size="sm"
                              data-color={resource.status === 'Active' ? 'success' : 'neutral'}
                            >
                              {resource.status}
                            </Tag>
                          )}
                        </div>
                      </CardBlock>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Access packages */}
          {results.packages.length > 0 && (
            <section className="mb-10">
              <Heading level={3} data-size="sm" className="mb-6">
                {t('results.packages')} ({results.packages.length})
              </Heading>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.packages.map(({ pkg, areaName, groupName }) => (
                  <Link
                    key={pkg.id}
                    to={packagePath(pkg)}
                    state={{ pkg }}
                    className="no-underline"
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                      <CardBlock className="p-5 flex flex-col gap-2">
                        <Heading level={4} data-size="2xs">
                          {pkg.name}
                        </Heading>
                        {pkg.nameEn && pkg.nameEn !== pkg.name && (
                          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                            {pkg.nameEn}
                          </Paragraph>
                        )}
                        <Paragraph data-size="sm" className="text-gray-600 line-clamp-2">
                          {pkg.description}
                        </Paragraph>
                        {pkg.descriptionEn && pkg.descriptionEn !== pkg.description && (
                          <Paragraph data-size="sm" className="line-clamp-2 italic" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                            {pkg.descriptionEn}
                          </Paragraph>
                        )}
                        <div className="text-xs mt-2" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                          {groupName} &rsaquo; {areaName}
                          {pkg.urn && <> &mdash; {getPackageUrnValue(pkg.urn)}</>}
                        </div>
                      </CardBlock>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
