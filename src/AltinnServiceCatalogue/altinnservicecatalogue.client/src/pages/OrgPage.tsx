import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
import type { Org, OrgList, ServiceResource } from '../types';
import { getText, OrgLogo } from '../helpers';
import { useLang } from '../lang';

export default function OrgPage() {
  const { lang, t } = useLang();
  const { orgCode } = useParams<{ orgCode: string }>();

  const [org, setOrg] = useState<Org | null>(null);
  const [resources, setResources] = useState<ServiceResource[]>([]);
  const [loadingOrg, setLoadingOrg] = useState(true);
  const [loadingResources, setLoadingResources] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch org info
  useEffect(() => {
    fetch('/api/v1/tt02/resource/orgs')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch orgs: ${res.status}`);
        return res.json() as Promise<OrgList>;
      })
      .then((data) => {
        const found = orgCode ? data.orgs?.[orgCode] : null;
        setOrg(found ?? null);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoadingOrg(false);
      });
  }, [orgCode]);

  // Fetch resources
  useEffect(() => {
    if (!orgCode) return;

    setLoadingResources(true);
    fetch('/api/v1/tt02/resource/resourcelist')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch resources: ${res.status}`);
        return res.json() as Promise<ServiceResource[]>;
      })
      .then((data) => {
        const orgResources = data.filter(
          (r) => r.hasCompetentAuthority?.orgcode?.toLowerCase() === orgCode.toLowerCase(),
        );
        setResources(orgResources);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoadingResources(false);
      });
  }, [orgCode]);

  const loading = loadingOrg || loadingResources;

  const filteredResources = useMemo(() => {
    if (!searchQuery) return resources;
    const q = searchQuery.toLowerCase();
    return resources.filter((r) => {
      const title = getText(r.title, lang).toLowerCase();
      const desc = getText(r.description, lang).toLowerCase();
      return title.includes(q) || desc.includes(q) || r.identifier.toLowerCase().includes(q);
    });
  }, [resources, searchQuery, lang]);

  return (
    <>
      {/* Back */}
      <Link to="/">
        <Button variant="tertiary" data-size="sm" className="mb-4" asChild>
          <span>&larr; {t('org.back')}</span>
        </Button>
      </Link>

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

      {/* Org not found */}
      {!loadingOrg && !org && !error && (
        <Alert data-color="warning" className="mb-6">
          {t('org.notFound')} &laquo;{orgCode}&raquo;.
        </Alert>
      )}

      {/* Org header + resources */}
      {org && !loading && !error && (
        <>
          {/* Org header */}
          <section className="mb-8">
            <div className="flex items-center gap-4">
              {org.logo && (
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                  <OrgLogo src={org.logo} alt={getText(org.name, lang)} fallback={orgCode!} />
                </div>
              )}
              <div>
                <Heading level={2} data-size="lg">
                  {getText(org.name, lang)}
                </Heading>
                {org.homepage && (
                  <a
                    href={org.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {org.homepage}
                  </a>
                )}
              </div>
            </div>
          </section>

          {/* Search resources */}
          <section className="max-w-lg mb-8">
            <Search>
              <SearchInput
                aria-label={t('org.search.aria')}
                placeholder={t('org.search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchClear onClick={() => setSearchQuery('')} />
            </Search>
          </section>

          {/* Resource count */}
          <div className="mb-6">
            <Heading level={3} data-size="sm">
              {t('org.services')} ({filteredResources.length})
            </Heading>
          </div>

          {/* Resource list */}
          {filteredResources.length === 0 ? (
            <Paragraph className="text-center py-16 text-gray-500">
              {resources.length === 0
                ? t('org.noServices')
                : t('org.noMatch')}
            </Paragraph>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((resource) => (
                <Link
                  key={resource.identifier}
                  to={`/resource/${resource.identifier}`}
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
                        <Tag data-size="sm" variant="outline">
                          {resource.resourceType}
                        </Tag>
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
          )}
        </>
      )}
    </>
  );
}
