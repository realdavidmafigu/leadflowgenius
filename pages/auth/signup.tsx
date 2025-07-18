import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1333] via-[#2d1a4d] to-[#ff5f8f] flex items-center justify-center font-sans">
      <div className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 mb-2">
          <span className="text-3xl font-extrabold bg-gradient-to-r from-[#ff5f8f] to-[#6a5cff] bg-clip-text text-transparent">Leadflowgenius</span>
          <h1 className="text-xl font-bold text-white mt-2">Create your account</h1>
        </div>
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#ff5f8f]"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#ff5f8f]"
            required
          />
          {error && <div className="text-red-400 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#ff5f8f] to-[#6a5cff] py-3 rounded-lg font-bold text-lg shadow-lg hover:scale-105 transition"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <div className="flex justify-between items-center mt-2 text-sm text-white/70">
          <span>Already have an account?</span>
          <Link href="/auth/login" className="text-[#ff5f8f] hover:underline font-semibold">Login</Link>
        </div>
      </div>
    </div>
  );
} 