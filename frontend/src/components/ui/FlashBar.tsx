'use client';
import { useNotification } from '@/contexts/NotificationContext';

export function FlashBar() {
  const { notifications, removeNotification } = useNotification();
  if(!notifications.length) return null;
  return (
    <div className="aws-flashbar">
      {notifications.map(n => (
        <div key={n.id} className={`aws-flashbar-item aws-flashbar-${n.type}`}>
          <span style={{flex:1}}>{n.message}</span>
          <button onClick={() => removeNotification(n.id)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'16px'}}>×</button>
        </div>
      ))}
    </div>
  );
}
