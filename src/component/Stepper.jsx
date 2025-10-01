export default function Stepper({value,setValue}){
  return (
    <div className="actions">
      <button className="btn btn-secondary" onClick={()=>setValue(Math.max(1,value-1))}>-</button>
      <span>{value}</span>
      <button className="btn btn-secondary" onClick={()=>setValue(value+1)}>+</button>
    </div>
  );
}