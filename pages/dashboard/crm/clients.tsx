import React, { useEffect, useState } from 'react';
import CrmLayout from '../../../components/CrmLayout';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      setError('');
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }
      const res = await fetch('/api/clients', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      } else {
        setError('Failed to load clients');
      }
      setLoading(false);
    };
    fetchClients();
  }, []);

  return (
    <CrmLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#1a1333] via-[#2d1a4d] to-[#ff5f8f] p-4 md:p-8">
        <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 mt-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Clients</h1>
            <Link href="/dashboard/crm" className="bg-gradient-to-r from-[#ff5f8f] to-[#6a5cff] text-white px-4 py-2 rounded-lg font-bold shadow hover:scale-105 transition">Add Client</Link>
          </div>
          {loading ? (
            <div className="text-center text-white/70">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-400">{error}</div>
          ) : clients.length === 0 ? (
            <div className="text-center text-white/70">No clients found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white/70 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white/70 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white/70 uppercase">Phone</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white/70 uppercase">Company</th>
                    <th className="px-4 py-2"></th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map(client => (
                    <tr key={client.id}>
                      <td className="px-4 py-2 whitespace-nowrap font-semibold">{client.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{client.email}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{client.phone}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{client.company}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <Link
                          href={`/dashboard/crm/clients/${client.id}`}
                          className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 text-xs"
                        >
                          Manage
                        </Link>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <Link href={`/dashboard/crm/invoice/new?clientId=${client.id}`} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs">Create Invoice</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </CrmLayout>
  );
} 