import { createContext, useContext, useState, type ReactNode } from 'react';

export type Lang = 'nb' | 'en';

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Lang, string>> = {
  // Layout
  'nav.home': { nb: 'Hjem', en: 'Home' },
  'nav.about': { nb: 'Om', en: 'About' },
  'app.title': { nb: 'tjenesteoversikten.no', en: 'tjenesteoversikten.no' },

  // HomePage
  'home.hero.title': { nb: 'Finn offentlige digitale tjenester', en: 'Find public digital services' },
  'home.hero.subtitle': {
    nb: 'En digital tjenestekatalog som viser oversikt over digitale tjenester tilgjengelig i Norge.',
    en: 'A digital service catalogue showing an overview of digital services available in Norway.',
  },
  'home.hero.source': { nb: 'Kilden er ', en: 'Source: ' },
  'home.hero.sourceText': { nb: 'Altinn sitt Ressursregister', en: "Altinn's Resource Registry" },
  'home.hero.disclaimer': { nb: 'Dette er ikke et offisielt produkt fra Altinn.', en: 'This is not an official product from Altinn.' },
  'home.search.placeholder': { nb: 'Søk etter etat...', en: 'Search for agency...' },
  'home.search.aria': { nb: 'Søk etter etat', en: 'Search for agency' },
  'home.serviceOwners': { nb: 'Tjenesteeiere', en: 'Service owners' },
  'home.noMatch': { nb: 'Ingen etater samsvarer med søket ditt.', en: 'No agencies match your search.' },
  'home.tabs.serviceOwner': { nb: 'Tjenesteeier', en: 'Service owner' },
  'home.tabs.resourceType': { nb: 'Tjenestetype', en: 'Resource type' },
  'home.tabs.accessPackages': { nb: 'Tilgangspakker', en: 'Access packages' },
  'home.tabs.roles': { nb: 'Roller', en: 'Roles' },
  'home.tabs.comingSoon': { nb: 'Kommer snart...', en: 'Coming soon...' },
  'home.resourceTypes': { nb: 'Tjenestetyper', en: 'Resource types' },

  // ResourceTypePage
  'type.back': { nb: 'Tilbake til alle tjenestetyper', en: 'Back to all resource types' },
  'type.notFound': { nb: 'Fant ikke tjenestetype', en: 'Resource type not found' },
  'type.services': { nb: 'Tjenester', en: 'Services' },
  'type.search.placeholder': { nb: 'Søk i tjenester...', en: 'Search services...' },
  'type.search.aria': { nb: 'Søk i tjenester', en: 'Search services' },
  'type.noServices': { nb: 'Ingen tjenester av denne typen.', en: 'No services of this type.' },
  'type.noMatch': { nb: 'Ingen tjenester samsvarer med søket ditt.', en: 'No services match your search.' },

  // OrgPage
  'org.back': { nb: 'Tilbake til alle etater', en: 'Back to all agencies' },
  'org.notFound': { nb: 'Fant ikke etat med kode', en: 'Agency not found with code' },
  'org.services': { nb: 'Tjenester', en: 'Services' },
  'org.search.placeholder': { nb: 'Søk i tjenester...', en: 'Search services...' },
  'org.search.aria': { nb: 'Søk i tjenester', en: 'Search services' },
  'org.noServices': { nb: 'Denne etaten har ingen registrerte tjenester.', en: 'This agency has no registered services.' },
  'org.noMatch': { nb: 'Ingen tjenester samsvarer med søket ditt.', en: 'No services match your search.' },

  // ResourcePage
  'resource.back': { nb: 'Tilbake', en: 'Back' },
  'resource.notFound': { nb: 'Fant ikke ressurs med id', en: 'Resource not found with id' },
  'resource.delegable': { nb: 'Delegerbar', en: 'Delegable' },
  'resource.notVisible': { nb: 'Ikke synlig', en: 'Not visible' },
  'resource.description': { nb: 'Beskrivelse', en: 'Description' },
  'resource.rightDescription': { nb: 'Rettighetsbeskrivelse', en: 'Rights description' },
  'resource.serviceOwner': { nb: 'Tjenesteeier', en: 'Service owner' },
  'resource.name': { nb: 'Navn', en: 'Name' },
  'resource.orgCode': { nb: 'Orgkode', en: 'Org code' },
  'resource.orgNumber': { nb: 'Organisasjonsnummer', en: 'Organization number' },
  'resource.technicalDetails': { nb: 'Tekniske detaljer', en: 'Technical details' },
  'resource.identifier': { nb: 'Identifikator', en: 'Identifier' },
  'resource.resourceType': { nb: 'Ressurstype', en: 'Resource type' },
  'resource.status': { nb: 'Status', en: 'Status' },
  'resource.version': { nb: 'Versjon', en: 'Version' },
  'resource.versionId': { nb: 'Versjon-ID', en: 'Version ID' },
  'resource.accessListMode': { nb: 'Tilgangsliste-modus', en: 'Access list mode' },
  'resource.delegableLabel': { nb: 'Delegerbar', en: 'Delegable' },
  'resource.visible': { nb: 'Synlig', en: 'Visible' },
  'resource.selfIdentified': { nb: 'Selvidentifiserte brukere', en: 'Self-identified users' },
  'resource.enterpriseUsers': { nb: 'Virksomhetsbrukere', en: 'Enterprise users' },
  'resource.oneTimeConsent': { nb: 'Engangssamtykke', en: 'One-time consent' },
  'resource.homepage': { nb: 'Hjemmeside', en: 'Homepage' },
  'resource.partOf': { nb: 'Del av', en: 'Part of' },
  'resource.availableFor': { nb: 'Tilgjengelig for', en: 'Available for' },
  'resource.references': { nb: 'Ressursreferanser', en: 'Resource references' },
  'resource.authReferences': { nb: 'Autorisasjonsreferanser', en: 'Authorization references' },
  'resource.contactPoints': { nb: 'Kontaktpunkter', en: 'Contact points' },
  'resource.category': { nb: 'Kategori', en: 'Category' },
  'resource.email': { nb: 'E-post', en: 'Email' },
  'resource.phone': { nb: 'Telefon', en: 'Phone' },
  'resource.contactPage': { nb: 'Kontaktside', en: 'Contact page' },
  'resource.keywords': { nb: 'Nøkkelord', en: 'Keywords' },
  'resource.spatial': { nb: 'Geografisk dekning', en: 'Spatial coverage' },
  'resource.thematicAreas': { nb: 'Tematiske områder', en: 'Thematic areas' },
  'resource.accessRights': { nb: 'Tilgangsrettigheter', en: 'Access rights' },
  'resource.accessPackagesSection': { nb: 'Tilgangspakker', en: 'Access packages' },
  'resource.rolesSection': { nb: 'Roller', en: 'Roles' },
  'resource.noAccessRights': { nb: 'Ingen tilgangsrettigheter funnet.', en: 'No access rights found.' },

  // AccessPackages (HomePage tab + PackagePage)
  'packages.search.placeholder': { nb: 'Søk i tilgangspakker...', en: 'Search access packages...' },
  'packages.search.aria': { nb: 'Søk i tilgangspakker', en: 'Search access packages' },
  'packages.noMatch': { nb: 'Ingen tilgangspakker samsvarer med søket ditt.', en: 'No access packages match your search.' },
  'packages.packages': { nb: 'tilgangspakker', en: 'access packages' },
  'packages.back': { nb: 'Tilbake til tilgangspakker', en: 'Back to access packages' },
  'packages.notFound': { nb: 'Fant ikke tilgangspakke', en: 'Access package not found' },
  'packages.delegable': { nb: 'Delegerbar', en: 'Delegable' },
  'packages.notDelegable': { nb: 'Ikke delegerbar', en: 'Not delegable' },
  'packages.services': { nb: 'Tjenester i denne pakken', en: 'Services in this package' },
  'packages.noServices': { nb: 'Ingen tjenester i denne pakken.', en: 'No services in this package.' },
  'packages.area': { nb: 'Område', en: 'Area' },
  'packages.group': { nb: 'Kategori', en: 'Category' },
  'packages.urn': { nb: 'URN', en: 'URN' },

  // Roles (HomePage tab + RolePage)
  'roles.search.placeholder': { nb: 'Søk i roller...', en: 'Search roles...' },
  'roles.search.aria': { nb: 'Søk i roller', en: 'Search roles' },
  'roles.noMatch': { nb: 'Ingen roller samsvarer med søket ditt.', en: 'No roles match your search.' },
  'roles.roles': { nb: 'roller', en: 'roles' },
  'roles.back': { nb: 'Tilbake til roller', en: 'Back to roles' },
  'roles.notFound': { nb: 'Fant ikke rolle', en: 'Role not found' },
  'roles.keyRole': { nb: 'Nøkkelrolle', en: 'Key role' },
  'roles.provider': { nb: 'Leverandør', en: 'Provider' },
  'roles.code': { nb: 'Kode', en: 'Code' },
  'roles.urn': { nb: 'URN', en: 'URN' },
  'roles.legacyRoleCode': { nb: 'Eldre rollekode', en: 'Legacy role code' },
  'roles.legacyUrn': { nb: 'Eldre URN', en: 'Legacy URN' },
  'roles.policyAvailable': { nb: 'Ressurspolicy tilgjengelig', en: 'Resource policy available' },
  'roles.allRoles': { nb: 'Alle roller', en: 'All roles' },
  'roles.keyRoles': { nb: 'Nøkkelroller', en: 'Key roles' },
  'roles.services': { nb: 'Tjenester med denne rollen', en: 'Services with this role' },
  'roles.noServices': { nb: 'Ingen tjenester knyttet til denne rollen.', en: 'No services associated with this role.' },

  // Keywords
  'home.tabs.keywords': { nb: 'Nøkkelord', en: 'Keywords' },
  'keywords.search.placeholder': { nb: 'Søk i nøkkelord...', en: 'Search keywords...' },
  'keywords.search.aria': { nb: 'Søk i nøkkelord', en: 'Search keywords' },
  'keywords.noMatch': { nb: 'Ingen nøkkelord samsvarer med søket ditt.', en: 'No keywords match your search.' },
  'keywords.total': { nb: 'Nøkkelord', en: 'Keywords' },
  'keyword.back': { nb: 'Tilbake til nøkkelord', en: 'Back to keywords' },
  'keyword.services': { nb: 'Tjenester', en: 'Services' },
  'keyword.noServices': { nb: 'Ingen tjenester med dette nøkkelordet.', en: 'No services with this keyword.' },
  'keyword.search.placeholder': { nb: 'Søk i tjenester...', en: 'Search services...' },
  'keyword.search.aria': { nb: 'Søk i tjenester', en: 'Search services' },
  'keyword.noMatch': { nb: 'Ingen tjenester samsvarer med søket ditt.', en: 'No services match your search.' },

  // Common
  'yes': { nb: 'Ja', en: 'Yes' },
  'no': { nb: 'Nei', en: 'No' },
  'loading': { nb: 'Laster...', en: 'Loading...' },
  'error.loadOrgs': { nb: 'Kunne ikke laste etater', en: 'Could not load agencies' },
  'error.loadData': { nb: 'Kunne ikke laste data', en: 'Could not load data' },
  'error.loadResource': { nb: 'Kunne ikke laste ressurs', en: 'Could not load resource' },
};

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('lang');
    return saved === 'en' ? 'en' : 'nb';
  });

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
  };

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] || entry['nb'] || key;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}
