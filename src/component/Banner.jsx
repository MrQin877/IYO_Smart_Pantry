export default function Banner({b,onClose}){
  return b ? (
    <div className={`banner ${b.kind==="ok"?"ok":"err"}`} onClick={onClose}>
      {b.msg}
    </div>
  ) : null;
}