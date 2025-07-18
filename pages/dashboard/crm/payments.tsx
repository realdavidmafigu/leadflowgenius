import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import CrmLayout from '../../../components/CrmLayout';

interface ManualPayment {
  id: string;
  invoiceId: string;
  clientName: string;
  message?: string;
  proofUrl?: string;
  status: string;
  createdAt: string;
  invoice?: { title: string };
}

export default function PaymentsDashboard() {
  const [payments, setPayments] = useState<ManualPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError('');
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }
      const res = await fetch('/api/manual-payments', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments);
      } else {
        setError('Failed to fetch payments');
      }
      setLoading(false);
    };
    fetchPayments();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    setActionLoading(id + status);
    setError('');
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) {
      setError('Not authenticated');
      setActionLoading(null);
      return;
    }
    const res = await fetch('/api/manual-payments', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setPayments(payments => payments.map(p => p.id === id ? { ...p, status } : p));
    } else {
      setError('Failed to update status');
    }
    setActionLoading(null);
  };

  return (
    <CrmLayout>
      <h1 className="text-2xl font-bold mb-6">Manual Payment Confirmations</h1>
      {loading ? (
        <div className="p-8 text-center text-gray-400">Loading...</div>
      ) : error ? (
        <div className="p-8 text-center text-red-500">{error}</div>
      ) : payments.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No payment confirmations found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Proof</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map(payment => (
                <tr key={payment.id}>
                  <td className="px-4 py-2 whitespace-nowrap">{payment.clientName}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{payment.invoice?.title || payment.invoiceId}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{payment.message}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {payment.proofUrl ? (
                      <a href={payment.proofUrl} target="_blank" rel="noopener noreferrer">
                        <img src={payment.proofUrl} alt="Proof" className="h-12 rounded shadow" />
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${
                      payment.status === 'paid' ? 'bg-green-100 text-green-700' :
                      payment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      payment.status === 'followup' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                    <button
                      className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                      disabled={actionLoading === payment.id + 'paid'}
                      onClick={() => handleStatusChange(payment.id, 'paid')}
                    >
                      Mark as Paid
                    </button>
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                      disabled={actionLoading === payment.id + 'rejected'}
                      onClick={() => handleStatusChange(payment.id, 'rejected')}
                    >
                      Reject
                    </button>
                    <button
                      className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600"
                      disabled={actionLoading === payment.id + 'followup'}
                      onClick={() => handleStatusChange(payment.id, 'followup')}
                    >
                      Follow Up
                    </button>
                    {payment.status === 'paid' && payment.invoiceId && (
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `Hi ${payment.clientName}, your payment for invoice is received! Thank you. View your receipt: ${window.location.origin}/pay/${payment.invoiceId}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                      >
                        Send Receipt
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CrmLayout>
  );
} 