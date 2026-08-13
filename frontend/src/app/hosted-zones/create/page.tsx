'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { apiRequest } from '@/lib/api';

export default function CreateHostedZone() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { addNotification } = useNotification();
  
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [privateZone, setPrivateZone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if(!authLoading && !user) 
      router.push('/login');
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try{
      await apiRequest('/api/hosted-zones', {
        method: 'POST',
        body: JSON.stringify({ name, comment, is_private_zone: privateZone })
      });
      addNotification('success', `Successfully created hosted zone ${name}`);
      router.push('/hosted-zones');
    }
    catch(err: any) {
      addNotification('error', err.message || 'Failed to create hosted zone');
    }
    finally{
      setSubmitting(false);
    }
  };

  if(authLoading || !user) 
    return <div style={{padding:40, textAlign: 'center'}}><Spinner /></div>;

  return (
    <AppShell>
      <div className="aws-content-area">
        <div className="aws-breadcrumb">Route 53 &gt; Hosted zones &gt; Create hosted zone</div>
        
        <div style={{ marginTop: 20 }}>
          <h1 className="aws-page-title">Create hosted zone</h1>
          
          <form onSubmit={handleSubmit} className="aws-form-card">
            <div className="aws-form-group">
              <label className="aws-label">Domain name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="aws-input" 
                placeholder="example.com"
                required 
              />
              <div className="aws-form-description">The name of the domain you want to route traffic for.</div>
            </div>
            
            <div className="aws-form-group">
              <label className="aws-label">Description (optional)</label>
              <textarea 
                value={comment} 
                onChange={e => setComment(e.target.value)} 
                className="aws-textarea"
                placeholder="Description of this hosted zone"
              ></textarea>
            </div>
            
            <div className="aws-form-group">
              <label className="aws-label">Type</label>
              <div>
                <label className="aws-radio-label">
                  <input type="radio" name="type" checked={!privateZone} onChange={() => setPrivateZone(false)} />
                  Public hosted zone
                </label>
                <label className="aws-radio-label">
                  <input type="radio" name="type" checked={privateZone} onChange={() => setPrivateZone(true)} />
                  Private hosted zone
                </label>
              </div>
            </div>
            
            <div className="aws-form-footer">
              <Button type="button" onClick={() => router.push('/hosted-zones')}>Cancel</Button>
              <Button type="submit" variant="primary" loading={submitting}>Create hosted zone</Button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
