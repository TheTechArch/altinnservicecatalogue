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

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-b border-gray-100">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">{children}</dd>
    </div>
  );
}

function MultiLangBlock({ label, dict }: { label: string; dict?: Record<string, string> | null }) {
  if (!dict || Object.keys(dict).length === 0) return null;

  const langNames: Record<string, string> = { nb: 'Bokmål', nn: 'Nynorsk', en: 'English' };

  return (
    <section className="mb-8">
      <Heading level={3} data-size="xs" className="mb-3">
        {label}
      </Heading>
      <div className="space-y-3">
        {Object.entries(dict).map(([lang, text]) => (
          <div key={lang}>
            <span className="text-xs font-medium text-gray-400 uppercase">{langNames[lang] || lang}</span>
            <Paragraph data-size="sm">{text}</Paragraph>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ResourcePage() {
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
        <Spinner aria-label="Laster ressurs..." data-size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert data-color="danger" className="mb-6">
        Kunne ikke laste ressurs: {error}
      </Alert>
    );
  }

  if (!resource) {
    return (
      <>
        <Link to="/">
          <Button variant="tertiary" data-size="sm" className="mb-4" asChild>
            <span>&larr; Tilbake</span>
          </Button>
        </Link>
        <Alert data-color="warning">Fant ikke ressurs med id &laquo;{id}&raquo;.</Alert>
      </>
    );
  }

  const orgCode = resource.hasCompetentAuthority?.orgcode?.toLowerCase();

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:underline">
          Hjem
        </Link>
        <span>/</span>
        {orgCode && (
          <>
            <Link to={`/org/${orgCode}`} className="hover:underline">
              {getText(resource.hasCompetentAuthority?.name)}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900 truncate max-w-xs">{getText(resource.title)}</span>
      </nav>

      {/* Title + status tags */}
      <section className="mb-8">
        <Heading level={2} data-size="lg" className="mb-3">
          {getText(resource.title)}
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
              Delegerbar
            </Tag>
          )}
          {!resource.visible && (
            <Tag data-size="sm" data-color="warning">
              Ikke synlig
            </Tag>
          )}
        </div>
      </section>

      {/* Description sections */}
      <MultiLangBlock label="Beskrivelse" dict={resource.description} />
      <MultiLangBlock label="Rettighetsbeskrivelse" dict={resource.rightDescription} />

      {/* Competent Authority */}
      <Card className="mb-8">
        <CardBlock className="p-5">
          <Heading level={3} data-size="xs" className="mb-3">
            Tjenesteeier
          </Heading>
          <dl>
            <DetailRow label="Navn">{getText(resource.hasCompetentAuthority?.name)}</DetailRow>
            <DetailRow label="Orgkode">
              {orgCode && (
                <Link to={`/org/${orgCode}`} className="text-blue-600 hover:underline">
                  {resource.hasCompetentAuthority?.orgcode}
                </Link>
              )}
            </DetailRow>
            <DetailRow label="Organisasjonsnummer">
              {resource.hasCompetentAuthority?.organization}
            </DetailRow>
          </dl>
        </CardBlock>
      </Card>

      {/* Technical details */}
      <Card className="mb-8">
        <CardBlock className="p-5">
          <Heading level={3} data-size="xs" className="mb-3">
            Tekniske detaljer
          </Heading>
          <dl>
            <DetailRow label="Identifikator">{resource.identifier}</DetailRow>
            <DetailRow label="Ressurstype">{resource.resourceType}</DetailRow>
            <DetailRow label="Status">{resource.status}</DetailRow>
            <DetailRow label="Versjon">{resource.version}</DetailRow>
            <DetailRow label="Versjon-ID">{resource.versionId}</DetailRow>
            <DetailRow label="Tilgangsliste-modus">{resource.accessListMode}</DetailRow>
            <DetailRow label="Delegerbar">{resource.delegable ? 'Ja' : 'Nei'}</DetailRow>
            <DetailRow label="Synlig">{resource.visible ? 'Ja' : 'Nei'}</DetailRow>
            <DetailRow label="Selvidentifiserte brukere">
              {resource.selfIdentifiedUserEnabled ? 'Ja' : 'Nei'}
            </DetailRow>
            <DetailRow label="Virksomhetsbrukere">
              {resource.enterpriseUserEnabled ? 'Ja' : 'Nei'}
            </DetailRow>
            <DetailRow label="Engangssamtykke">{resource.isOneTimeConsent ? 'Ja' : 'Nei'}</DetailRow>
            {resource.homepage && (
              <DetailRow label="Hjemmeside">
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
            {resource.isPartOf && <DetailRow label="Del av">{resource.isPartOf}</DetailRow>}
          </dl>
        </CardBlock>
      </Card>

      {/* Available for types */}
      {resource.availableForType && resource.availableForType.length > 0 && (
        <Card className="mb-8">
          <CardBlock className="p-5">
            <Heading level={3} data-size="xs" className="mb-3">
              Tilgjengelig for
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
              Ressursreferanser
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
              Autorisasjonsreferanser
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
              Kontaktpunkter
            </Heading>
            <div className="space-y-4">
              {resource.contactPoints.map((cp, i) => (
                <dl key={i}>
                  {cp.category && <DetailRow label="Kategori">{cp.category}</DetailRow>}
                  {cp.email && (
                    <DetailRow label="E-post">
                      <a href={`mailto:${cp.email}`} className="text-blue-600 hover:underline">
                        {cp.email}
                      </a>
                    </DetailRow>
                  )}
                  {cp.telephone && <DetailRow label="Telefon">{cp.telephone}</DetailRow>}
                  {cp.contactPage && (
                    <DetailRow label="Kontaktside">
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
              Nøkkelord
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
              Geografisk dekning
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
              Tematiske områder
            </Heading>
            <div className="flex flex-wrap gap-2">
              {resource.thematicAreas.map((t) => (
                <Tag key={t} data-size="sm" variant="outline">
                  {t}
                </Tag>
              ))}
            </div>
          </CardBlock>
        </Card>
      )}
    </>
  );
}
