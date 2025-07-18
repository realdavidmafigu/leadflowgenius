import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import CrmLayout from '../../../../components/CrmLayout';
import { supabase } from '../../../../lib/supabase';
import Link from 'next/link';

export default function ClientManagePage() {
  const router = useRouter();
  const { id } = router.query;
  const [client, setClient] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchClient = async () => {
      setLoading(true);
      setError('');
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }
      // Fetch client
      const res = await fetch(`/api/clients?id=${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setClient(data.client);
      } else {
        setError('Client not found');
      }
      // Fetch invoices for this client
      const invRes = await fetch(`/api/invoices?clientId=${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (invRes.ok) {
        const data = await invRes.json();
        setInvoices(data.invoices || []);
      }
      setLoading(false);
    };
    fetchClient();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClient((c: any) => ({ ...c, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) {
      setError('Not authenticated');
      setSaving(false);
      return;
    }
    const res = await fetch('/api/clients', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(client),
    });
    if (res.ok) {
      setSuccess(true);
    } else {
      setError('Failed to save');
    }
    setSaving(false);
  };

  const waLink = client?.phone ? `https://wa.me/${client.phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent('Hi ' + client.name + ', ...')}` : '';

  return (
    <CrmLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#1a1333] via-[#2d1a4d] to-[#ff5f8f] p-4 md:p-8">
        <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 mt-8">
          <h1 className="text-2xl font-bold mb-6 text-white">Manage Client</h1>
          {loading ? (
            <div className="text-center text-white/70">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-400">{error}</div>
          ) : client ? (
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input type="text" name="name" className="w-full px-3 py-2 border rounded" value={client.name || ''} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" name="email" className="w-full px-3 py-2 border rounded" value={client.email || ''} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input type="text" name="phone" className="w-full px-3 py-2 border rounded" value={client.phone || ''} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company</label>
                <input type="text" name="company" className="w-full px-3 py-2 border rounded" value={client.company || ''} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input type="text" name="location" className="w-full px-3 py-2 border rounded" value={client.location || ''} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea name="notes" className="w-full px-3 py-2 border rounded" value={client.notes || ''} onChange={handleChange} />
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              {success && <div className="text-green-600 text-sm">Saved!</div>}
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                {client.phone && (
                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Send WhatsApp</a>
                )}
              </div>
            </form>
          ) : null}
        </div>
      </div>
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
        <h2 className="text-lg font-semibold mb-4">Invoices for this Client</h2>
        {invoices.length === 0 ? (
          <div className="text-center text-gray-500">No invoices found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map(inv => (
                  <tr key={inv.id}>
                    <td className="px-4 py-2 whitespace-nowrap font-semibold">{inv.title}</td>
                    <td className="px-4 py-2 whitespace-nowrap">${inv.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${
                        inv.status === 'Paid' ? 'bg-green-100 text-green-700' :
                        inv.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                        inv.status === 'Sent' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{new Date(inv.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <Link href={`/dashboard/crm/invoice/${inv.id}/preview`} className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 text-xs">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CrmLayout>
  );
} 