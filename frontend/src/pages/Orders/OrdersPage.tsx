const o = [
  {no:'#1001',time:'12:30',items:'شاورما فراخ ×2',total:110,status:'done'},
  {no:'#1002',time:'12:42',items:'وجبة كومبو + بيبسي',total:105,status:'done'},
  {no:'#1003',time:'12:55',items:'كنافة + مياه',total:43,status:'preparing'},
  {no:'#1004',time:'13:10',items:'بطاطس ×3',total:75,status:'pending'},
];
const st: Record<string,[string,string]> = { done:['bg-g','مكتمل'], preparing:['bg-o','قيد التحضير'], pending:['bg-r','معلق'] };
export default function OrdersPage() {
  return (<div className="view-enter"><div className="sh"><h3>🧾 الطلبات</h3><button className="btn btn-pr btn-sm"><i className="fa fa-plus"/> أمر جديد</button></div><div className="tw"><table><thead><tr><th>رقم</th><th>الوقت</th><th>المحتويات</th><th>الإجمالي</th><th>الحالة</th></tr></thead><tbody>{o.map(x=><tr key={x.no}><td><span className="chip">{x.no}</span></td><td>{x.time}</td><td>{x.items}</td><td className="c-g">{x.total} ج.م</td><td><span className={`badge ${st[x.status][0]}`}>{st[x.status][1]}</span></td></tr>)}</tbody></table></div></div>);
}
