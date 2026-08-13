'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_ACCOUNT } from '@/lib/constants';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export function TopNav() {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark';
    if(saved){
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if(dropdownRef.current && !dropdownRef.current.contains(e.target as Node)){
        setUserDropdownOpen(false);
        setRegionDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const userName = user?.display_name || user?.email || 'Admin User';

  return (
    <>
      <nav className="aws-topnav">
        {/* Left branding */}
        <div className="aws-topnav-left">
          <span className="aws-logo">aws</span>
          <span className="aws-svc-title">Route 53</span>
        </div>

        {/* Right utility icons & menus matching AWS Console */}
        <div className="aws-topnav-right" ref={dropdownRef}>
          {/* CloudShell icon */}
          <button className="aws-nav-icon-btn" title="CloudShell" aria-label="CloudShell">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 3h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm0 1v8h12V4H2zm2 2.5l2.5 2L4 10.5V9l1.5-1L4 7V5.5zm4 4h4v1.5H8V9.5z" />
            </svg>
          </button>

          {/* Notifications bell icon */}
          <button className="aws-nav-icon-btn" title="Notifications" aria-label="Notifications">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a4 4 0 0 0-4 4v3.586l-.707.707A1 1 0 0 0 3 10h10a1 1 0 0 0 .707-1.707L13 8.586V5a4 4 0 0 0-4-4zM6 12a2 2 0 0 0 4 0H6z" />
            </svg>
          </button>

          {/* Help icon -> Opens Shortcuts Modal */}
          <button className="aws-nav-icon-btn" onClick={() => setShortcutsOpen(true)} title="Help & Keyboard Shortcuts" aria-label="Help">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 12.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm1.25-5.25c-.5.4-.75.7-.75 1.25H6.5c0-1.1.5-1.8 1.25-2.25.5-.3.75-.6.75-1a1.25 1.25 0 0 0-2.5 0H4.5a2.75 2.75 0 1 1 5.5 0c0 1.1-.5 1.7-1.25 2z" />
            </svg>
          </button>

          {/* Settings icon */}
          <button className="aws-nav-icon-btn" title="Console Settings" aria-label="Settings">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
            </svg>
          </button>

          {/* Region selector dropdown */}
          <div className="aws-dropdown-wrapper">
            <button
              className="aws-nav-menu-btn"
              onClick={() => setRegionDropdownOpen(!regionDropdownOpen)}
            >
              <span>Global</span>
              <span className="aws-arrow">▼</span>
            </button>
            {regionDropdownOpen && (
              <div className="aws-dropdown-menu">
                <div className="aws-dropdown-header">Region</div>
                <div className="aws-dropdown-item active">Global (Route 53)</div>
                <div className="aws-dropdown-item">{MOCK_ACCOUNT.regionLabel}</div>
              </div>
            )}
          </div>

          {/* User Account Dropdown (matching AWS Console attached screenshot) */}
          <div className="aws-dropdown-wrapper">
            <button
              className="aws-nav-menu-btn aws-user-btn"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            >
              <span>{userName}</span>
              <span className="aws-arrow">▼</span>
            </button>

            {userDropdownOpen && (
              <div className="aws-dropdown-menu aws-user-menu">
                <div className="aws-dropdown-header">Account Information</div>
                <div className="aws-user-info-row">
                  <span className="aws-info-label">Account ID:</span>
                  <span className="aws-info-val">{MOCK_ACCOUNT.accountId}</span>
                </div>
                <div className="aws-user-info-row">
                  <span className="aws-info-label">User:</span>
                  <span className="aws-info-val">{user?.email || 'admin@example.com'}</span>
                </div>

                <div className="aws-dropdown-divider" />

                {/* Dark Mode toggle item inside user dropdown */}
                <button className="aws-dropdown-action" onClick={toggleTheme}>
                  <span>Dark mode</span>
                  <span className="aws-toggle-state">{theme === 'dark' ? 'On' : 'Off'}</span>
                </button>

                {/* Keyboard Shortcuts option */}
                <button className="aws-dropdown-action" onClick={() => { setShortcutsOpen(true); setUserDropdownOpen(false); }}>
                  <span>Keyboard shortcuts</span>
                  <kbd className="aws-kbd-badge">?</kbd>
                </button>

                <div className="aws-dropdown-divider" />

                {/* Sign Out Button INSIDE User Dropdown */}
                <button className="aws-dropdown-action aws-signout-action" onClick={() => { setUserDropdownOpen(false); logout(); }}>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Keyboard Shortcuts Modal */}
      <Modal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
        title="Keyboard Shortcuts"
        footer={<Button onClick={() => setShortcutsOpen(false)}>Close</Button>}
      >
        <div style={{ display: 'grid', gap: 12, fontSize: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 6 }}>
            <span>Go to Hosted Zones</span>
            <kbd style={{ background: 'var(--color-hover)', padding: '2px 6px', borderRadius: 3, border: '1px solid var(--color-border)', fontFamily: 'monospace' }}>g then h</kbd>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 6 }}>
            <span>Create Hosted Zone</span>
            <kbd style={{ background: 'var(--color-hover)', padding: '2px 6px', borderRadius: 3, border: '1px solid var(--color-border)', fontFamily: 'monospace' }}>c</kbd>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 6 }}>
            <span>Toggle Dark / Light Mode</span>
            <kbd style={{ background: 'var(--color-hover)', padding: '2px 6px', borderRadius: 3, border: '1px solid var(--color-border)', fontFamily: 'monospace' }}>d</kbd>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Open Shortcuts Help</span>
            <kbd style={{ background: 'var(--color-hover)', padding: '2px 6px', borderRadius: 3, border: '1px solid var(--color-border)', fontFamily: 'monospace' }}>?</kbd>
          </div>
        </div>
      </Modal>
    </>
  );
}
