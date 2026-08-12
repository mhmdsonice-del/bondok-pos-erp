const r = [
  {n:'المبيعات اليومي',ic:'fa-chart-line',c:'c-g'},{n:'المخزون',ic:'fa-boxes',c:'c-b'},{n:'الرواتب',ic:'fa-file-invoice-dollar',c:'c-o'},
  {n:'المصروفات',ic:'fa-money-bill-wave',c:'c-r'},{n:'الحضور',ic:'fa-clock',c:'c-p'},{n:'الأرباح والخسائر',ic:'fa-scale-balanced',c:'c-g'},
];
export default function ReportsPage() {
  return (<div className="view-enter"><div className="sh"><h3>📊 التقارير</h3></div><div className="grid g3">{r.map((x,i)=><div key={i} className="card" style={{textAlign:'center',padding:28,cursor:'pointer'}}><i className={`fa ${x.ic} ${x.c}`} style={{fontSize:32,marginBottom:12}}/><div className="slbl">{x.n}</div></div>)}</div></div>);
}
