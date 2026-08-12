import { useState } from 'react';
export default function CalendarPage() {
  const [month, setMonth] = useState(new Date());
  const days = ['أحد','إثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];
  const y = month.getFullYear(), m = month.getMonth();
  const firstDay = new Date(y,m,1).getDay();
  const daysInMonth = new Date(y,m+1,0).getDate();
  const today = new Date().getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)];
  return (
    <div className="view-enter">
      <div className="sh"><h3>📅 التقويم والإجازات</h3><button className="btn btn-pr btn-sm"><i className="fa fa-plus"/> طلب إجازة</button></div>
      <div className="cal-wrap">
        <div className="cal-head"><button className="cal-nav-btn" onClick={()=>setMonth(new Date(y,m-1,1))}><i className="fa fa-chevron-right"/></button><div className="cal-title">{month.toLocaleDateString('ar-EG',{month:'long',year:'numeric'})}</div><button className="cal-nav-btn" onClick={()=>setMonth(new Date(y,m+1,1))}><i className="fa fa-chevron-left"/></button></div>
        <div className="cal-grid">{days.map(d=><div key={d} className="cal-day-name">{d}</div>)}{cells.map((d,i)=><div key={i} className={`cal-day ${!d?'empty':''} ${d===today?'today':''}`}>{d||''}</div>)}</div>
      </div>
      <div className="grid g2" style={{marginTop:16}}>
        <div className="card"><div className="slbl">رصيد الإجازات السنوية</div><div className="sval c-g">25 يوم</div><div className="pbar" style={{marginTop:10}}><span style={{width:'60%',background:'var(--green)'}}/></div><div className="ssub">استخدمت 10 من 25</div></div>
        <div className="card"><div className="slbl">طلبات معلقة</div><div className="sval c-o">3</div><div className="ssub">بانتظار موافقة المدير</div></div>
      </div>
    </div>
  );
}
