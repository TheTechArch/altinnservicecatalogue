import { useEffect, useMemo, useState } from 'react';
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
import './App.css';

interface Org {
  name: Record<string, string>;
  logo: string;
  orgnr: string;
  homepage: string;
  environments: string[];
}

interface OrgList {
  orgs: Record<string, Org>;
}

function getOrgName(org: Org, lang = 'nb'): string {
  return org.name[lang] || org.name['nb'] || org.name['nn'] || org.name['en'] || Object.values(org.name)[0] || '';
}

function getLogoUrl(orgCode: string, logo: string | null): string | null {
  if (!logo) return null;
  return `https://altinncdn.no/orgs/${orgCode}/${logo}`;
}

function App() {
  const [orgs, setOrgs] = useState<Record<string, Org>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/v1/tt02/resource/orgs')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch orgs: ${res.status}`);
        return res.json() as Promise<OrgList>;
      })
      .then((data) => {
        setOrgs(data.orgs ?? {});
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const sortedOrgs = useMemo(() => {
    return Object.entries(orgs)
      .map(([code, org]) => ({ code, ...org }))
      .filter((org) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const name = getOrgName(org).toLowerCase();
        return name.includes(q) || org.code.toLowerCase().includes(q) || (org.orgnr && org.orgnr.includes(q));
      })
      .sort((a, b) => getOrgName(a).localeCompare(getOrgName(b), 'nb'));
  }, [orgs, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Heading level={1} data-size="md">
            Tjenestekatalogen
          </Heading>
          <nav className="flex gap-4 text-sm">
            <a className="hover:underline" href="#">
              Hjem
            </a>
            <a className="hover:underline" href="#">
              Om
            </a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Hero */}
        <section className="text-center mb-10">
          <Heading level={2} data-size="xl" className="mb-3">
            Finn offentlige digitale tjenester
          </Heading>
          <Paragraph data-size="lg">
            Utforsk tjenester fra over 60 offentlige etater. Velg en tjenesteeier for å se deres tjenester.
          </Paragraph>
        </section>

        {/* Search */}
        <section className="max-w-lg mx-auto mb-10">
          <Search>
            <SearchInput
              aria-label="Søk etter etat"
              placeholder="Søk etter etat eller organisasjonsnummer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchClear onClick={() => setSearchQuery('')} />
          </Search>
        </section>

        {/* Content */}
        {loading && (
          <div className="flex justify-center py-20">
            <Spinner aria-label="Laster etater..." data-size="lg" />
          </div>
        )}

        {error && (
          <Alert data-color="danger" className="mb-6">
            Kunne ikke laste etater: {error}
          </Alert>
        )}

        {!loading && !error && (
          <>
            <div className="flex items-center justify-between mb-6">
              <Heading level={3} data-size="sm">
                Tjenesteeiere ({sortedOrgs.length})
              </Heading>
            </div>

            {sortedOrgs.length === 0 ? (
              <Paragraph className="text-center py-16 text-gray-500">
                Ingen etater samsvarer med søket ditt.
              </Paragraph>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {sortedOrgs.map((org) => {
                  const logoUrl = getLogoUrl(org.code, org.logo);
                  return (
                    <Card key={org.code} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardBlock className="flex flex-col items-center text-center p-4 gap-3">
                        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                          {logoUrl ? (
                            <img
                              src={logoUrl}
                              alt={`${getOrgName(org)} logo`}
                              className="w-12 h-12 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                const parent = (e.target as HTMLImageElement).parentElement;
                                if (parent && !parent.querySelector('.fallback-initials')) {
                                  const span = document.createElement('span');
                                  span.className = 'fallback-initials text-lg font-semibold text-gray-400';
                                  span.textContent = org.code.substring(0, 3).toUpperCase();
                                  parent.appendChild(span);
                                }
                              }}
                            />
                          ) : (
                            <span className="text-lg font-semibold text-gray-400">
                              {org.code.substring(0, 3).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <Heading level={4} data-size="2xs">
                          {getOrgName(org)}
                        </Heading>
                        {org.orgnr && (
                          <Tag data-size="sm" variant="outline">
                            {org.orgnr}
                          </Tag>
                        )}
                      </CardBlock>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
