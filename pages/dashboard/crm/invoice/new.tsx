import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../../lib/supabase';
import CrmLayout from '../../../../components/CrmLayout';

const currencyOptions = [
  { label: 'USD', value: 'USD' },
  { label: 'ZWL', value: 'ZWL' },
  { label: 'ZAR', value: 'ZAR' },
];

const emptyItem = { name: '', description: '', quantity: 1, price: 0, tax: 0 };

export default function NewInvoicePage() {
  const router = useRouter();
  const { clientId } = router.query;

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) return;
      const res = await fetch('/api/products', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
      }
    };
    fetchProducts();
  }, []);

  // Calculate total
  const total = items.reduce((sum, item) => {
    const subtotal = item.quantity * item.price;
    const taxAmount = subtotal * (item.tax ? item.tax / 100 : 0);
    return sum + subtotal + taxAmount;
  }, 0);

  // Handlers
  const handleItemChange = (idx: number, field: string, value: string | number) => {
    setItems(items => items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };
  const addItem = () => setItems([...items, { ...emptyItem }]);
  const removeItem = (idx: number) => setItems(items => items.filter((_, i) => i !== idx));

  const handleProductSelect = (idx: number, productId: string) => {
    if (productId === 'custom') {
      handleItemChange(idx, 'name', '');
      handleItemChange(idx, 'description', '');
      handleItemChange(idx, 'price', 0);
      return;
    }
    const product = products.find((p) => p.id === productId);
    if (product) {
      handleItemChange(idx, 'name', product.name);
      handleItemChange(idx, 'description', product.description || '');
      handleItemChange(idx, 'price', product.price);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientId,
          title,
          dueDate,
          currency,
          items,
          notes,
          totalAmount: total,
        }),
      });
      if (res.ok) {
        const invoice = await res.json();
        router.push(`/dashboard/crm/invoice/${invoice.id}/preview`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create invoice');
      }
    } catch (err) {
      setError('Failed to create invoice');
    }
    setLoading(false);
  };

  return (
    <CrmLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#1a1333] via-[#2d1a4d] to-[#ff5f8f] p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-2xl bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8">
          <h1 className="text-2xl font-bold mb-6 text-white">Create Invoice</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Invoice Title</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border rounded"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Currency</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                >
                  {currencyOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Line Items</label>
              <div className="space-y-2">
                {items.map((item, idx) => {
                  const [showTax, setShowTax] = useState(!!item.tax);
                  return (
                    <div key={idx} className="flex gap-2 items-end bg-gray-50 p-2 rounded mb-2 border border-gray-200">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Product/Service</label>
                        <select
                          className="w-full px-2 py-1 border rounded mb-1"
                          value={products.find(p => p.name === item.name) ? products.find(p => p.name === item.name)?.id : 'custom'}
                          onChange={e => handleProductSelect(idx, e.target.value)}
                        >
                          <option value="custom">Custom</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>{product.name} - ${product.price.toFixed(2)}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Service or Product"
                          className="w-full px-2 py-1 border rounded"
                          value={item.name}
                          onChange={e => handleItemChange(idx, 'name', e.target.value)}
                          required
                        />
                        <textarea
                          placeholder="Description (optional)"
                          className="w-full px-2 py-1 border rounded mt-1"
                          value={item.description || ''}
                          onChange={e => handleItemChange(idx, 'description', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Qty</label>
                        <input
                          type="number"
                          min={1}
                          placeholder="Qty"
                          className="w-16 px-2 py-1 border rounded"
                          value={item.quantity}
                          onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Unit Price</label>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          placeholder="Unit Price"
                          className="w-24 px-2 py-1 border rounded"
                          value={item.price}
                          onChange={e => handleItemChange(idx, 'price', Number(e.target.value))}
                          required
                        />
                      </div>
                      {showTax ? (
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Tax % <span className='text-gray-400'>(optional)</span></label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={0.01}
                            placeholder="Tax %"
                            className="w-20 px-2 py-1 border rounded"
                            value={item.tax}
                            onChange={e => handleItemChange(idx, 'tax', Number(e.target.value))}
                          />
                        </div>
                      ) : (
                        <button type="button" className="text-xs text-blue-500 mt-5" onClick={() => setShowTax(true)}>+ Add Tax</button>
                      )}
                      <div className="text-xs text-gray-700 ml-2 mb-1">
                        Subtotal: ${(item.quantity * item.price * (1 + (item.tax || 0) / 100)).toFixed(2)}
                      </div>
                      <button type="button" className="text-red-500 px-2 mb-1" onClick={() => removeItem(idx)} disabled={items.length === 1}>×</button>
                    </div>
                  );
                })}
                <button type="button" className="mt-2 text-blue-600 hover:underline" onClick={addItem}>+ Add Item</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                className="w-full px-3 py-2 border rounded"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Thanks for your business!"
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="flex justify-between items-center mt-6">
              <span className="text-lg font-semibold">Total: <span className="text-blue-700">{currency} {total.toFixed(2)}</span></span>
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700" disabled={loading}>
                {loading ? 'Saving...' : 'Save Invoice'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </CrmLayout>
  );
} 