interface Props { title: string; }

export function ComingSoon({ title }: Props) {
  return (
    <div className="coming-soon-page">
      <div style={{fontSize:64}}>🚧</div>
      <h2 style={{fontSize:24,fontWeight:600}}>{title}</h2>
      <p style={{color:'#5f6b7a',fontSize:14,textAlign:'center',maxWidth:400}}>This feature is coming soon. The actual AWS Route 53 {title} functionality is beyond the scope of this clone.</p>
    </div>
  );
}
