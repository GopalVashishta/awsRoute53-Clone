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
  const { notify } = useNotification();
  
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const [selected, setSelected] = useState<string[]>([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState<{ skipped: any[] } | null>(null);

  useEffect(() => {
    if(!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  const loadZones = async () => {
    setLoading(true);
    try {
      const data: any = await apiRequest(`/api/hosted-zones?search=${encodeURIComponent(search)}&page=${page}&page_size=${pageSize}`);
      setZones(data.items || []);
      setTotal(data.total || 0);
    } catch(err: any) {
      notify('error', err.message || 'Failed to load zones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(user) loadZones();
  }, [user, search, page]);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteResult(null);
    try {
      const result: any = await apiRequest(`/api/hosted-zones`, {
        method: 'DELETE',
        body: JSON.stringify({ zone_ids: selected }),
      });
      const skipped = result.skipped || [];
      if (result.deleted > 0) {
        notify('success', result.message);
      }
      if (skipped.length > 0) {
        notify('error', `${skipped.length} zone(s) could not be deleted (have non-default records).`);
        setDeleteResult({ skipped });
      } else {
        setDeleteModal(false);
      }
      setSelected([]);
      loadZones();
    } catch(err: any) {
      notify('error', err.message || 'Failed to delete zones');
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelected(prev => checked ? [...prev, id] : prev.filter(i => i !== id));
  };

  const allSelected = zones.length > 0 && selected.length === zones.length;
  const someSelected = selected.length > 0;

  if(authLoading || !user) 
    return <div style={{padding:40, textAlign: 'center'}}><Spinner /></div>;

  return (
    <AppShell>
      <div className="aws-content-area">
        <div className="aws-breadcrumb">Route 53 &gt; Hosted zones</div>
        
        <div className="aws-page-header" style={{ marginTop: 16, marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600 }}>
            Hosted zones ({total})
          </h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button 
              disabled={!someSelected} 
              onClick={() => { setDeleteResult(null); setDeleteModal(true); }}
            >
              Delete
            </Button>
            <Button variant="primary" onClick={() => router.push('/hosted-zones/create')}>
              Create hosted zone
            </Button>
          </div>
        </div>

        {/* Bulk selection action bar */}
        {someSelected && (
          <div style={{
            background: '#e8f4fd',
            border: '1px solid #0972d3',
            borderRadius: 2,
            padding: '8px 16px',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 14,
          }}>
            <strong>{selected.length}</strong> hosted zone(s) selected
            <button
              onClick={() => setSelected([])}
              style={{ background: 'none', border: 'none', color: '#0972d3', cursor: 'pointer', fontSize: 13 }}
            >
              Clear selection
            </button>
          </div>
        )}

        <div className="aws-table-container">
          <div style={{ padding: 16, borderBottom: '1px solid #eaeded' }}>
            <input
              type="text"
              placeholder="Search hosted zones by domain name"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="aws-input"
              style={{ maxWidth: 360 }}
            />
          </div>
          
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}><Spinner /></div>
          ) : zones.length === 0 ? (
            <EmptyState
              title="No hosted zones"
              subtitle="You don't have any hosted zones. Create one to get started."
            />
          ) : (
            <>
              <table className="aws-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>
                      <input
                        type="checkbox"
                        title="Select all"
                        onChange={e => setSelected(e.target.checked ? zones.map(z => z.id) : [])}
                        checked={allSelected}
                        ref={el => { if(el) el.indeterminate = someSelected && !allSelected; }}
                      />
                    </th>
                    <th>Domain name</th>
                    <th>Type</th>
                    <th>Record count</th>
                    <th>Comment</th>
                    <th>Hosted zone ID</th>
                  </tr>
                </thead>
                <tbody>
                  {zones.map(zone => (
                    <tr key={zone.id} className={selected.includes(zone.id) ? 'selected' : ''}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.includes(zone.id)}
                          onChange={e => toggleSelect(zone.id, e.target.checked)}
                        />
                      </td>
                      <td>
                        <Link
                          href={`/hosted-zones/${zone.id}`}
                          style={{ color: '#0972d3', textDecoration: 'none', fontWeight: 500 }}
                        >
                          {zone.name}
                        </Link>
                      </td>
                      <td>
                        <span className={zone.is_private_zone ? 'aws-badge-private' : 'aws-badge-public'}>
                          {zone.is_private_zone ? 'Private' : 'Public'}
                        </span>
                      </td>
                      <td>{zone.record_set_count ?? 0}</td>
                      <td>{zone.comment || '-'}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 13, color: '#5f6b7a' }}>{zone.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Pagination
                page={page}
                totalPages={Math.ceil(total / pageSize)}
                total={total}
                pageSize={pageSize}
                onPage={setPage}
              />
            </>
          )}
        </div>
      </div>

      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete hosted zones"
        footer={
          <>
            <Button onClick={() => setDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        {deleteResult ? (
          <div>
            <p style={{ marginBottom: 12 }}>The following zone(s) could not be deleted because they still have records:</p>
            <ul style={{ paddingLeft: 20, fontSize: 14, color: '#d91515' }}>
              {deleteResult.skipped.map((s: any) => (
                <li key={s.id}><strong>{s.name || s.id}</strong>: {s.reason}</li>
              ))}
            </ul>
            <p style={{ marginTop: 12, fontSize: 13, color: '#5f6b7a' }}>
              Delete all non-default records from these zones first, then try again.
            </p>
          </div>
        ) : (
          <p>
            Are you sure you want to delete <strong>{selected.length}</strong> hosted zone(s)?{' '}
            Zones with non-default records cannot be deleted.
          </p>
        )}
      </Modal>
    </AppShell>
  );
}
