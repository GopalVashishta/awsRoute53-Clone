interface Props {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
}

export function Pagination({ page, totalPages, total, pageSize, onPage }: Props) {
  if (total === 0) return null;
  const start = Math.min((page - 1) * pageSize + 1, total);
  const end = Math.min(page * pageSize, total);

  const pages = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) pages.push(i);

  return (
    <div className="aws-pagination-wrapper">
      <span className="aws-pagination-info">Showing {start}–{end} of {total}</span>
      <div className="aws-pagination">
        <button className="aws-page-btn" onClick={() => onPage(page - 1)} disabled={page <= 1}>‹</button>
        {pages[0] > 1 && <><button className="aws-page-btn" onClick={() => onPage(1)}>1</button><span style={{padding:'0 4px'}}>…</span></>}
        {pages.map(p => (
          <button key={p} className={`aws-page-btn${p === page ? ' active' : ''}`} onClick={() => onPage(p)}>{p}</button>
        ))}
        {pages[pages.length - 1] < totalPages && <><span style={{padding:'0 4px'}}>…</span><button className="aws-page-btn" onClick={() => onPage(totalPages)}>{totalPages}</button></>}
        <button className="aws-page-btn" onClick={() => onPage(page + 1)} disabled={page >= totalPages}>›</button>
      </div>
    </div>
  );
}
