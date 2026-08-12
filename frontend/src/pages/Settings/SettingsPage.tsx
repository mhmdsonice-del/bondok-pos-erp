export default function SettingsPage() {
  const ns = ['إشعارات الطلبات','تنبيهات المخزون المنخفض','تذكيرات الصيانة','تقارير يومية'];
  return (
    <div className="view-enter"><div className="sh"><h3>⚙️ الإعدادات</h3></div><div className="grid g2">
      <div className="card"><div className="slbl" style={{marginBottom:12}}>بيانات الشركة</div>
        <div className="fg" style={{marginBottom:10}}><label>اسم الشركة</label><input defaultValue="BONDOK Restaurants Group"/></div>
        <div className="fg" style={{marginBottom:10}}><label>الرقم الضريبي</label><input defaultValue="EG-123456789"/></div>
        <div className="fg" style={{marginBottom:10}}><label>العملة</label><select><option>ج.م — جنيه مصري</option><option>ر.س — ريال سعودي</option></select></div>
        <button className="btn btn-pr btn-sm">حفظ</button>
      </div>
      <div className="card"><div className="slbl" style={{marginBottom:12}}>الإشعارات</div>
        {ns.map((s,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid var(--bord)'}}><span style={{fontSize:13}}>{s}</span><label className="tsw"><input type="checkbox" defaultChecked/><span className="sld"/></label></div>)}
      </div>
    </div></div>
  );
}
