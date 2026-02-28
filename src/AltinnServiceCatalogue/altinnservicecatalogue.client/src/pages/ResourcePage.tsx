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
import type { ServiceResource, PolicyRule, PackageDto, RoleDto } from '../types';
import { getText } from '../helpers';
import { useLang } from '../lang';
import { useEnv } from '../env';

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-b border-gray-100">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">{children}</dd>
    </div>
  );
}

const ACTION_COLORS: Record<string, 'info' | 'success' | 'warning' | 'danger' | 'neutral'> = {
  read: 'info',
  write: 'success',
  sign: 'warning',
  confirmationrequired: 'neutral',
};

interface SubjectActions {
  type: string;
  value: string;
  actions: string[];
}

/** Group policy rules by subject and collect actions per subject */
function groupRulesBySubject(rules: PolicyRule[]): SubjectActions[] {
  const map = new Map<string, SubjectActions>();

  for (const rule of rules) {
    for (const subject of rule.subject) {
      const key = `${subject.type}::${subject.value}`;
      if (!map.has(key)) {
        map.set(key, { type: subject.type, value: subject.value, actions: [] });
      }
      const entry = map.get(key)!;
      if (!entry.actions.includes(rule.action.value)) {
        entry.actions.push(rule.action.value);
      }
    }
  }

  return [...map.values()];
}

