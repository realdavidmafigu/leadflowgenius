import React, { useEffect, useState } from 'react';
import CrmLayout from '../../../components/CrmLayout';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      setError('');
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }
      const res = await fetch('/api/invoices', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices);
      } else {
        setError('Failed to load invoices');
      }
      setLoading(false);
    };
    fetchInvoices();
  }, []);

  return (
    <CrmLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#1a1333] via-[#2d1a4d] to-[#ff5f8f] p-4 md:p-8">
        <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 mt-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Invoices</h1>
            <Link href="/dashboard/crm/invoice/new" className="bg-gradient-to-r from-[#ff5f8f] to-[#6a5cff] text-white px-4 py-2 rounded-lg font-bold shadow hover:scale-105 transition">New Invoice</Link>
          </div>
          {loading ? (
            <div className="text-center text-white/70">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-400">{error}</div>
          ) : invoices.length === 0 ? (
            <div className="text-center text-white/70">No invoices found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white/70 uppercase">Title</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white/70 uppercase">Client</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white/70 uppercase">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white/70 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white/70 uppercase">Due Date</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map(inv => (
                    <tr key={inv.id}>
                      <td className="px-4 py-2 whitespace-nowrap font-semibold">{inv.title}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{inv.client?.name || inv.clientId}</td>
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
      </div>
    </CrmLayout>
  );
} 