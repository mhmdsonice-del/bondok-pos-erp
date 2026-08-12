import { useState } from 'react';

const INIT = [
  {id:'t1',title:'فحص جودة المطبخ',status:'todo',pri:'high',assignee:'أحمد'},
  {id:'t2',title:'تحديث قائمة الأسعار',status:'inprogress',pri:'medium',assignee:'سارة'},
  {id:'t3',title:'جرد المخزون الشهري',status:'done',pri:'high',assignee:'نورا'},
  {id:'t4',title:'صيانة الثلاجة رقم 2',status:'todo',pri:'urgent',assignee:'خالد'},
  {id:'t5',title:'مراجعة تقارير المبيعات',status:'review',pri:'medium',assignee:'محمد'},
];

const COLS = [
  {key:'todo',label:'قيد الانتظار',color:'#4a5270'},
  {key:'inprogress',label:'قيد التنفيذ',color:'#3b82f6'},
  {key:'review',label:'مراجعة',color:'#f5a623'},
  {key:'done',label:'مكتمل',color:'#22c55e'},
];

export default function TasksPage() {
  const [tasks] = useState(INIT);
  const [tab, setTab] = useState('board');

  return (
    <div className="view-enter">
      <div className="sh"><h3>📋 إدارة المهام</h3><button className="btn btn-pr btn-sm"><i className="fa fa-plus"/> مهمة جديدة</button></div>
      <div className="tabs">
        <button className={`tab ${tab==='board'?'active':''}`} onClick={()=>setTab('board')}><i className="fa fa-columns"/> كانبان</button>
        <button className={`tab ${tab==='list'?'active':''}`} onClick={()=>setTab('list')}><i className="fa fa-list"/> قائمة</button>
      </div>
      {tab==='board' ? (
        <div className="kanban-board">
          {COLS.map(col => (
            <div key={col.key} className="kanban-col">
              <div className="sh" style={{marginBottom:8}}><h3 style={{color:col.color}}>{col.label}</h3><span className="badge bg-gr">{tasks.filter(t=>t.status===col.key).length}</span></div>
              {tasks.filter(t=>t.status===col.key).map(t => (
                <div key={t.id} className="card" style={{padding:12,marginBottom:8,cursor:'grab'}}>
                  <div className="slbl" style={{marginBottom:4}}>{t.title}</div>
                  <div style={{display:'flex',gap:6}}>
                    <span className={`badge ${t.pri==='urgent'?'bg-r':t.pri==='high'?'bg-o':'bg-gr'}`}>{t.pri==='urgent'?'عاجل':t.pri==='high'?'عالي':'متوسط'}</span>
                    <span className="badge bg-gr"><i className="fa fa-user"/> {t.assignee}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="tw"><table><thead><tr><th>المهمة</th><th>الحالة</th><th>الأولوية</th><th>المسؤول</th></tr></thead><tbody>
          {tasks.map(t=><tr key={t.id}><td>{t.title}</td><td><span className="badge bg-gr">{COLS.find(c=>c.key===t.status)?.label}</span></td><td><span className={`badge ${t.pri==='urgent'?'bg-r':t.pri==='high'?'bg-o':'bg-gr'}`}>{t.pri}</span></td><td>{t.assignee}</td></tr>)}
        </tbody></table></div>
      )}
    </div>
  );
}
