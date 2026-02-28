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
import type { ServiceResource } from '../types';
import { getText } from '../helpers';
import { useLang } from '../lang';
import { useEnv } from '../env';

export default function ResourceTypePage() {
  const { lang, t } = useLang();
  const { env } = useEnv();
  const { resourceType } = useParams<{ resourceType: string }>();

  const [resources, setResources] = useState<ServiceResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!resourceType) return;
    setLoading(true);
    setError(null);

    fetch(`/api/v1/${env}/resource/resourcelist`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch resources: ${res.status}`);
        return res.json() as Promise<ServiceResource[]>;
      })
      .then((data) => {
        const filtered = data.filter((r) => r.resourceType === resourceType);
        setResources(filtered);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [resourceType, env]);

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
          <span>&larr; {t('type.back')}</span>
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

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Header */}
          <section className="mb-8">
            <Heading level={2} data-size="lg">
              {resourceType}
            </Heading>
          </section>

          {/* Search */}
          <section className="max-w-lg mb-8">
            <Search>
              <SearchInput
                aria-label={t('type.search.aria')}
                placeholder={t('type.search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchClear onClick={() => setSearchQuery('')} />
            </Search>
          </section>

          {/* Count */}
          <div className="mb-6">
            <Heading level={3} data-size="sm">
              {t('type.services')} ({filteredResources.length})
            </Heading>
          </div>

          {/* Resource list */}
          {filteredResources.length === 0 ? (
            <Paragraph className="text-center py-16 text-gray-500">
              {resources.length === 0
                ? t('type.noServices')
                : t('type.noMatch')}
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
          )}
        </>
      )}
    </>
  );
}
