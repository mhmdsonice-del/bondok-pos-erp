export default function PayslipPage() {
  const s = { emp:'محمد بندق', code:'EMP-001', dept:'الإدارة', branch:'الرئيسي', month:'يوليو 2026', salary:15000, bonus:500, insurance:1500, tax:1250 };
  const gross = s.salary + s.bonus; const net = gross - s.insurance - s.tax;
  return (
    <div className="view-enter">
      <div className="sh"><h3>💰 كشف المرتب</h3><div><button className="btn btn-pr btn-sm"><i className="fa fa-print"/> طباعة</button></div></div>
      <div style={{background:'#fff',color:'#111',padding:28,borderRadius:12,maxWidth:640,margin:'0 auto',direction:'rtl'}}>
        <div style={{display:'flex',justifyContent:'space-between',borderBottom:'2px solid #c8102e',paddingBottom:14,marginBottom:18}}>
          <h2 style={{fontFamily:'Cairo',fontWeight:900,fontSize:22,color:'#c8102e'}}>BONDOK ERP</h2>
          <div style={{fontWeight:800}}>كشف راتب — {s.month}</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',fontSize:13,marginBottom:16,background:'#f6f6f6',padding:12,borderRadius:8}}>
          <div><b style={{color:'#c8102e'}}>الموظف:</b> {s.emp}</div><div><b style={{color:'#c8102e'}}>الكود:</b> {s.code}</div>
          <div><b style={{color:'#c8102e'}}>الفرع:</b> {s.branch}</div><div><b style={{color:'#c8102e'}}>القسم:</b> {s.dept}</div>
        </div>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead><tr><th style={{background:'#c8102e',color:'#fff',padding:'8px 10px',textAlign:'right'}}>البيان</th><th style={{background:'#c8102e',color:'#fff',padding:'8px 10px'}}>القيمة</th></tr></thead>
          <tbody>
            <tr><td style={{padding:'7px 10px',borderBottom:'1px solid #eee'}}>الراتب الأساسي</td><td style={{padding:'7px 10px',textAlign:'center'}}>{s.salary} ج.م</td></tr>
            <tr><td style={{padding:'7px 10px',borderBottom:'1px solid #eee'}}>مكافأة</td><td style={{padding:'7px 10px',textAlign:'center',color:'#0a8f3f'}}>+{s.bonus} ج.م</td></tr>
            <tr><td style={{padding:'7px 10px',borderBottom:'1px solid #eee',fontWeight:700}}>إجمالي المستحق</td><td style={{padding:'7px 10px',textAlign:'center',fontWeight:700}}>{gross} ج.م</td></tr>
            <tr><td style={{padding:'7px 10px',borderBottom:'1px solid #eee'}}>التأمينات</td><td style={{padding:'7px 10px',textAlign:'center',color:'#c8102e'}}>-{s.insurance} ج.م</td></tr>
            <tr><td style={{padding:'7px 10px',borderBottom:'1px solid #eee'}}>الضريبة</td><td style={{padding:'7px 10px',textAlign:'center',color:'#c8102e'}}>-{s.tax} ج.م</td></tr>
            <tr><td style={{padding:'7px 10px',background:'#111',color:'#fff',fontWeight:800}}>صافي الراتب</td><td style={{padding:'7px 10px',background:'#111',color:'#fff',textAlign:'center',fontWeight:800,fontSize:15}}>{net} ج.م</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
