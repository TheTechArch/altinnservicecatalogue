import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Heading,
  Paragraph,
  Spinner,
  Alert,
  Tag,
  Button,
  Card,
  CardBlock,
} from '@digdir/designsystemet-react';
import type { ServiceResource } from '../types';
import { getText } from '../helpers';
import { useLang } from '../lang';

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-b border-gray-100">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">{children}</dd>
    </div>
  );
}

export default function ResourcePage() {
  const { lang, t } = useLang();
  const { id } = useParams<{ id: string }>();

  const [resource, setResource] = useState<ServiceResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    fetch(`/api/v1/tt02/resource/${encodeURIComponent(id)}`)
      .then((res) => {
        if (res.status === 404) {
          setResource(null);
          return null;
        }
        if (!res.ok) throw new Error(`Failed to fetch resource: ${res.status}`);
        return res.json() as Promise<ServiceResource>;
      })
      .then((data) => {
        if (data) setResource(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

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
        {t('error.loadResource')}: {error}
      </Alert>
    );
  }

  if (!resource) {
    return (
      <>
        <Link to="/">
          <Button variant="tertiary" data-size="sm" className="mb-4" asChild>
            <span>&larr; {t('resource.back')}</span>
          </Button>
        </Link>
        <Alert data-color="warning">{t('resource.notFound')} &laquo;{id}&raquo;.</Alert>
      </>
    );
  }

  const orgCode = resource.hasCompetentAuthority?.orgcode?.toLowerCase();
  const yesNo = (val: boolean | undefined) => (val ? t('yes') : t('no'));

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:underline">
          {t('nav.home')}
        </Link>
        <span>/</span>
        {orgCode && (
          <>
            <Link to={`/org/${orgCode}`} className="hover:underline">
              {getText(resource.hasCompetentAuthority?.name, lang)}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900 truncate max-w-xs">{getText(resource.title, lang)}</span>
      </nav>

      {/* Title + status tags */}
      <section className="mb-8">
        <Heading level={2} data-size="lg" className="mb-3">
          {getText(resource.title, lang)}
        </Heading>
        <div className="flex flex-wrap gap-2">
          <Tag data-size="sm" variant="outline">
            {resource.resourceType}
          </Tag>
          {resource.status && (
            <Tag data-size="sm" data-color={resource.status === 'Active' ? 'success' : 'neutral'}>
              {resource.status}
            </Tag>
          )}
          {resource.delegable && (
            <Tag data-size="sm" data-color="info">
              {t('resource.delegable')}
            </Tag>
          )}
          {!resource.visible && (
            <Tag data-size="sm" data-color="warning">
              {t('resource.notVisible')}
            </Tag>
          )}
        </div>
      </section>

      {/* Description */}
      {getText(resource.description, lang) && (
        <section className="mb-8">
          <Heading level={3} data-size="xs" className="mb-3">
            {t('resource.description')}
          </Heading>
          <Paragraph data-size="sm">{getText(resource.description, lang)}</Paragraph>
        </section>
      )}

      {/* Rights description */}
      {getText(resource.rightDescription, lang) && (
        <section className="mb-8">
          <Heading level={3} data-size="xs" className="mb-3">
            {t('resource.rightDescription')}
          </Heading>
          <Paragraph data-size="sm">{getText(resource.rightDescription, lang)}</Paragraph>
        </section>
      )}

      {/* Competent Authority */}
      <Card className="mb-8">
        <CardBlock className="p-5">
          <Heading level={3} data-size="xs" className="mb-3">
            {t('resource.serviceOwner')}
          </Heading>
          <dl>
            <DetailRow label={t('resource.name')}>{getText(resource.hasCompetentAuthority?.name, lang)}</DetailRow>
            <DetailRow label={t('resource.orgCode')}>
              {orgCode && (
                <Link to={`/org/${orgCode}`} className="text-blue-600 hover:underline">
                  {resource.hasCompetentAuthority?.orgcode}
                </Link>
              )}
            </DetailRow>
            <DetailRow label={t('resource.orgNumber')}>
              {resource.hasCompetentAuthority?.organization}
            </DetailRow>
          </dl>
        </CardBlock>
      </Card>

      {/* Technical details */}
      <Card className="mb-8">
        <CardBlock className="p-5">
          <Heading level={3} data-size="xs" className="mb-3">
            {t('resource.technicalDetails')}
          </Heading>
          <dl>
            <DetailRow label={t('resource.identifier')}>{resource.identifier}</DetailRow>
            <DetailRow label={t('resource.resourceType')}>{resource.resourceType}</DetailRow>
            <DetailRow label={t('resource.status')}>{resource.status}</DetailRow>
            <DetailRow label={t('resource.version')}>{resource.version}</DetailRow>
            <DetailRow label={t('resource.versionId')}>{resource.versionId}</DetailRow>
            <DetailRow label={t('resource.accessListMode')}>{resource.accessListMode}</DetailRow>
            <DetailRow label={t('resource.delegableLabel')}>{yesNo(resource.delegable)}</DetailRow>
            <DetailRow label={t('resource.visible')}>{yesNo(resource.visible)}</DetailRow>
            <DetailRow label={t('resource.selfIdentified')}>
              {yesNo(resource.selfIdentifiedUserEnabled)}
            </DetailRow>
            <DetailRow label={t('resource.enterpriseUsers')}>
              {yesNo(resource.enterpriseUserEnabled)}
            </DetailRow>
            <DetailRow label={t('resource.oneTimeConsent')}>{yesNo(resource.isOneTimeConsent)}</DetailRow>
            {resource.homepage && (
              <DetailRow label={t('resource.homepage')}>
                <a
                  href={resource.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {resource.homepage}
                </a>
              </DetailRow>
            )}
            {resource.isPartOf && <DetailRow label={t('resource.partOf')}>{resource.isPartOf}</DetailRow>}
          </dl>
        </CardBlock>
      </Card>

      {/* Available for types */}
      {resource.availableForType && resource.availableForType.length > 0 && (
        <Card className="mb-8">
          <CardBlock className="p-5">
            <Heading level={3} data-size="xs" className="mb-3">
              {t('resource.availableFor')}
            </Heading>
            <div className="flex flex-wrap gap-2">
              {resource.availableForType.map((type) => (
                <Tag key={type} data-size="sm" variant="outline">
                  {type}
                </Tag>
              ))}
            </div>
          </CardBlock>
        </Card>
      )}

      {/* Resource references */}
      {resource.resourceReferences && resource.resourceReferences.length > 0 && (
        <Card className="mb-8">
          <CardBlock className="p-5">
            <Heading level={3} data-size="xs" className="mb-3">
              {t('resource.references')}
            </Heading>
            <div className="space-y-2">
              {resource.resourceReferences.map((ref, i) => (
                <div key={i} className="flex flex-wrap gap-2 items-center text-sm">
                  {ref.referenceSource && (
                    <Tag data-size="sm" variant="outline">
                      {ref.referenceSource}
                    </Tag>
                  )}
                  {ref.referenceType && (
                    <Tag data-size="sm" variant="outline">
                      {ref.referenceType}
                    </Tag>
                  )}
                  {ref.reference && <span className="font-mono text-xs">{ref.reference}</span>}
                </div>
              ))}
            </div>
          </CardBlock>
        </Card>
      )}

      {/* Authorization references */}
      {resource.authorizationReference && resource.authorizationReference.length > 0 && (
        <Card className="mb-8">
          <CardBlock className="p-5">
            <Heading level={3} data-size="xs" className="mb-3">
              {t('resource.authReferences')}
            </Heading>
            <div className="space-y-2">
              {resource.authorizationReference.map((ref, i) => (
                <div key={i} className="text-sm">
                  <span className="font-mono text-xs text-gray-500">{ref.id}</span>
                  <span className="mx-2">=</span>
                  <span className="font-mono text-xs">{ref.value}</span>
                </div>
              ))}
            </div>
          </CardBlock>
        </Card>
      )}

      {/* Contact points */}
      {resource.contactPoints && resource.contactPoints.length > 0 && (
        <Card className="mb-8">
          <CardBlock className="p-5">
            <Heading level={3} data-size="xs" className="mb-3">
              {t('resource.contactPoints')}
            </Heading>
            <div className="space-y-4">
              {resource.contactPoints.map((cp, i) => (
                <dl key={i}>
                  {cp.category && <DetailRow label={t('resource.category')}>{cp.category}</DetailRow>}
                  {cp.email && (
                    <DetailRow label={t('resource.email')}>
                      <a href={`mailto:${cp.email}`} className="text-blue-600 hover:underline">
                        {cp.email}
                      </a>
                    </DetailRow>
                  )}
                  {cp.telephone && <DetailRow label={t('resource.phone')}>{cp.telephone}</DetailRow>}
                  {cp.contactPage && (
                    <DetailRow label={t('resource.contactPage')}>
                      <a
                        href={cp.contactPage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {cp.contactPage}
                      </a>
                    </DetailRow>
                  )}
                </dl>
              ))}
            </div>
          </CardBlock>
        </Card>
      )}

      {/* Keywords */}
      {resource.keywords && resource.keywords.length > 0 && (
        <Card className="mb-8">
          <CardBlock className="p-5">
            <Heading level={3} data-size="xs" className="mb-3">
              {t('resource.keywords')}
            </Heading>
            <div className="flex flex-wrap gap-2">
              {resource.keywords.map((kw, i) => (
                <Tag key={i} data-size="sm" variant="outline">
                  {kw.word}
                </Tag>
              ))}
            </div>
          </CardBlock>
        </Card>
      )}

      {/* Spatial */}
      {resource.spatial && resource.spatial.length > 0 && (
        <Card className="mb-8">
          <CardBlock className="p-5">
            <Heading level={3} data-size="xs" className="mb-3">
              {t('resource.spatial')}
            </Heading>
            <div className="flex flex-wrap gap-2">
              {resource.spatial.map((s) => (
                <Tag key={s} data-size="sm" variant="outline">
                  {s}
                </Tag>
              ))}
            </div>
          </CardBlock>
        </Card>
      )}

      {/* Thematic areas */}
      {resource.thematicAreas && resource.thematicAreas.length > 0 && (
        <Card className="mb-8">
          <CardBlock className="p-5">
            <Heading level={3} data-size="xs" className="mb-3">
              {t('resource.thematicAreas')}
            </Heading>
            <div className="flex flex-wrap gap-2">
              {resource.thematicAreas.map((area) => (
                <Tag key={area} data-size="sm" variant="outline">
                  {area}
                </Tag>
              ))}
            </div>
          </CardBlock>
        </Card>
      )}
    </>
  );
}
