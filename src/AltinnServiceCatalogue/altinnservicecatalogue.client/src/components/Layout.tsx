import { Link, Outlet } from 'react-router-dom';
import { Heading } from '@digdir/designsystemet-react';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="no-underline">
            <Heading level={1} data-size="md">
              Tjenestekatalogen
            </Heading>
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link className="hover:underline" to="/">
              Hjem
            </Link>
            <a className="hover:underline" href="#">
              Om
            </a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
