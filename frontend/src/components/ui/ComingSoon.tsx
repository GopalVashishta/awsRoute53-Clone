interface Props { title: string; }

export function ComingSoon({ title }: Props) {
  return (
    <div className="coming-soon-page">
      <div style={{ color: 'var(--color-text-secondary)', marginBottom: 8 }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.6C.5 7 1 10 3 12c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.4-.4.4-1.1 0-1.5z" />
        </svg>
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 600 }}>{title}</h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, textAlign: 'center', maxWidth: 420, lineHeight: 1.5 }}>
        This section is a placeholder. The AWS Route 53 <strong>{title}</strong> feature is beyond the scope of this clone.
      </p>
    </div>
  );
}
