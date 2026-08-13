interface Props { title: string; subtitle?: string; action?: React.ReactNode; }

export function EmptyState({ title, subtitle, action }: Props) {
  return (
    <div className="aws-empty-state">
      <div style={{fontSize:48,marginBottom:8}}>🔍</div>
      <h3 style={{fontSize:16,fontWeight:600,marginBottom:4}}>{title}</h3>
      {subtitle && <p style={{fontSize:14,color:'#5f6b7a',marginBottom:16}}>{subtitle}</p>}
      {action}
    </div>
  );
}
