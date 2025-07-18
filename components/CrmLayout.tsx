import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const navLinks = [
  { label: 'Dashboard Overview', href: '/dashboard/crm' },
  { label: 'Clients', href: '/dashboard/crm/clients' },
  { label: 'Invoices', href: '/dashboard/crm/invoices' },
  { label: 'Products/Services', href: '/dashboard/crm/products' },
  { label: 'Business Profile', href: '/dashboard/crm/profile' },
  { label: 'Payments (Manual)', href: '/dashboard/crm/payments' },
];

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  return (
    <div className="min-h-screen flex font-sans">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex w-64 bg-gradient-to-b from-[#1a1333] via-[#2d1a4d] to-[#6a5cff] text-white/90 p-6 flex-col gap-6 border-r border-white/10 backdrop-blur-xl">
        <div className="text-2xl font-extrabold bg-gradient-to-r from-[#ff5f8f] to-[#6a5cff] bg-clip-text text-transparent mb-8">Leadflowgenius CRM</div>
        <nav className="flex flex-col gap-3">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} legacyBehavior>
              <a
                className={`block px-4 py-2 rounded transition-colors ${
                  router.pathname === link.href
                    ? 'bg-blue-700 font-semibold' : 'hover:bg-blue-800'
                }`}
              >
                {link.label}
              </a>
            </Link>
          ))}
        </nav>
      </aside>
      {/* Mobile Hamburger Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-[#1a1333] text-white p-2 rounded shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Open navigation menu"
        onClick={() => setMobileNavOpen(true)}
      >
        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
      {/* Mobile Sidebar Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-64 bg-gradient-to-b from-[#1a1333] via-[#2d1a4d] to-[#6a5cff] text-white/90 p-6 flex flex-col gap-6 border-r border-white/10 backdrop-blur-xl animate-slide-in-left relative">
            <button
              className="absolute top-4 right-4 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Close navigation menu"
              onClick={() => setMobileNavOpen(false)}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="text-2xl font-extrabold bg-gradient-to-r from-[#ff5f8f] to-[#6a5cff] bg-clip-text text-transparent mb-8">Leadflowgenius CRM</div>
            <nav className="flex flex-col gap-3">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} legacyBehavior>
                  <a
                    className={`block px-4 py-2 rounded transition-colors ${
                      router.pathname === link.href
                        ? 'bg-blue-700 font-semibold' : 'hover:bg-blue-800'
                    }`}
                    onClick={() => setMobileNavOpen(false)}
                  >
                    {link.label}
                  </a>
                </Link>
              ))}
            </nav>
          </div>
          {/* Overlay to close drawer */}
          <div className="flex-1 bg-black bg-opacity-40" onClick={() => setMobileNavOpen(false)} />
        </div>
      )}
      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-br from-[#1a1333]/80 via-[#2d1a4d]/80 to-[#ff5f8f]/60 p-6 md:p-12 min-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 p-6 md:p-12">
          {children}
        </div>
      </main>
    </div>
  );
} 