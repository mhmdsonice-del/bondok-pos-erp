const it = [
  {name:'شاورما فراخ',wh:'الرئيسي',qty:100,ro:20},{name:'شاورما لحمة',wh:'الرئيسي',qty:80,ro:15},
  {name:'بيبسي',wh:'الرئيسي',qty:200,ro:50},{name:'كنافة',wh:'الرئيسي',qty:40,ro:12},{name:'بطاطس مقلية',wh:'الرئيسي',qty:12,ro:30},
];
export default function InventoryPage() {
  return (
    <div className="view-enter">
      <div className="sh"><h3>🏬 المخزون</h3><button className="btn btn-pr btn-sm"><i className="fa fa-plus"/> جرد</button></div>
      <div className="grid g3" style={{marginBottom:16}}>
        <div className="card stat"><div className="si b-g c-g"><i className="fa fa-boxes"/></div><div className="slbl">الأصناف</div><div className="sval">10</div></div>
        <div className="card stat"><div className="si b-r c-r"><i className="fa fa-triangle-exclamation"/></div><div className="slbl">تحت الحد</div><div className="sval">5</div></div>
        <div className="card stat"><div className="si b-b c-b"><i className="fa fa-money-bill"/></div><div className="slbl">قيمة المخزون</div><div className="sval">48,320</div></div>
      </div>
      <div className="tw"><table><thead><tr><th>المنتج</th><th>المخزن</th><th>الكمية</th><th>حد إعادة</th><th>الحالة</th></tr></thead><tbody>{it.map(x=>{const low=x.qty<=x.ro;return <tr key={x.name}><td>{x.name}</td><td>{x.wh}</td><td>{x.qty}</td><td>{x.ro}</td><td><span className={`badge ${low?'bg-r':'bg-g'}`}>{low?'منخفض':'متوفر'}</span></td></tr>})}</tbody></table></div>
    </div>
  );
}
