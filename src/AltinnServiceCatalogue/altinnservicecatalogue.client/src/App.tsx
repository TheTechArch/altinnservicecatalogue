import { useMemo, useState } from 'react';
import './App.css';

type Service = {
  id: string;
  name: string;
  owner: string;
  category: string;
  accessPackage: string;
  description: string;
  url?: string;
};

const SAMPLE_SERVICES: Service[] = [
  {
    id: 's1',
    name: 'Citizen ID Registry',
    owner: 'Digital Services Agency',
    category: 'Identity',
    accessPackage: 'Public',
    description: 'Lookup and validate citizen identifiers for public services.',
  },
  {
    id: 's2',
    name: 'Business Register API',
    owner: 'Commerce Dept',
    category: 'Registry',
    accessPackage: 'Restricted',
    description: 'Search companies and retrieve registration data.',
  },
  {
    id: 's3',
    name: 'Payment Gateway',
    owner: 'Finance Authority',
    category: 'Payments',
    accessPackage: 'Partner',
    description: 'Process payments and refunds for public services.',
  },
  {
    id: 's4',
    name: 'Document Storage',
    owner: 'Digital Services Agency',
    category: 'Storage',
    accessPackage: 'Partner',
    description: 'Secure document storage for citizen submissions.',
  },
];

function App() {
  const [owner, setOwner] = useState('');
  const [category, setCategory] = useState('');
  const [accessPackage, setAccessPackage] = useState('');
  const [query, setQuery] = useState('');

  const owners = useMemo(() => Array.from(new Set(SAMPLE_SERVICES.map(s => s.owner))), []);
  const categories = useMemo(() => Array.from(new Set(SAMPLE_SERVICES.map(s => s.category))), []);
  const accessPackages = useMemo(() => Array.from(new Set(SAMPLE_SERVICES.map(s => s.accessPackage))), []);

  const filtered = useMemo(() => {
    return SAMPLE_SERVICES.filter(s => {
      if (owner && s.owner !== owner) return false;
      if (category && s.category !== category) return false;
      if (accessPackage && s.accessPackage !== accessPackage) return false;
      if (query && !`${s.name} ${s.description}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [owner, category, accessPackage, query]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-white/60 dark:bg-gray-800/60 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Service Catalogue</h1>
          <nav className="space-x-4 text-sm text-gray-600 dark:text-gray-300">
            <a className="hover:underline" href="#">Home</a>
            <a className="hover:underline" href="#services">Services</a>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <section className="text-center mb-10">
          <h2 className="text-4xl font-extrabold">Find public digital services</h2>
          <p className="mt-3 text-gray-600 dark:text-gray-300">Search by Service Owner, Category or Access Package.</p>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Service Owner</label>
              <select className="block w-full rounded border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2" value={owner} onChange={e => setOwner(e.target.value)}>
                <option value="">Any</option>
                {owners.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select className="block w-full rounded border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">Any</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Access Package</label>
              <select className="block w-full rounded border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2" value={accessPackage} onChange={e => setAccessPackage(e.target.value)}>
                <option value="">Any</option>
                {accessPackages.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Keyword</label>
              <div className="flex gap-2">
                <input className="flex-1 rounded border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2" placeholder="Search service name or description" value={query} onChange={e => setQuery(e.target.value)} />
                <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700" onClick={() => { /* search is reactive */ }}>Search</button>
                <button className="px-3 py-2 border rounded" onClick={() => { setOwner(''); setCategory(''); setAccessPackage(''); setQuery(''); }}>Clear</button>
              </div>
            </div>
          </div>
        </section>

        <section id="services">
          <h3 className="text-xl font-semibold mb-4">Results ({filtered.length})</h3>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">No services match your criteria.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(s => (
                <article key={s.id} className="rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
                  <h4 className="text-lg font-semibold">{s.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">{s.description}</p>
                  <div className="mt-4 text-sm flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Owner: {s.owner}</span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Category: {s.category}</span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Access: {s.accessPackage}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
