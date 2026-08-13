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
import { RECORD_TYPES } from '@/lib/constants';

export default function ZoneDetails({ params }: { params: { zoneId: string } }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { addNotification } = useNotification();
  const { zoneId } = params;
  
  const [zone, setZone] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const [selected, setSelected] = useState<string[]>([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if(!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  const loadData = async () => {
    setLoading(true);
    try{
      const zoneData = await apiRequest(`/api/hosted-zones/${zoneId}`);
      setZone(zoneData);
      
      const recordsData: any = await apiRequest(`/api/hosted-zones/${zoneId}/records?search=${search}&type=${typeFilter}&page=${page}&page_size=${pageSize}`);
      setRecords(recordsData.items || []);
      setTotal(recordsData.total || 0);
    }
    catch(err: any){
      addNotification('error', err.message || 'Failed to load data');
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(user) loadData();
  }, [user, zoneId, search, typeFilter, page]);

  const handleDelete = async () => {
    setDeleting(true);
    try{
      for(const id of selected){
        await apiRequest(`/api/hosted-zones/${zoneId}/records/${id}`, { method: 'DELETE' });
      }
      addNotification('success', `Deleted ${selected.length} record(s)`);
      setSelected([]);
      setDeleteModal(false);
      loadData();
    }
    catch(err: any){
      addNotification('error', err.message || 'Failed to delete records');
    }
    finally{
      setDeleting(false);
    }
  };

  if(authLoading || !user) 
    return <div style={{padding:40}}><Spinner /></div>;

  return (
    <AppShell>
      <div className="aws-content-area">
        <div className="aws-breadcrumb">Route 53 &gt; Hosted zones &gt; {zone?.name || 'Loading...'}</div>
        
        {zone && (
          <div className="aws-page-header" style={{ marginTop: 16, marginBottom: 20, flexDirection: 'column', alignItems: 'flex-start', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 600 }}>{zone.name}</h1>
              <div style={{ color: '#5f6b7a', fontSize: 14, marginTop: 4 }}>ID: {zone.id}</div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <span className={zone.private_zone ? 'aws-badge-private' : 'aws-badge-public'}>{zone.private_zone ? 'Private' : 'Public'}</span>
              <span style={{ fontSize: 14, color: '#5f6b7a' }}>{zone.record_count || 0} Records</span>
            </div>
          </div>
        )}

        <div style={{ borderBottom: '2px solid #eaeded', marginBottom: 20 }}>
          <div style={{ display: 'inline-block', padding: '12px 16px', borderBottom: '2px solid #0972d3', color: '#0972d3', fontWeight: 600, marginBottom: '-2px' }}>Records</div>
        </div>

        <div className="aws-table-container">
          <div style={{ padding: 16, borderBottom: '1px solid #eaeded', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="text" placeholder="Search records" value={search} onChange={e => setSearch(e.target.value)} className="aws-input" style={{ width: 200 }} />
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="aws-select" style={{ width: 120 }}>
                <option value="">All types</option>
                {RECORD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button disabled={selected.length === 0} onClick={() => setDeleteModal(true)}>Delete</Button>
              <Button variant="primary" onClick={() => router.push(`/hosted-zones/${zoneId}/records/create`)}>Create record</Button>
            </div>
          </div>
          
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}><Spinner /></div>
          ) : records.length === 0 ? (
            <EmptyState title="No records found" subtitle="There are no records matching your criteria." />
          ) : (
            <>
              <table className="aws-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}><input type="checkbox" onChange={e => setSelected(e.target.checked ? records.map(r => r.id) : [])} checked={selected.length === records.length && records.length > 0} /></th>
                    <th>Record name</th>
                    <th>Type</th>
                    <th>Routing policy</th>
                    <th>Value</th>
                    <th>TTL</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(record => (
                    <tr key={record.id} className={selected.includes(record.id) ? 'selected' : ''}>
                      <td><input type="checkbox" checked={selected.includes(record.id)} onChange={e => {
                        if(e.target.checked) setSelected([...selected, record.id]);
                        else setSelected(selected.filter(id => id !== record.id));
                      }} /></td>
                      <td><Link href={`/hosted-zones/${zoneId}/records/${record.id}/edit`} style={{color:'#0972d3',textDecoration:'none'}}>{record.name}</Link></td>
                      <td><span className="aws-badge-record">{record.type}</span></td>
                      <td>Simple</td>
                      <td><div style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{record.value}</div></td>
                      <td>{record.ttl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination page={page} totalPages={Math.ceil(total/pageSize)} total={total} pageSize={pageSize} onPage={setPage} />
            </>
          )}
        </div>
      </div>
      
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete records" footer={<>
        <Button onClick={() => setDeleteModal(false)}>Cancel</Button>
        <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
      </>}>
        <p>Are you sure you want to delete {selected.length} record(s)?</p>
      </Modal>
    </AppShell>
  );
}
