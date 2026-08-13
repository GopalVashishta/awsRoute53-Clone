'use client';
import { useState, useEffect, use } from 'react';
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

export default function ZoneDetails({ params }: { params: Promise<{ zoneId: string }> | { zoneId: string } }) {
  const resolvedParams = typeof (params as any)?.then === 'function' ? use(params as Promise<{ zoneId: string }>) : (params as { zoneId: string });
  const { zoneId } = resolvedParams;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { notify } = useNotification();
  
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
  const [deleteResult, setDeleteResult] = useState<{ skipped: any[] } | null>(null);

  // Import / Export states
  const [importModal, setImportModal] = useState(false);
  const [importContent, setImportContent] = useState('');
  const [importing, setImporting] = useState(false);

  const [exportModal, setExportModal] = useState(false);

  useEffect(() => {
    if(!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  const loadData = async () => {
    setLoading(true);
    try{
      const zoneData = await apiRequest(`/api/hosted-zones/${zoneId}`);
      setZone(zoneData);
      
      const recordsData: any = await apiRequest(`/api/hosted-zones/${zoneId}/records?search=${encodeURIComponent(search)}&type=${typeFilter}&page=${page}&page_size=${pageSize}`);
      setRecords(recordsData.items || []);
      setTotal(recordsData.total || 0);
    }
    catch(err: any) {
      notify('error', err.message || 'Failed to load data');
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
    setDeleteResult(null);
    try{
      const result: any = await apiRequest(`/api/hosted-zones/${zoneId}/records`, {
        method: 'DELETE',
        body: JSON.stringify({ record_ids: selected }),
      });
      const skipped = result.skipped || [];
      if (result.deleted > 0) {
        notify('success', result.message);
      }
      if (skipped.length > 0) {
        notify('error', `${skipped.length} record(s) could not be deleted (protected NS/SOA records).`);
        setDeleteResult({ skipped });
      } else {
        setDeleteModal(false);
      }
      setSelected([]);
      loadData();
    }
    catch(err: any) {
      notify('error', err.message || 'Failed to delete records');
    }
    finally {
      setDeleting(false);
    }
  };

  // Handle BIND Zone File Import
  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!importContent.trim()) return;

    setImporting(true);
    try{
      const res: any = await apiRequest(`/api/hosted-zones/${zoneId}/import`, {
        method: 'POST',
        body: JSON.stringify({ content: importContent })
      });
      notify('success', `Imported ${res.parsed_count || 0} record(s) successfully!`);
      setImportModal(false);
      setImportContent('');
      loadData();
    }
    catch (err: any) {
      notify('error', err.message || 'Failed to import BIND zone file');
    }
    finally {
      setImporting(false);
    }
  };

  // Handle File Upload for Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImportContent(event.target?.result as string || '');
    };
    reader.readAsText(file);
  };

  // Handle Export Download
  const handleExport = (format: 'bind' | 'json') => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const downloadUrl = `${apiUrl}/api/hosted-zones/${zoneId}/export?format=${format}`;
    window.open(downloadUrl, '_blank');
    setExportModal(false);
    notify('info', `Exporting zone in ${format.toUpperCase()} format...`);
  };

  if(authLoading || !user) 
    return <div style={{padding:40, textAlign: 'center'}}><Spinner /></div>;

  return (
    <AppShell>
      <div className="aws-content-area">
        <div className="aws-breadcrumb">Route 53 &gt; Hosted zones &gt; {zone?.name || 'Loading...'}</div>
        
        {zone && (
          <div className="aws-page-header" style={{ marginTop: 16, marginBottom: 20, flexDirection: 'column', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 600 }}>{zone.name}</h1>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginTop: 4 }}>ID: {zone.id}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button onClick={() => setImportModal(true)}>Import BIND zone</Button>
                <Button onClick={() => setExportModal(true)}>Export zone</Button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <span className={zone.is_private_zone ? 'aws-badge-private' : 'aws-badge-public'}>{zone.is_private_zone ? 'Private' : 'Public'}</span>
              <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{zone.record_set_count ?? zone.record_count ?? 0} Records</span>
            </div>
          </div>
        )}

        <div style={{ borderBottom: '2px solid var(--color-border)', marginBottom: 20 }}>
          <div style={{ display: 'inline-block', padding: '12px 16px', borderBottom: '2px solid var(--color-primary)', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '-2px' }}>Records</div>
        </div>

        <div className="aws-table-container">
          <div style={{ padding: 16, borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="text" placeholder="Search records" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="aws-input" style={{ width: 200 }} />
              <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className="aws-select" style={{ width: 130 }}>
                <option value="">All types</option>
                {RECORD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button disabled={selected.length === 0} onClick={() => { setDeleteResult(null); setDeleteModal(true); }}>Delete</Button>
              <Button variant="primary" onClick={() => router.push(`/hosted-zones/${zoneId}/records/create`)}>Create record</Button>
            </div>
          </div>

          {/* Bulk selection action bar */}
          {selected.length > 0 && (
            <div style={{
              background: '#e8f4fd',
              borderBottom: '1px solid #0972d3',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 14,
            }}>
              <strong>{selected.length}</strong> record(s) selected
              <button
                onClick={() => setSelected([])}
                style={{ background: 'none', border: 'none', color: '#0972d3', cursor: 'pointer', fontSize: 13 }}
              >
                Clear selection
              </button>
            </div>
          )}
          
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}><Spinner /></div>
          ) : records.length === 0 ? (
            <EmptyState title="No records found" subtitle="There are no records matching your search or type filter." />
          ) : (
            <>
              <table className="aws-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}><input type="checkbox"
                      title="Select all"
                      onChange={e => setSelected(e.target.checked ? records.map(r => r.id) : [])}
                      checked={selected.length === records.length && records.length > 0}
                      ref={el => { if(el) el.indeterminate = selected.length > 0 && selected.length < records.length; }}
                    /></th>
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
                      <td><Link href={`/hosted-zones/${zoneId}/records/${record.id}/edit`} style={{color:'var(--color-primary)',textDecoration:'none',fontWeight:500}}>{record.name}</Link></td>
                      <td><span className={`aws-badge aws-badge-${record.type}`}>{record.type}</span></td>
                      <td>{record.routing_policy || 'Simple'}</td>
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
      
      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete records" footer={<>
        <Button onClick={() => setDeleteModal(false)}>Cancel</Button>
        <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
      </>}>
        {deleteResult ? (
          <div>
            <p style={{ marginBottom: 12 }}>The following record(s) could not be deleted (protected NS/SOA records):</p>
            <ul style={{ paddingLeft: 20, fontSize: 14, color: '#d91515' }}>
              {deleteResult.skipped.map((s: any) => (
                <li key={s.id}>{s.id}: {s.reason}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p>Are you sure you want to delete <strong>{selected.length}</strong> record(s)? Default NS and SOA records will be automatically skipped.</p>
        )}
      </Modal>

      {/* BIND Zone Import Modal */}
      <Modal isOpen={importModal} onClose={() => setImportModal(false)} title="Import BIND Zone File" footer={<>
        <Button onClick={() => setImportModal(false)}>Cancel</Button>
        <Button variant="primary" loading={importing} onClick={handleImport} disabled={!importContent.trim()}>Import records</Button>
      </>}>
        <form onSubmit={handleImport}>
          <div className="aws-form-group">
            <label className="aws-label">Upload .zone File</label>
            <input type="file" accept=".zone,.txt,.bind" onChange={handleFileUpload} style={{ marginBottom: 12 }} />
          </div>
          <div className="aws-form-group">
            <label className="aws-label">Or paste BIND Zone Text</label>
            <textarea
              className="aws-textarea"
              rows={8}
              placeholder={`$ORIGIN ${zone?.name || 'example.com.'}\n$TTL 300\n@  IN  A  192.0.2.1\nwww  IN  CNAME  example.com.`}
              value={importContent}
              onChange={e => setImportContent(e.target.value)}
            />
            <div className="aws-form-desc">Supports standard RFC 1035 format (A, AAAA, CNAME, TXT, MX, NS, PTR, SRV, CAA records).</div>
          </div>
        </form>
      </Modal>

      {/* Export Modal */}
      <Modal isOpen={exportModal} onClose={() => setExportModal(false)} title="Export Hosted Zone" footer={<Button onClick={() => setExportModal(false)}>Cancel</Button>}>
        <p style={{ marginBottom: 16 }}>Choose the format you would like to export this hosted zone in:</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Button variant="primary" onClick={() => handleExport('bind')}>Export as BIND Zone (.zone)</Button>
          <Button onClick={() => handleExport('json')}>Export as JSON (.json)</Button>
        </div>
      </Modal>
    </AppShell>
  );
}
