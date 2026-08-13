'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { apiRequest } from '@/lib/api';
import { RECORD_TYPES, TTL_PRESETS } from '@/lib/constants';

export default function EditRecord({ params }: { params: { zoneId: string, recordId: string } }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { addNotification } = useNotification();
  const { zoneId, recordId } = params;
  
  const [zone, setZone] = useState<any>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('A');
  const [ttl, setTtl] = useState(300);
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    
    if (user) {
      Promise.all([
        apiRequest(`/api/hosted-zones/${zoneId}`),
        apiRequest(`/api/hosted-zones/${zoneId}/records/${recordId}`)
      ])
      .then(([z, r]: [any, any]) => {
        setZone(z);
        let prefix = r.name;
        if (prefix.endsWith(`.${z.name}`)) {
          prefix = prefix.slice(0, -(z.name.length + 1));
        } else if (prefix === z.name) {
          prefix = '';
        }
        setName(prefix);
        setType(r.type);
        setTtl(r.ttl);
        setValue(r.value);
        setLoading(false);
      })
      .catch((err) => {
        addNotification('error', 'Failed to load record');
        router.push(`/hosted-zones/${zoneId}`);
      });
    }
  }, [user, authLoading, zoneId, recordId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fullDomain = name ? `${name}.${zone.name}` : zone.name;
      await apiRequest(`/api/hosted-zones/${zoneId}/records/${recordId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: fullDomain, type, ttl, value })
      });
      addNotification('success', `Successfully updated record`);
      router.push(`/hosted-zones/${zoneId}`);
    } catch (err: any) {
      addNotification('error', err.message || 'Failed to update record');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user || loading) return <div style={{padding:40}}><Spinner /></div>;

  return (
    <AppShell>
      <div className="aws-content-area">
        <div className="aws-breadcrumb">Route 53 &gt; Hosted zones &gt; {zone.name} &gt; Edit record</div>
        
        <div style={{ marginTop: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 20 }}>Edit record</h1>
          
          <form onSubmit={handleSubmit} style={{ background: 'white', padding: 20, border: '1px solid #eaeded', borderRadius: 2 }}>
            <div className="aws-form-group">
              <label className="aws-label">Record name</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="aws-input" style={{ width: 300 }} />
                <span style={{ marginLeft: 8, color: '#5f6b7a' }}>.{zone.name}</span>
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
              <input type="number" value={ttl} onChange={e => setTtl(Number(e.target.value))} className="aws-input" style={{ width: 300, marginBottom: 8 }} required min={1} />
              <div style={{ display: 'flex', gap: 8 }}>
                {TTL_PRESETS.map(preset => (
                  <Button key={preset.value} type="button" size="sm" onClick={() => setTtl(preset.value)}>{preset.label}</Button>
                ))}
              </div>
            </div>

            <div className="aws-form-group">
              <label className="aws-label">Value</label>
              <textarea value={value} onChange={e => setValue(e.target.value)} className="aws-textarea" required></textarea>
              <div className="aws-form-description">Enter multiple values on separate lines.</div>
            </div>
            
            <div style={{ display: 'flex', gap: 8, marginTop: 24, paddingTop: 16, borderTop: '1px solid #eaeded' }}>
              <Button type="button" onClick={() => router.push(`/hosted-zones/${zoneId}`)}>Cancel</Button>
              <Button type="submit" variant="primary" loading={submitting}>Save changes</Button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
