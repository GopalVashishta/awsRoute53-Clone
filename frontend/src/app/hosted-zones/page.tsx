'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { apiRequest } from '@/lib/api';

export default function HostedZones() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { addNotification } = useNotification();
  
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const [selected, setSelected] = useState<string[]>([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  const loadZones = async () => {
    setLoading(true);
    try {
      const data: any = await apiRequest(`/api/hosted-zones?search=${search}&page=${page}&page_size=${pageSize}`);
      setZones(data.items || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      addNotification('error', err.message || 'Failed to load zones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadZones();
  }, [user, search, page]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      for (const id of selected) {
        await apiRequest(`/api/hosted-zones/${id}`, { method: 'DELETE' });
      }
      addNotification('success', `Deleted ${selected.length} hosted zone(s)`);
      setSelected([]);
      setDeleteModal(false);
      loadZones();
    } catch (err: any) {
      addNotification('error', err.message || 'Failed to delete zones');
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || !user) return <div style={{padding:40}}><Spinner /></div>;

  return (
    <AppShell>
      <div className="aws-content-area">
        <div className="aws-breadcrumb">Route 53 &gt; Hosted zones</div>
        
        <div className="aws-page-header" style={{ marginTop: 16, marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600 }}>Hosted zones</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button disabled={selected.length === 0} onClick={() => setDeleteModal(true)}>Delete</Button>
            <Button variant="primary" onClick={() => router.push('/hosted-zones/create')}>Create hosted zone</Button>
          </div>
        </div>

        <div className="aws-table-container">
          <div style={{ padding: 16, borderBottom: '1px solid #eaeded' }}>
            <input type="text" placeholder="Search hosted zones" value={search} onChange={e => setSearch(e.target.value)} className="aws-input" style={{ maxWidth: 300 }} />
          </div>
          
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}><Spinner /></div>
          ) : zones.length === 0 ? (
            <EmptyState title="No hosted zones found" subtitle="You don't have any hosted zones. Create one to get started." />
          ) : (
            <>
              <table className="aws-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}><input type="checkbox" onChange={e => setSelected(e.target.checked ? zones.map(z => z.id) : [])} checked={selected.length === zones.length && zones.length > 0} /></th>
                    <th>Domain name</th>
                    <th>Type</th>
                    <th>Records count</th>
                    <th>Comment</th>
                    <th>Hosted zone ID</th>
                  </tr>
                </thead>
                <tbody>
                  {zones.map(zone => (
                    <tr key={zone.id} className={selected.includes(zone.id) ? 'selected' : ''}>
                      <td><input type="checkbox" checked={selected.includes(zone.id)} onChange={e => {
                        if (e.target.checked) setSelected([...selected, zone.id]);
                        else setSelected(selected.filter(id => id !== zone.id));
                      }} /></td>
                      <td><Link href={`/hosted-zones/${zone.id}`} style={{color:'#0972d3',textDecoration:'none'}}>{zone.name}</Link></td>
                      <td><span className={zone.private_zone ? 'aws-badge-private' : 'aws-badge-public'}>{zone.private_zone ? 'Private' : 'Public'}</span></td>
                      <td>{zone.record_count || 0}</td>
                      <td>{zone.comment}</td>
                      <td>{zone.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination page={page} totalPages={Math.ceil(total/pageSize)} total={total} pageSize={pageSize} onPage={setPage} />
            </>
          )}
        </div>
      </div>
      
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete hosted zones" footer={<>
        <Button onClick={() => setDeleteModal(false)}>Cancel</Button>
        <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
      </>}>
        <p>Are you sure you want to delete {selected.length} hosted zone(s)?</p>
      </Modal>
    </AppShell>
  );
}
