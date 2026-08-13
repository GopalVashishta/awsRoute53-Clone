'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { apiRequest } from '@/lib/api';
import { RECORD_TYPES, TTL_PRESETS } from '@/lib/constants';

export default function CreateRecord({ params }: { params: Promise<{ zoneId: string }> | { zoneId: string } }) {
  const resolvedParams = typeof (params as any)?.then === 'function' ? use(params as Promise<{ zoneId: string }>) : (params as { zoneId: string });
  const { zoneId } = resolvedParams;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { addNotification } = useNotification();
  
  const [zone, setZone] = useState<any>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('A');
  const [ttl, setTtl] = useState(300);
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if(!authLoading && !user) 
      router.push('/login');
    else if(user) 
      apiRequest(`/api/hosted-zones/${zoneId}`).then(setZone).catch(() => {});
  }, [user, authLoading, zoneId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try{
      const fullDomain = name ? `${name}.${zone.name}` : zone.name;
      await apiRequest(`/api/hosted-zones/${zoneId}/records`, {
        method: 'POST',
        body: JSON.stringify({ name: fullDomain, type, ttl, value })
      });
      addNotification('success', `Successfully created record`);
      router.push(`/hosted-zones/${zoneId}`);
    }
    catch (err: any) {
      addNotification('error', err.message || 'Failed to create record');
    }
    finally {
      setSubmitting(false);
    }
  };

  if(authLoading || !user || !zone) 
    return <div style={{padding:40, textAlign: 'center'}}><Spinner /></div>;

  return (
    <AppShell>
      <div className="aws-content-area">
        <div className="aws-breadcrumb">Route 53 &gt; Hosted zones &gt; {zone.name} &gt; Create record</div>
        
        <div style={{ marginTop: 20 }}>
          <h1 className="aws-page-title">Create record</h1>
          
          <form onSubmit={handleSubmit} className="aws-form-card">
            <div className="aws-form-group">
              <label className="aws-label">Record name</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="aws-input" 
                  style={{ width: 300 }} 
                  placeholder="www, mail, subdomain..."
                />
                <span className="aws-input-addon">.{zone.name}</span>
              </div>
            </div>
            
            <div className="aws-form-group">
              <label className="aws-label">Record type</label>
              <select value={type} onChange={e => setType(e.target.value)} className="aws-select" style={{ width: 300 }}>
                {RECORD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            
            <div className="aws-form-group">
              <label className="aws-label">TTL (seconds)</label>
              <input 
                type="number" 
                value={ttl} 
                onChange={e => setTtl(Number(e.target.value))} 
                className="aws-input" 
                style={{ width: 300, marginBottom: 8 }} 
                required 
                min={1} 
              />
              <div style={{ display: 'flex', gap: 8 }}>
                {TTL_PRESETS.map(preset => (
                  <Button key={preset.value} type="button" size="sm" onClick={() => setTtl(preset.value)}>{preset.label}</Button>
                ))}
              </div>
            </div>

            <div className="aws-form-group">
              <label className="aws-label">Value</label>
              <textarea 
                value={value} 
                onChange={e => setValue(e.target.value)} 
                className="aws-textarea" 
                placeholder="IP address or destination (e.g. 192.0.2.1)"
                required
              ></textarea>
              <div className="aws-form-description">Enter multiple values on separate lines.</div>
            </div>
            
            <div className="aws-form-footer">
              <Button type="button" onClick={() => router.push(`/hosted-zones/${zoneId}`)}>Cancel</Button>
              <Button type="submit" variant="primary" loading={submitting}>Create record</Button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
