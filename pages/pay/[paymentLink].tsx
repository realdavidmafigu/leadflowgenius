import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function PublicInvoicePage() {
  const router = useRouter();
  const { paymentLink } = router.query;
  const [invoice, setInvoice] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [form, setForm] = useState({ clientName: '', message: '', proof: null });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    if (!paymentLink) return;
    const fetchInvoice = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/public-invoice?paymentLink=${paymentLink}`);
        if (res.ok) {
          const data = await res.json();
          setInvoice(data.invoice);
          setClient(data.client);
        } else {
          setError('Invoice not found');
        }
      } catch (err) {
        setError('Failed to fetch invoice');
      }
      setLoading(false);
    };
    fetchInvoice();
  }, [paymentLink]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as any;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormSuccess(false);
    setError('');
    try {
      // Upload proof if present
      let proofUrl = '';
      if (form.proof) {
        const body = new FormData();
        body.append('file', form.proof);
        const uploadRes = await fetch('/api/upload-proof', { method: 'POST', body });
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          proofUrl = url;
        }
      }
      // Submit payment confirmation
      const res = await fetch('/api/manual-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          clientName: form.clientName,
          message: form.message,
          proofUrl,
        }),
      });
      if (res.ok) {
        setFormSuccess(true);
        setShowPaymentForm(false);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit payment');
      }
    } catch (err) {
      setError('Failed to submit payment');
    }
    setFormLoading(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!invoice || !client) return null;

  // Example payment instructions (customize as needed)
  const paymentInstructions = [
    'Send Ecocash to 0772 123 456 (Name: David Mafigu)',
    'Bank Transfer to Steward Bank, Acc No: 12345678',
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
      <div className="w-full max-w-lg bg-white rounded-lg shadow p-6 mt-6">
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold mb-1">{client.company || 'Invoice'}</h1>
          <div className="text-gray-500">Invoice for {client.name}</div>
        </div>
        <div className="mb-4">
          <div className="font-semibold">Due Date:</div>
          <div>{new Date(invoice.dueDate).toLocaleDateString()}</div>
        </div>
        <div className="mb-4">
          <div className="font-semibold mb-2">Line Items</div>
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">Item</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Price</th>
                <th className="text-right">Tax %</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">{item.price.toFixed(2)}</td>
                  <td className="text-right">{item.tax || 0}</td>
                  <td className="text-right">{(item.quantity * item.price * (1 + (item.tax || 0) / 100)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mb-4 flex justify-end">
          <div className="text-lg font-semibold">Total: <span className="text-blue-700">{invoice.currency} {invoice.totalAmount.toFixed(2)}</span></div>
        </div>
        <div className="mb-4">
          <div className="font-semibold mb-1">Payment Instructions</div>
          <ul className="list-disc pl-5 text-gray-700">
            {paymentInstructions.map((inst, idx) => (
              <li key={idx}>{inst}</li>
            ))}
          </ul>
        </div>
        <div className="mb-4">
          <span className="inline-block px-3 py-1 rounded bg-gray-100 text-gray-700 text-sm">Status: {invoice.paid ? 'Paid' : 'Unpaid'}</span>
        </div>
        {formSuccess && <div className="text-green-600 mb-4">Payment confirmation submitted! Thank you.</div>}
        {!invoice.paid && !showPaymentForm && (
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700" onClick={() => setShowPaymentForm(true)}>
            Mark as Paid
          </button>
        )}
        {showPaymentForm && (
          <form onSubmit={handlePaymentSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Your Name</label>
              <input
                type="text"
                name="clientName"
                className="w-full px-3 py-2 border rounded"
                value={form.clientName}
                onChange={handleFormChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message or Reference</label>
              <textarea
                name="message"
                className="w-full px-3 py-2 border rounded"
                value={form.message}
                onChange={handleFormChange}
                placeholder="Transaction reference, notes, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Upload Payment Proof (screenshot, optional)</label>
              <input
                type="file"
                name="proof"
                accept="image/*"
                className="w-full"
                onChange={handleFormChange}
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" disabled={formLoading}>
                {formLoading ? 'Submitting...' : 'Submit Payment Confirmation'}
              </button>
              <button type="button" className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300" onClick={() => setShowPaymentForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 