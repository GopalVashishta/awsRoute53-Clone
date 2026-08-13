'use client';
import React from 'react';
type Variant = 'primary' | 'normal' | 'danger' | 'link';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant; loading?: boolean; size?: 'sm' | 'md';
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: { backgroundColor: 'var(--color-primary)', color: '#ffffff', border: '1px solid var(--color-primary-hover)' },
  normal: { backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' },
  danger: { backgroundColor: 'var(--color-danger)', color: '#ffffff', border: '1px solid var(--color-danger)' },
  link: { backgroundColor: 'transparent', color: 'var(--color-primary)', border: 'none', padding: '0', textDecoration: 'underline' },
};

export function Button({ variant='normal', loading, size='md', children, style, disabled, ...props }: Props) {
  const base: React.CSSProperties = { padding:size==='sm'?'4px 12px':'6px 16px', borderRadius:2, cursor:disabled||loading?'not-allowed':'pointer', fontSize:14, fontWeight:400, display:'inline-flex', alignItems:'center', gap:6, opacity:disabled||loading?0.7:1, transition:'all 0.15s', ...variantStyles[variant], ...style };
  return <button style={base} disabled={disabled||loading} {...props}>{loading && <span style={{width:14,height:14,border:'2px solid currentColor',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block',animation:'spin 0.6s linear infinite'}} />}{children}</button>;
}
