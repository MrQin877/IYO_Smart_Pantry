export default function Brand({right}){
  return (
    <div className="brand container">
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div className="logo">🥬</div>
        <div className="title">
          <div style={{letterSpacing:".3em",fontSize:12,color:"#44633c"}}>I  S m a r t</div>
          <div style={{letterSpacing:".2em",fontWeight:700}}>P a n t r y</div>
        </div>
      </div>
      <div>{right}</div>
    </div>
  );
}
