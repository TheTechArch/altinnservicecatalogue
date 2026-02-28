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
} from '@digdir/designsystemet-react';
import type { ServiceResource } from '../types';
import { getText } from '../helpers';
import { useLang } from '../lang';
import { useEnv } from '../env';

export default function KeywordPage() {
  const { lang, t } = useLang();
  const { env } = useEnv();
  const { word } = useParams<{ word: string }>();

  const [resources, setResources] = useState<ServiceResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!word) return;
    setLoading(true);
    setError(null);

    fetch(`/api/v1/${env}/resource/bykeyword/${encodeURIComponent(word)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch resources: ${res.status}`);
        return res.json() as Promise<ServiceResource[]>;
      })
      .then((data) => {
        setResources(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [word, env]);

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
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:underline">
          {t('nav.home')}
        </Link>
        <span>/</span>
        <Link to="/keywords" className="hover:underline">
          {t('home.tabs.keywords')}
        </Link>
        <span>/</span>
        <span className="text-gray-900 truncate max-w-xs">{word}</span>
      </nav>

      <Heading level={2} data-size="lg" className="mb-6">
        {word}
      </Heading>

      {loading && (
        <div className="flex justify-center py-20">
          <Spinner aria-label={t('loading')} data-size="lg" />
        </div>
      )}

      {error && (
        <Alert data-color="danger" className="mb-6">
          {t('error.loadData')}: {error}
        </Alert>
      )}

      {!loading && !error && (
        <>
          <section className="max-w-lg mb-8">
            <Search>
              <SearchInput
                aria-label={t('keyword.search.aria')}
                placeholder={t('keyword.search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchClear onClick={() => setSearchQuery('')} />
            </Search>
          </section>

          <div className="mb-6">
            <Heading level={3} data-size="sm">
              {t('keyword.services')} ({filteredResources.length})
            </Heading>
          </div>

          {filteredResources.length === 0 ? (
            <Paragraph className="text-center py-16 text-gray-500">
              {resources.length === 0
                ? t('keyword.noServices')
                : t('keyword.noMatch')}
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
