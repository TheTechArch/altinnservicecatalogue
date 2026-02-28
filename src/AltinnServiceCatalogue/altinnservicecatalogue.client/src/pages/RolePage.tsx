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
import type { RoleDto, SubjectResourcesResponse } from '../types';
import { useLang } from '../lang';
import { useEnv } from '../env';

interface ResourceInfo {
  refId: string;
  name: string;
}

/** Build the set of URNs to query for a role */
function getSubjectUrns(role: RoleDto): string[] {
  const urns = [role.urn];
  // If role has a legacy URN (urn:altinn:rolecode:XXX), include it too
  if (role.legacyRoleCode) {
    const legacyUrn = `urn:altinn:rolecode:${role.legacyRoleCode.toLowerCase()}`;
    if (legacyUrn !== role.urn) {
      urns.push(legacyUrn);
    }
  }
  return urns;
}

export default function RolePage() {
  const { t } = useLang();
  const { env } = useEnv();
  const { roleId } = useParams<{ roleId: string }>();
  const location = useLocation();

  const stateRole = (location.state as { role?: RoleDto } | null)?.role ?? null;

  const [role, setRole] = useState<RoleDto | null>(stateRole);
  const [loading, setLoading] = useState(!stateRole);
  const [error, setError] = useState<string | null>(null);

  const [resources, setResources] = useState<ResourceInfo[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);

  // Fetch role data if not passed via router state
  useEffect(() => {
    if (!roleId) return;
    if (stateRole) return;

    setLoading(true);
    setError(null);

    fetch(`/api/v1/${env}/meta/info/roles/${roleId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch role: ${res.status}`);
        return res.json() as Promise<RoleDto>;
      })
      .then((data) => {
        setRole(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [roleId, env]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch resources for this role via bysubjects
  useEffect(() => {
    if (!role) return;

    const urns = getSubjectUrns(role);
    setLoadingResources(true);

    fetch(`/api/v1/${env}/resource/bysubjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(urns),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch subject resources: ${res.status}`);
        return res.json() as Promise<SubjectResourcesResponse>;
      })
      .then((data) => {
        // Merge resources from all subject entries, dedup by value
        const seen = new Set<string>();
        const merged: ResourceInfo[] = [];
        for (const entry of data.data) {
          for (const r of entry.resources) {
            if (!seen.has(r.value)) {
              seen.add(r.value);
              merged.push({ refId: r.value, name: r.value });
            }
          }
        }
        merged.sort((a, b) => a.refId.localeCompare(b.refId));
        setResources(merged);
      })
      .catch(() => {
        setResources([]);
      })
      .finally(() => {
        setLoadingResources(false);
      });
  }, [role, env]);

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

  if (!role) {
    return (
      <>
        <Link to="/">
          <span className="text-sm text-blue-600 hover:underline">&larr; {t('roles.back')}</span>
        </Link>
        <Alert data-color="warning" className="mt-4">{t('roles.notFound')}</Alert>
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
        <span>{t('home.tabs.roles')}</span>
        {role.provider && (
          <>
            <span>/</span>
            <span>{role.provider.name}</span>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900 truncate max-w-xs">{role.name}</span>
      </nav>

      {/* Role header */}
      <section className="mb-8">
        <Heading level={2} data-size="lg" className="mb-3">
          {role.name}
        </Heading>
        <div className="flex flex-wrap gap-2 mb-4">
          {role.isKeyRole && (
            <Tag data-size="sm" data-color="info">
              {t('roles.keyRole')}
            </Tag>
          )}
          <Tag data-size="sm" data-color="neutral">
            {role.code}
          </Tag>
          {role.provider && (
            <Tag data-size="sm" data-color="neutral">
              {role.provider.name}
            </Tag>
          )}
        </div>
        {role.description && (
          <Paragraph data-size="md" className="mb-4">
            {role.description}
          </Paragraph>
        )}
      </section>

      {/* Role details */}
      <Card className="mb-8">
        <CardBlock className="p-5">
          <dl>
            <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-b border-gray-100">
              <dt className="text-sm font-medium text-gray-500">{t('roles.code')}</dt>
              <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0 font-mono text-xs">{role.code}</dd>
            </div>
            <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-b border-gray-100">
              <dt className="text-sm font-medium text-gray-500">{t('roles.urn')}</dt>
              <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0 font-mono text-xs">{role.urn}</dd>
            </div>
            {role.provider && (
              <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-b border-gray-100">
                <dt className="text-sm font-medium text-gray-500">{t('roles.provider')}</dt>
                <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">{role.provider.name}</dd>
              </div>
            )}
            <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-b border-gray-100">
              <dt className="text-sm font-medium text-gray-500">{t('roles.keyRole')}</dt>
              <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">{role.isKeyRole ? t('yes') : t('no')}</dd>
            </div>
            <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-b border-gray-100">
              <dt className="text-sm font-medium text-gray-500">{t('roles.policyAvailable')}</dt>
              <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">{role.isResourcePolicyAvailable ? t('yes') : t('no')}</dd>
            </div>
            {role.legacyRoleCode && (
              <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-b border-gray-100">
                <dt className="text-sm font-medium text-gray-500">{t('roles.legacyRoleCode')}</dt>
                <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0 font-mono text-xs">{role.legacyRoleCode}</dd>
              </div>
            )}
            {role.legacyUrn && (
              <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-b border-gray-100">
                <dt className="text-sm font-medium text-gray-500">{t('roles.legacyUrn')}</dt>
                <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0 font-mono text-xs">{role.legacyUrn}</dd>
              </div>
            )}
          </dl>
        </CardBlock>
      </Card>

      {/* Services this role has access to */}
      <section>
        <Heading level={3} data-size="sm" className="mb-4">
          {t('roles.services')} ({resources.length})
        </Heading>

        {loadingResources && (
          <div className="flex justify-center py-10">
            <Spinner aria-label={t('loading')} data-size="md" />
          </div>
        )}

        {!loadingResources && resources.length === 0 && (
          <Paragraph className="text-center py-16 text-gray-500">
            {t('roles.noServices')}
          </Paragraph>
        )}

        {!loadingResources && resources.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <Link
                key={resource.refId}
                to={`/resource/${encodeURIComponent(resource.refId)}`}
                className="no-underline"
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardBlock className="p-5 flex flex-col gap-2">
                    <Heading level={4} data-size="2xs">
                      {resource.name}
                    </Heading>
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
