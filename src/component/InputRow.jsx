export default function InputRow({label,type="text",value,setValue,invalid,right}){
  return (
    <label>
      <div className="label">{label}</div>
      <div className="row">
        <input type={type} value={value} onChange={e=>setValue(e.target.value)} />
        {invalid ? <span className="inline-icon">!</span> : right}
      </div>
    </label>
  );
}