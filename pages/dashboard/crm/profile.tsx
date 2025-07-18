import React, { useEffect, useState } from 'react';
import CrmLayout from '../../../components/CrmLayout';
import { supabase } from '../../../lib/supabase';

export default function BusinessProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }
      const res = await fetch('/api/business-profile', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile || {});
      } else {
        setError('Failed to load profile');
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as any;
    if (name === 'logo' && files && files[0]) {
      setLogoFile(files[0]);
    } else {
      setProfile((p: any) => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    let logoUrl = profile.logoUrl;
    if (logoFile) {
      const body = new FormData();
      body.append('file', logoFile);
      const uploadRes = await fetch('/api/upload-proof', { method: 'POST', body });
      if (uploadRes.ok) {
        const { url } = await uploadRes.json();
        logoUrl = url;
      }
    }
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) {
      setError('Not authenticated');
      setSaving(false);
      return;
    }
    const res = await fetch('/api/business-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ ...profile, logoUrl }),
    });
    if (res.ok) {
      setSuccess(true);
    } else {
      setError('Failed to save profile');
    }
    setSaving(false);
  };

  return (
    <CrmLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#1a1333] via-[#2d1a4d] to-[#ff5f8f] p-4 md:p-8">
        <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 mt-8">
          <h1 className="text-2xl font-bold mb-6 text-white">Business Profile</h1>
          {loading ? (
            <div className="text-center text-white/70">Loading...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1 text-white/80">Business Name</label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-3 py-2 border rounded bg-white/10 text-white placeholder-white/60 border-white/20 focus:outline-none focus:ring-2 focus:ring-[#ff5f8f]"
                  value={profile?.name || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white/80">Logo</label>
                <input
                  type="file"
                  name="logo"
                  accept="image/*"
                  className="w-full text-white"
                  onChange={handleChange}
                />
                {profile?.logoUrl && (
                  <img src={profile.logoUrl} alt="Logo" className="h-16 mt-2 rounded shadow" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white/80">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  className="w-full px-3 py-2 border rounded bg-white/10 text-white placeholder-white/60 border-white/20 focus:outline-none focus:ring-2 focus:ring-[#ff5f8f]"
                  value={profile?.phone || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white/80">Email</label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-3 py-2 border rounded bg-white/10 text-white placeholder-white/60 border-white/20 focus:outline-none focus:ring-2 focus:ring-[#ff5f8f]"
                  value={profile?.email || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white/80">Website</label>
                <input
                  type="text"
                  name="website"
                  className="w-full px-3 py-2 border rounded bg-white/10 text-white placeholder-white/60 border-white/20 focus:outline-none focus:ring-2 focus:ring-[#ff5f8f]"
                  value={profile?.website || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white/80">Address</label>
                <input
                  type="text"
                  name="address"
                  className="w-full px-3 py-2 border rounded bg-white/10 text-white placeholder-white/60 border-white/20 focus:outline-none focus:ring-2 focus:ring-[#ff5f8f]"
                  value={profile?.address || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white/80">Payment Instructions</label>
                <textarea
                  name="paymentInstructions"
                  className="w-full px-3 py-2 border rounded bg-white/10 text-white placeholder-white/60 border-white/20 focus:outline-none focus:ring-2 focus:ring-[#ff5f8f]"
                  value={profile?.paymentInstructions || ''}
                  onChange={handleChange}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#ff5f8f] to-[#6a5cff] text-white py-3 rounded-lg font-bold text-lg shadow-lg hover:scale-105 transition mt-4"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
              {error && <div className="text-red-400 text-sm text-center mt-2">{error}</div>}
              {success && <div className="text-green-400 text-sm text-center mt-2">Profile saved!</div>}
            </form>
          )}
        </div>
      </div>
    </CrmLayout>
  );
} 