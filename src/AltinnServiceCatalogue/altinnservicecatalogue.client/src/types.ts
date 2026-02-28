export interface Org {
  name: Record<string, string>;
  logo?: string;
  orgnr: string;
  homepage?: string;
  environments: string[];
}

export interface OrgList {
  orgs: Record<string, Org>;
}

export interface CompetentAuthority {
  name: Record<string, string>;
  organization: string;
  orgcode: string;
}

export interface ContactPoint {
  category?: string;
  email?: string;
  telephone?: string;
  contactPage?: string;
}

export interface ResourceReference {
  referenceSource?: string;
  reference?: string;
  referenceType?: string;
}

export interface Keyword {
  word: string;
  language: string;
}

export interface AuthorizationReferenceAttribute {
  id: string;
  value: string;
}

export interface ServiceResource {
  identifier: string;
  version?: string;
  title: Record<string, string>;
  description: Record<string, string>;
  rightDescription?: Record<string, string>;
  homepage?: string;
  status?: string;
  spatial?: string[];
  contactPoints?: ContactPoint[];
  produces?: string[];
  isPartOf?: string;
  thematicAreas?: string[];
  resourceReferences?: ResourceReference[];
  delegable: boolean;
  visible: boolean;
  hasCompetentAuthority: CompetentAuthority;
  keywords?: Keyword[];
  accessListMode: string;
  selfIdentifiedUserEnabled: boolean;
  enterpriseUserEnabled: boolean;
  resourceType: string;
  availableForType?: string[];
  authorizationReference?: AuthorizationReferenceAttribute[];
  consentTemplate?: string;
  consentText?: Record<string, string>;
  isOneTimeConsent: boolean;
  versionId: number;
}