export default function ResourcePage() {
  const { lang, t } = useLang();
  const { env } = useEnv();
  const { id } = useParams<{ id: string }>();

  const [resource, setResource] = useState<ServiceResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Access rights from policy rules
  const [packageSubjects, setPackageSubjects] = useState<SubjectActions[]>([]);
  const [roleSubjects, setRoleSubjects] = useState<SubjectActions[]>([]);
  const [loadingRules, setLoadingRules] = useState(false);

  // Resolved links for packages and roles
  const [packageInfo, setPackageInfo] = useState<Record<string, { id: string; name: string }>>({});
  const [roleInfo, setRoleInfo] = useState<Record<string, { id: string; name: string }>>({});

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    fetch(`/api/v1/${env}/resource/${encodeURIComponent(id)}`)
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
  }, [id, env]);

  // Fetch policy rules for this resource
  useEffect(() => {
    if (!id) return;
    setLoadingRules(true);

    fetch(`/api/v1/${env}/resource/${encodeURIComponent(id)}/policy/rules`)
      .then((res) => {
        if (!res.ok) return [];
        return res.json() as Promise<PolicyRule[]>;
      })
      .then((rules) => {
        const subjects = groupRulesBySubject(rules);

        const packages = subjects
          .filter((s) => s.type === 'urn:altinn:accesspackage')
          .sort((a, b) => a.value.localeCompare(b.value));
        setPackageSubjects(packages);

        const roles = subjects
          .filter((s) =>
            s.type === 'urn:altinn:rolecode' ||
            s.type === 'urn:altinn:external-role' ||
            s.type === 'urn:altinn:role',
          )
          .sort((a, b) => a.value.localeCompare(b.value));
        setRoleSubjects(roles);
      })
      .catch(() => {
        setPackageSubjects([]);
        setRoleSubjects([]);
      })
      .finally(() => {
        setLoadingRules(false);
      });
  }, [id, env]);

  // Resolve package URN values to IDs and names
  useEffect(() => {
    if (packageSubjects.length === 0) return;
    let cancelled = false;

    Promise.all(
      packageSubjects.map(async (subject) => {
        try {
          const res = await fetch(
            `/api/v1/${env}/meta/info/accesspackages/urn/${encodeURIComponent(subject.value)}`,
          );
          if (!res.ok) return null;
          const pkg: PackageDto = await res.json();
          return { urnValue: subject.value, id: pkg.id, name: pkg.name };
        } catch {
          return null;
        }
      }),
    ).then((results) => {
      if (cancelled) return;
      const info: Record<string, { id: string; name: string }> = {};
      for (const r of results) {
        if (r) info[r.urnValue] = { id: r.id, name: r.name };
      }
      setPackageInfo(info);
    });

    return () => { cancelled = true; };
  }, [packageSubjects, env]);

  // Resolve role subjects to IDs and names
  useEffect(() => {
    if (roleSubjects.length === 0) return;
    let cancelled = false;

    fetch(`/api/v1/${env}/meta/info/roles`)
      .then((res) => {
        if (!res.ok) return [];
        return res.json() as Promise<RoleDto[]>;
      })
      .then((roles) => {
        if (cancelled) return;
        // Build lookup by full URN (lowercase)
        const byUrn = new Map<string, RoleDto>();
        for (const role of roles) {
          byUrn.set(role.urn.toLowerCase(), role);
          if (role.legacyRoleCode) {
            byUrn.set(`urn:altinn:rolecode:${role.legacyRoleCode.toLowerCase()}`, role);
          }
        }

        const info: Record<string, { id: string; name: string }> = {};
        for (const subject of roleSubjects) {
          const fullUrn = `${subject.type}:${subject.value}`.toLowerCase();
          const matched = byUrn.get(fullUrn);
          if (matched) {
            const key = `${subject.type}::${subject.value}`;
            info[key] = { id: matched.id, name: matched.name };
          }
        }
        setRoleInfo(info);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [roleSubjects, env]);

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

      {/* Access rights: packages and roles */}
      <Card className="mb-8">
        <CardBlock className="p-5">
          <Heading level={3} data-size="xs" className="mb-4">
            {t('resource.accessRights')}
          </Heading>

          {loadingRules && (
            <div className="flex justify-center py-6">
              <Spinner aria-label={t('loading')} data-size="md" />
            </div>
          )}

          {!loadingRules && packageSubjects.length === 0 && roleSubjects.length === 0 && (
            <Paragraph data-size="sm" className="text-gray-500">
              {t('resource.noAccessRights')}
            </Paragraph>
          )}

          {!loadingRules && packageSubjects.length > 0 && (
            <div className="mb-6">
              <Heading level={4} data-size="2xs" className="mb-3">
                {t('resource.accessPackagesSection')} ({packageSubjects.length})
              </Heading>
              <div className="space-y-2">
                {packageSubjects.map((subject) => {
                  const pkg = packageInfo[subject.value];
                  return (
                    <div key={subject.value} className="flex items-center gap-2 flex-wrap">
                      {pkg ? (
                        <Link
                          to={`/package/${pkg.id}`}
                          className="text-sm font-medium text-blue-600 hover:underline min-w-0"
                        >
                          {pkg.name}
                        </Link>
                      ) : (
                        <span className="text-sm font-medium min-w-0">{subject.value}</span>
                      )}
                      {subject.actions.map((action) => (
                        <Tag
                          key={action}
                          data-size="sm"
                          data-color={ACTION_COLORS[action] ?? 'neutral'}
                        >
                          {action}
                        </Tag>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!loadingRules && roleSubjects.length > 0 && (
            <div>
              <Heading level={4} data-size="2xs" className="mb-3">
                {t('resource.rolesSection')} ({roleSubjects.length})
              </Heading>
              <div className="space-y-2">
                {roleSubjects.map((subject) => {
                  const key = `${subject.type}::${subject.value}`;
                  const role = roleInfo[key];
                  return (
                    <div key={key} className="flex items-center gap-2 flex-wrap">
                      {role ? (
                        <Link
                          to={`/role/${role.id}`}
                          className="text-sm font-medium text-blue-600 hover:underline min-w-0"
                        >
                          {role.name}
                        </Link>
                      ) : (
                        <span className="text-sm font-medium min-w-0">{subject.value}</span>
                      )}
                      {subject.actions.map((action) => (
                        <Tag
                          key={action}
                          data-size="sm"
                          data-color={ACTION_COLORS[action] ?? 'neutral'}
                        >
                          {action}
                        </Tag>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardBlock>
      </Card>

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
