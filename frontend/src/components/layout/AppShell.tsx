import { TopNav } from './TopNav';
import { Sidebar } from './Sidebar';
import { FlashBar } from '@/components/ui/FlashBar';

interface Props { children: React.ReactNode; }

export function AppShell({ children }: Props) {
  return (
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh'}}>
      <TopNav />
      <div style={{display:'flex',flex:1,marginTop:56}}>
        <Sidebar />
        <main style={{flex:1,marginLeft:240,backgroundColor:'var(--color-bg)',minHeight:'calc(100vh - 56px)',overflowY:'auto'}}>
          <FlashBar />
          {children}
        </main>
      </div>
    </div>
  );
}
