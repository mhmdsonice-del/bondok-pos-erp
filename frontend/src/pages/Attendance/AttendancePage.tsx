export default function AttendancePage() {
  const rows = [
    {e:'أحمد مدير',d:'2026-08-12',in:'09:02',out:'17:05',status:'present'},
    {e:'سارة كاشير',d:'2026-08-12',in:'09:00',out:'17:00',status:'present'},
    {e:'نورا مخازن',d:'2026-08-12',in:'09:15',out:'-',status:'late'},
    {e:'خالد محاسب',d:'2026-08-12',in:'-',out:'-',status:'absent'},
  ];
  const st: Record<string,[string,string]> = { present:['bg-g','حاضر'], late:['bg-o','متأخر'], absent:['bg-r','غائب'] };
  return (
    <div className="view-enter">
      <div className="sh"><h3>🕐 الحضور والانصراف</h3><div style={{display:'flex',gap:8}}><button className="btn btn-sm"><i className="fa fa-qrcode"/> QR</button><button className="btn btn-pr btn-sm"><i className="fa fa-location-dot"/> Geo-fence</button></div></div>
      <div className="card" style={{marginBottom:14,padding:14,background:'var(--green-dim)',color:'var(--green)',border:'1px solid var(--green)'}}><i className="fa fa-circle-check"/> الموقع الحالي داخل نطاق الفرع الرئيسي</div>
      <div className="card" style={{textAlign:'center',padding:22,marginBottom:16}}><i className="fa fa-qrcode" style={{fontSize:48,color:'var(--gold)'}}/><p style={{fontSize:13,marginTop:10}}>امسح QR عند بوابة الفرع لتسجيل الحضور</p></div>
      <div className="tw"><table><thead><tr><th>الموظف</th><th>التاريخ</th><th>حضور</th><th>انصراف</th><th>الحالة</th></tr></thead><tbody>
        {rows.map((r,i)=><tr key={i}><td>{r.e}</td><td>{r.d}</td><td>{r.in}</td><td>{r.out}</td><td><span className={`badge ${st[r.status][0]}`}>{st[r.status][1]}</span></td></tr>)}
      </tbody></table></div>
    </div>
  );
}
