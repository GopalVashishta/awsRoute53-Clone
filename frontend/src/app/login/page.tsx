'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { login } from '@/lib/auth';
import { Button } from '@/components/ui/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { user } = await login(email, password) as any;
      setUser(user);
      router.push('/hosted-zones');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f2f3f3' }}>
      <div style={{ width: 380, background: 'white', padding: 32, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 300, marginBottom: 24 }}>Sign in</h1>
        {error && <div className="aws-form-error" style={{ marginBottom: 16, padding: '12px', background: '#fce8e8', borderLeft: '4px solid #d91515' }}>{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="aws-form-group">
            <label className="aws-label">Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="aws-input" required />
          </div>
          <div className="aws-form-group">
            <label className="aws-label">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="aws-input" required />
          </div>
          <Button type="submit" variant="primary" loading={loading} style={{ width: '100%', justifyContent: 'center' }}>Sign in</Button>
        </form>
      </div>
    </div>
  );
}
