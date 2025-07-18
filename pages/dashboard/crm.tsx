import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/router';
import CrmLayout from '../../components/CrmLayout';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  location: string;
  notes?: string;
  createdAt: string;
}

export default function CRMPage() {
  const [showModal, setShowModal] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    location: '',
    notes: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const router = useRouter();

  // Fetch clients for the authenticated user
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await fetch('/api/clients', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
      setLoading(false);
    };
    fetchClients();
  }, [showModal]); // refetch after modal closes (new client added)

  // Handle form input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) {
      setFormError('Not authenticated');
      setFormLoading(false);
      return;
    }
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowModal(false);
      setForm({ name: '', email: '', phone: '', company: '', location: '', notes: '' });
    } else {
      const data = await res.json();
      setFormError(data.error || 'Failed to add client');
    }
    setFormLoading(false);
  };

  return (
    <CrmLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#1a1333] via-[#2d1a4d] to-[#ff5f8f] p-4 md:p-8">
        {/* Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 p-6 flex flex-col items-center">
            <span className="text-2xl font-bold text-white">{clients.length}</span>
            <span className="text-white/70">Total Clients</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 p-6 flex flex-col items-center">
            <span className="text-2xl font-bold text-white">0</span>
            <span className="text-white/70">Active Invoices</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 p-6 flex flex-col items-center">
            <span className="text-2xl font-bold text-white">$0</span>
            <span className="text-white/70">Total Revenue</span>
          </div>
        </div>
        {/* Actions */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-white">Clients</h1>
          <button
            className="bg-gradient-to-r from-[#ff5f8f] to-[#6a5cff] text-white px-4 py-2 rounded-lg font-bold shadow hover:scale-105 transition"
            onClick={() => setShowModal(true)}
          >
            New Client
          </button>
        </div>
        {/* Clients Table */}
        <div className="overflow-x-auto bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10">
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
              {clients.map((client) => (
                <tr key={client.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{client.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{client.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{client.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{client.company}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300">Manage</button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      onClick={() => router.push(`/dashboard/crm/invoice/new?clientId=${client.id}`)}
                    >
                      Create Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* New Client Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
              <h2 className="text-lg font-semibold mb-4">Add New Client</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                <input
                  type="text"
                  name="company"
                  placeholder="Company Name"
                  value={form.company}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={form.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                <textarea
                  name="notes"
                  placeholder="Notes (optional)"
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                />
                {formError && <div className="text-red-500 text-sm">{formError}</div>}
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  disabled={formLoading}
                >
                  {formLoading ? 'Adding...' : 'Add Client'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </CrmLayout>
  );
} 