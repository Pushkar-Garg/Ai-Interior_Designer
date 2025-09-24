import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuthStore } from '../store/authStore';
import { Button, Input } from './UI';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setAuth = useAuthStore(state => state.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAuth(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-zinc-100"
      >
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
            <Sparkles className="text-white w-6 h-6" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-center mb-2">
          {isLogin ? 'Welcome back' : 'Create an account'}
        </h1>
        <p className="text-zinc-500 text-center mb-8 text-sm">
          {isLogin ? 'Enter your credentials to access your studio' : 'Sign up to start designing your dream space'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Full Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Email Address</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (isLogin ? 'Sign In' : 'Create Account')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-zinc-500 hover:text-black transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
