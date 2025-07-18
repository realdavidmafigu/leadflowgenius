import React, { useEffect, useState } from 'react';
import CrmLayout from '../../../components/CrmLayout';
import { supabase } from '../../../lib/supabase';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  type: string;
  category?: string;
}

const emptyProduct: Partial<Product> = {
  name: '',
  description: '',
  price: 0,
  type: 'Product',
  category: '',
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }
      const res = await fetch('/api/products', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
      } else {
        setError('Failed to load products');
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === 'price' ? parseFloat(value) : value }));
  };

  const handleEdit = (product: Product) => {
    setForm(product);
    setEditingId(product.id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    setSaving(true);
    setError('');
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) {
      setError('Not authenticated');
      setSaving(false);
      return;
    }
    const res = await fetch('/api/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setProducts(products => products.filter(p => p.id !== id));
    } else {
      setError('Failed to delete');
    }
    setSaving(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) {
      setError('Not authenticated');
      setSaving(false);
      return;
    }
    const res = await fetch('/api/products', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ ...form, id: editingId }),
    });
    if (res.ok) {
      const { product } = await res.json();
      setProducts(products => {
        if (editingId) {
          return products.map(p => p.id === editingId ? product : p);
        } else {
          return [product, ...products];
        }
      });
      setForm(emptyProduct);
      setEditingId(null);
    } else {
      setError('Failed to save');
    }
    setSaving(false);
  };

  return (
    <CrmLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#1a1333] via-[#2d1a4d] to-[#ff5f8f] p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 mt-8">
          <h1 className="text-2xl font-bold mb-6 text-white">Products & Services</h1>
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-3 py-2 border rounded"
                  value={form.name || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="w-32">
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  name="type"
                  className="w-full px-3 py-2 border rounded"
                  value={form.type || 'Product'}
                  onChange={handleChange}
                >
                  <option value="Product">Product</option>
                  <option value="Service">Service</option>
                </select>
              </div>
              <div className="w-32">
                <label className="block text-sm font-medium mb-1">Unit Price</label>
                <input
                  type="number"
                  name="price"
                  className="w-full px-3 py-2 border rounded"
                  value={form.price || 0}
                  onChange={handleChange}
                  min={0}
                  step={0.01}
                  required
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  className="w-full px-3 py-2 border rounded"
                  value={form.description || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="w-64">
                <label className="block text-sm font-medium mb-1">Category (optional)</label>
                <input
                  type="text"
                  name="category"
                  className="w-full px-3 py-2 border rounded"
                  value={form.category || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                disabled={saving}
              >
                {saving ? (editingId ? 'Saving...' : 'Adding...') : (editingId ? 'Save Changes' : 'Add Product/Service')}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
                  onClick={() => { setForm(emptyProduct); setEditingId(null); }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
          <h2 className="text-lg font-semibold mb-4 text-white">Your Products & Services</h2>
          {loading ? (
            <div className="text-center text-gray-400">Loading...</div>
          ) : products.length === 0 ? (
            <div className="text-center text-gray-500">No products or services found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map(product => (
                    <tr key={product.id}>
                      <td className="px-4 py-2 whitespace-nowrap font-semibold">{product.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{product.type}</td>
                      <td className="px-4 py-2 whitespace-nowrap">${product.price.toFixed(2)}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{product.category || '—'}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{product.description || '—'}</td>
                      <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                        <button
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                          onClick={() => handleEdit(product)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                          onClick={() => handleDelete(product.id)}
                          disabled={saving}
                        >
                          Delete
                        </button>
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