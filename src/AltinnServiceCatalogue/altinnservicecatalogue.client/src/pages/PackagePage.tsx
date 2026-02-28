import { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import {
  Heading,
  Paragraph,
  Spinner,
  Alert,
  Tag,
  Card,
  CardBlock,
} from '@digdir/designsystemet-react';
import type { PackageDto, MetaResource, AreaGroupDto } from '../types';
import { useLang } from '../lang';
import { useEnv } from '../env';

interface SearchResult {
  object: PackageDto;
  score: number;
}

export default function PackagePage() {
  const { t } = useLang();
  const { env } = useEnv();
  const { packageId } = useParams<{ packageId: string }>();
  const location = useLocation();

  // Package info from router state (passed from HomePage)
  const statePkg = (location.state as { pkg?: PackageDto } | null)?.pkg ?? null;

  const [pkg, setPkg] = useState<PackageDto | null>(statePkg);
  const [resources, setResources] = useState<MetaResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!packageId) return;
    setLoading(true);
    setError(null);

    // If we have package info from router state, search by name to get resources
    // Otherwise, fetch the export to find the package first
    const lookupPromise: Promise<PackageDto | null> = statePkg
      ? searchForPackage(env, statePkg.name, packageId)
      : fetchFromExport(env, packageId);

    lookupPromise
      .then((found) => {
        if (found) {
          setPkg(found);
          setResources(found.resources ?? []);
        } else if (statePkg) {
          // Search didn't find it with resources, use state data
          setPkg(statePkg);
          setResources([]);
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [packageId, env]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner aria-label={t('loading')} data-size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert data-color="danger" className="mb-6">
        {t('error.loadData')}: {error}
      </Alert>
    );
  }

  if (!pkg) {
    return (
      <>
        <Link to="/">
          <span className="text-sm text-blue-600 hover:underline">&larr; {t('packages.back')}</span>
        </Link>
        <Alert data-color="warning" className="mt-4">{t('packages.notFound')}</Alert>
      </>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:underline">
          {t('nav.home')}
        </Link>
        <span>/</span>
        <span>{t('home.tabs.accessPackages')}</span>
        {pkg.area?.group && (
          <>
            <span>/</span>
            <span>{pkg.area.group.name}</span>
          </>
        )}
        {pkg.area && (
          <>
            <span>/</span>
            <span>{pkg.area.name}</span>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900 truncate max-w-xs">{pkg.name}</span>
      </nav>

      {/* Package header */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          {pkg.area?.iconUrl && (
            <img src={pkg.area.iconUrl} alt="" className="w-8 h-8" />
          )}
          <Heading level={2} data-size="lg">
            {pkg.name}
          </Heading>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <Tag
            data-size="sm"
            data-color={pkg.isDelegable ? 'success' : 'neutral'}
          >
            {pkg.isDelegable ? t('packages.delegable') : t('packages.notDelegable')}
          </Tag>
          {pkg.area?.group && (
            <Tag data-size="sm" data-color="neutral">{pkg.area.group.type}</Tag>
          )}
        </div>
        {pkg.description && (
          <Paragraph data-size="md" className="mb-4">
            {pkg.description}
          </Paragraph>
        )}
      </section>

      {/* Package details */}
      <Card className="mb-8">
        <CardBlock className="p-5">
          <dl>
            {pkg.area && (
              <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-b border-gray-100">
                <dt className="text-sm font-medium text-gray-500">{t('packages.area')}</dt>
                <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">{pkg.area.name}</dd>
              </div>
            )}
            {pkg.area?.group && (
              <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-b border-gray-100">
                <dt className="text-sm font-medium text-gray-500">{t('packages.group')}</dt>
                <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">{pkg.area.group.name}</dd>
              </div>
            )}
            <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-b border-gray-100">
              <dt className="text-sm font-medium text-gray-500">{t('packages.urn')}</dt>
              <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0 font-mono text-xs">{pkg.urn}</dd>
            </div>
            <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-b border-gray-100">
              <dt className="text-sm font-medium text-gray-500">{t('packages.delegable')}</dt>
              <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">{pkg.isDelegable ? t('yes') : t('no')}</dd>
            </div>
          </dl>
        </CardBlock>
      </Card>

      {/* Services in this package */}
      <section>
        <Heading level={3} data-size="sm" className="mb-4">
          {t('packages.services')} ({resources.length})
        </Heading>

        {resources.length === 0 ? (
          <Paragraph className="text-center py-16 text-gray-500">
            {t('packages.noServices')}
          </Paragraph>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <Link
                key={resource.id}
                to={`/resource/${encodeURIComponent(resource.refId)}`}
                className="no-underline"
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardBlock className="p-5 flex flex-col gap-2">
                    <Heading level={4} data-size="2xs">
                      {resource.name}
                    </Heading>
                    {resource.description && (
                      <Paragraph data-size="sm" className="text-gray-600 line-clamp-3">
                        {resource.description}
                      </Paragraph>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {resource.provider && (
                        <Tag data-size="sm" data-color="neutral">
                          {resource.provider.name}
                        </Tag>
                      )}
                      {resource.type && (
                        <Tag data-size="sm" variant="outline">
                          {resource.type.name}
                        </Tag>
                      )}
                    </div>
                  </CardBlock>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

/** Search for a package by name and match by ID to get the version with resources */
async function searchForPackage(env: string, name: string, id: string): Promise<PackageDto | null> {
  const res = await fetch(`/api/v1/${env}/meta/info/accesspackages/search?term=${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error(`Failed to search packages: ${res.status}`);
  const results: SearchResult[] = await res.json();
  const match = results.find((r) => r.object.id === id);
  return match?.object ?? null;
}

/** Fetch export and find a package by ID (fallback for direct URL access) */
async function fetchFromExport(env: string, id: string): Promise<PackageDto | null> {
  const res = await fetch(`/api/v1/${env}/meta/info/accesspackages/export`);
  if (!res.ok) throw new Error(`Failed to fetch packages: ${res.status}`);
  const groups: AreaGroupDto[] = await res.json();

  // Find the package in the export hierarchy
  for (const group of groups) {
    for (const area of group.areas ?? []) {
      const found = (area.packages ?? []).find((p) => p.id === id);
      if (found) {
        // Now search to get resources
        const withResources = await searchForPackage(env, found.name, id);
        if (withResources) {
          // Merge area/group info from export (search doesn't include group)
          withResources.area = {
            ...withResources.area,
            ...area,
            packages: undefined,
            group: { ...group, areas: undefined },
          } as PackageDto['area'];
          return withResources;
        }
        // Fallback: return export data without resources
        found.area = { ...area, packages: undefined, group: { ...group, areas: undefined } };
        return found;
      }
    }
  }
  return null;
}
