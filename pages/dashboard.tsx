import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [funnels, setFunnels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace('/auth/login');
        return;
      }
      setUser(data.user);
      
      // Fetch funnels for the user
      try {
        const res = await fetch('/api/funnels', {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setFunnels(data.funnels || []);
        }
      } catch (error) {
        console.error('Error fetching funnels:', error);
      }
      
      setLoading(false);
    };
    getUser();
  }, [router]);

  // Create funnel handler (calls API route)
  const handleCreateFunnel = async () => {
    const name = prompt('Enter a name for your new funnel:');
    if (!name) return;
    
    try {
      const session = await supabase.auth.getSession();
      const res = await fetch('/api/create-funnel', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session?.access_token}`
        },
        body: JSON.stringify({ name })
      });
      if (!res.ok) {
        alert('Error creating funnel.');
        return;
      }
      const data = await res.json();
      setFunnels([data.funnel, ...funnels]);
      router.push(`/builder/${data.funnel.id}`);
    } catch (error) {
      console.error('Error creating funnel:', error);
      alert('Error creating funnel.');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-body text-text bg-background">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen flex font-sans bg-gradient-to-br from-[#1a1333] via-[#2d1a4d] to-[#ff5f8f]">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex w-72 fixed inset-y-0 left-0 bg-gradient-to-b from-[#1a1333] via-[#2d1a4d] to-[#6a5cff] text-white/90 flex-col p-8 shadow-2xl z-20 border-r border-white/10 backdrop-blur-xl">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-[#ff5f8f] to-[#6a5cff] bg-clip-text text-transparent mb-10 tracking-wide">Leadflowgenius</h2>
        <nav className="flex flex-col gap-6 text-lg font-semibold">
          <a href="/dashboard" className="hover:text-[#ff5f8f] transition-colors">Funnels</a>
          <a href="#" className="hover:text-[#ff5f8f] transition-colors">Templates</a>
          <a href="#" className="hover:text-[#ff5f8f] transition-colors">Analytics</a>
          <a href="#" className="hover:text-[#ff5f8f] transition-colors">Account Settings</a>
        </nav>
        <div className="mt-auto pt-10 border-t border-white/10 text-sm text-white/60 opacity-90">African Business. Global Impact.</div>
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
          <div className="w-72 bg-gradient-to-b from-[#1a1333] via-[#2d1a4d] to-[#6a5cff] text-white/90 p-8 flex flex-col gap-6 border-r border-white/10 backdrop-blur-xl animate-slide-in-left relative">
            <button
              className="absolute top-4 right-4 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Close navigation menu"
              onClick={() => setMobileNavOpen(false)}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-[#ff5f8f] to-[#6a5cff] bg-clip-text text-transparent mb-10 tracking-wide">Leadflowgenius</h2>
            <nav className="flex flex-col gap-6 text-lg font-semibold">
              <a href="/dashboard" className="hover:text-[#ff5f8f] transition-colors" onClick={() => setMobileNavOpen(false)}>Funnels</a>
              <a href="#" className="hover:text-[#ff5f8f] transition-colors" onClick={() => setMobileNavOpen(false)}>Templates</a>
              <a href="#" className="hover:text-[#ff5f8f] transition-colors" onClick={() => setMobileNavOpen(false)}>Analytics</a>
              <a href="#" className="hover:text-[#ff5f8f] transition-colors" onClick={() => setMobileNavOpen(false)}>Account Settings</a>
            </nav>
            <div className="mt-auto pt-10 border-t border-white/10 text-sm text-white/60 opacity-90">African Business. Global Impact.</div>
          </div>
          {/* Overlay to close drawer */}
          <div className="flex-1 bg-black bg-opacity-40" onClick={() => setMobileNavOpen(false)} />
        </div>
      )}
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start p-12 relative md:ml-72 bg-gradient-to-br from-[#1a1333]/80 via-[#2d1a4d]/80 to-[#ff5f8f]/60 min-h-screen overflow-y-auto">
        {/* Glassy background overlay for extra depth */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-br from-[#ff5f8f]/10 via-[#6a5cff]/10 to-[#1a1333]/20 blur-2xl opacity-80"></div>
        </div>
        <div className="relative z-10 w-full max-w-4xl">
          <div className="bg-white/10 rounded-3xl shadow-2xl p-12 border border-white/20 backdrop-blur-2xl">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-10">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#ff5f8f] to-[#6a5cff] bg-clip-text text-transparent tracking-tight">Welcome, {user?.email}!</h1>
              <a href="/dashboard/crm" className="bg-gradient-to-r from-[#6a5cff] to-[#ff5f8f] text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-xl hover:scale-105 transition ml-0 md:ml-4 border border-white/20">Go to CRM</a>
            </div>
            <button className="w-full bg-gradient-to-r from-[#ff5f8f] to-[#6a5cff] text-white px-8 py-4 rounded-2xl mb-10 font-bold text-xl shadow-xl hover:scale-105 transition border border-white/20">Create New Funnel</button>
            <section>
              <h2 className="text-2xl font-bold mb-6 text-white/80">Your Funnels</h2>
              {funnels.length === 0 ? (
                <div className="text-white/70 text-lg italic">No funnels yet. Create your first one!</div>
              ) :
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {funnels.map((funnel) => (
                    <div key={funnel.id} className="bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-[1.03] transition-all duration-200 backdrop-blur-xl flex flex-col justify-between min-h-[140px]">
                      <div>
                        <h3 className="font-semibold text-2xl text-white mb-2 truncate">{funnel.name}</h3>
                        <p className="text-sm text-white/70 mb-2">
                          Created {new Date(funnel.createdAt).toLocaleDateString()}
                          {funnel.published && <span className="ml-2 text-green-400 font-medium">• Published</span>}
                        </p>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => router.push(`/builder/${funnel.id}`)}
                          className="bg-gradient-to-r from-[#ff5f8f] to-[#6a5cff] text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition border border-white/20"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              }
            </section>
          </div>
        </div>
        {/* Decorative pattern */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <svg width="100%" height="100%" className="opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="2" fill="#ff5f8f" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
      </main>
    </div>
  );
} 