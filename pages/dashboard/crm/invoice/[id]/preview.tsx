import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../../../lib/supabase';
import CrmLayout from '../../../../../components/CrmLayout';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoiceReceiptPDF from '../../../../../components/InvoiceReceiptPDF';

export default function InvoicePreviewPage() {
  const router = useRouter();
  const { id } = router.query;
  const [invoice, setInvoice] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingLink, setGeneratingLink] = useState(false);
  const [publicLink, setPublicLink] = useState<string | null>(null);
  const [businessProfile, setBusinessProfile] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    const fetchInvoice = async () => {
      setLoading(true);
      setError('');
      try {
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;
        if (!token) {
          setError('Not authenticated');
          setLoading(false);
          return;
        }
        const res = await fetch(`/api/invoices?id=${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setInvoice(data.invoice);
          setClient(data.client);
        } else {
          setError('Invoice not found');
        }
        // Fetch business profile
        const profileRes = await fetch('/api/business-profile', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (profileRes.ok) {
          const data = await profileRes.json();
          setBusinessProfile(data.profile);
        }
      } catch (err) {
        setError('Failed to fetch invoice');
      }
      setLoading(false);
    };
    fetchInvoice();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!invoice || !client) return null;

  // WhatsApp message
  const waMsg = `Hey ${client.name}, here's your invoice for ${invoice.title}. Click here to view & pay: [link]`;
  const waLink = `https://wa.me/?text=${encodeURIComponent(waMsg)}`;

  // Generate payment link handler
  const handleGenerateLink = async () => {
    setGeneratingLink(true);
    setError('');
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) {
        setError('Not authenticated');
        setGeneratingLink(false);
        return;
      }
      const res = await fetch(`/api/invoices`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id, action: 'generatePaymentLink' }),
      });
      if (res.ok) {
        const data = await res.json();
        setPublicLink(`${window.location.origin}/pay/${data.paymentLink}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to generate link');
      }
    } catch (err) {
      setError('Failed to generate link');
    }
    setGeneratingLink(false);
  };

  return (
    <CrmLayout>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Invoice Preview</h1>
            <span className="px-3 py-1 rounded bg-gray-100 text-gray-700 text-sm">{invoice.status}</span>
          </div>
          <div className="mb-6">
            <div className="font-semibold">To:</div>
            <div>{client.name}</div>
            <div>{client.email}</div>
            <div>{client.company}</div>
          </div>
          <div className="mb-6">
            <div className="font-semibold">Invoice Title:</div>
            <div>{invoice.title}</div>
            <div className="font-semibold mt-2">Due Date:</div>
            <div>{new Date(invoice.dueDate).toLocaleDateString()}</div>
          </div>
          <div className="mb-6">
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
          <div className="mb-6 flex justify-end">
            <div className="text-lg font-semibold">Total: <span className="text-blue-700">{invoice.currency} {invoice.totalAmount.toFixed(2)}</span></div>
          </div>
          {invoice.notes && (
            <div className="mb-6">
              <div className="font-semibold">Notes:</div>
              <div>{invoice.notes}</div>
            </div>
          )}
          <div className="flex gap-4 mt-8 flex-wrap">
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Send Invoice (WhatsApp)</a>
            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300" disabled>Download PDF (coming soon)</button>
            {!invoice.paymentLink && !publicLink && (
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleGenerateLink}
                disabled={generatingLink}
              >
                {generatingLink ? 'Generating...' : 'Generate Link'}
              </button>
            )}
            {(invoice.paymentLink || publicLink) && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Public Link:</span>
                <a
                  href={`/pay/${invoice.paymentLink || publicLink}`}
                  className="text-blue-600 underline break-all"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {`${window.location.origin}/pay/${invoice.paymentLink || publicLink}`}
                </a>
              </div>
            )}
            {invoice.status === 'Paid' && businessProfile && (
              <PDFDownloadLink
                document={<InvoiceReceiptPDF invoice={invoice} client={client} businessProfile={businessProfile} />}
                fileName={`Receipt-${invoice.id}.pdf`}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {({ loading }) => loading ? 'Generating PDF...' : 'Download Receipt'}
              </PDFDownloadLink>
            )}
          </div>
        </div>
      </div>
    </CrmLayout>
  );
} 