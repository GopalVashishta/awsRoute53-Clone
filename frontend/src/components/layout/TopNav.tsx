'use client';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_ACCOUNT } from '@/lib/constants';

const styles = { nav:{display:'flex',alignItems:'center',height:56,backgroundColor:'var(--color-header)',color:'white',padding:'0 16px',position:'fixed' as const,top:0,left:0,right:0,zIndex:200,gap:16}, logo:{fontSize:18,fontWeight:700,color:'#ff9900',letterSpacing:'-0.5px'}, svc:{fontSize:14,fontWeight:600,borderLeft:'1px solid #3d5166',paddingLeft:16,marginLeft:4}, region:{fontSize:13,color:'#aab7b8',marginLeft:'auto'}, acct:{fontSize:13,color:'#d5dbdb'}, btn:{background:'none',border:'1px solid #5f6b7a',color:'white',padding:'4px 12px',borderRadius:2,cursor:'pointer',fontSize:13} };

export function TopNav() {
  const { user, logout } = useAuth();
  return (
    <nav style={styles.nav}>
      <span style={styles.logo}>aws</span>
      <span style={styles.svc}>Route 53</span>
      <span style={styles.region}>{MOCK_ACCOUNT.regionLabel} ▾</span>
      <span style={styles.acct}>{MOCK_ACCOUNT.accountId}</span>
      {user && <span style={styles.acct}>{user.display_name} ▾</span>}
      {user && <button style={styles.btn} onClick={logout}>Sign out</button>}
    </nav>
  );
}
