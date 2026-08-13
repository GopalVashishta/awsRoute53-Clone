import React from 'react';

interface Props { title: string; subtitle?: string; action?: React.ReactNode; }

export function EmptyState({ title, subtitle, action }: Props) {
  return (
    <div className="aws-empty-state">
      <div style={{ color: 'var(--color-text-secondary)', marginBottom: 12 }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{title}</h3>
      {subtitle && <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 16 }}>{subtitle}</p>}
      {action}
    </div>
  );
}
