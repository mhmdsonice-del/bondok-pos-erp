const ex = [
  {d:'2026-08-12',cat:'إيجار',amount:8000,desc:'إيجار الفرع الرئيسي'},
  {d:'2026-08-11',cat:'خامات',amount:3200,desc:'توريد لحوم'},
  {d:'2026-08-10',cat:'صيانة',amount:450,desc:'صيانة ثلاجة'},
  {d:'2026-08-09',cat:'رواتب',amount:12000,desc:'رواتب أغسطس'},
];
export default function ExpensesPage() {
  const total = ex.reduce((s,e)=>s+e.amount,0);
  return (<div className="view-enter"><div className="sh"><h3>💸 المصروفات</h3><button className="btn btn-pr btn-sm"><i className="fa fa-plus"/> مصروف</button></div><div className="card stat" style={{marginBottom:16}}><div className="slbl">إجمالي الشهر</div><div className="sval c-r">{total.toLocaleString()} ج.م</div></div><div className="tw"><table><thead><tr><th>التاريخ</th><th>الفئة</th><th>الوصف</th><th>المبلغ</th></tr></thead><tbody>{ex.map((e,i)=><tr key={i}><td>{e.d}</td><td><span className="badge bg-gr">{e.cat}</span></td><td>{e.desc}</td><td className="c-r">{e.amount.toLocaleString()} ج.م</td></tr>)}</tbody></table></div></div>);
}
