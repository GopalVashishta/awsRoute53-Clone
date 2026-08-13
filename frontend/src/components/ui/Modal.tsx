'use client';
import React from 'react';

interface Props { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode; }

export function Modal({ isOpen, onClose, title, children, footer }: Props) {
  if(!isOpen) return null;
  return (
    <div className="aws-modal-overlay" onClick={onClose}>

      <div className="aws-modal" onClick={e => e.stopPropagation()}>
        <div className="aws-modal-header">
          <h3 style={{fontSize:16,fontWeight:600}}>{title}</h3>

          <button onClick={onClose} 
          style={{background:'none',border:'none',cursor:'pointer',fontSize:20,color:'#5f6b7a'}}>×
          </button>
        </div>

        <div className="aws-modal-body">{children}</div>
        
        {footer && <div className="aws-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
