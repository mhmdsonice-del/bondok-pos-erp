import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface Task { id:string; title:string; status:string; priority:string; assigneeId?:string; }
type T = Task;

const COLS = [
  {key:'todo',label:'قيد الانتظار',color:'#4a5270'},
  {key:'inprogress',label:'قيد التنفيذ',color:'#3b82f6'},
  {key:'review',label:'مراجعة',color:'#f5a623'},
  {key:'done',label:'مكتمل',color:'#22c55e'},
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tab, setTab] = useState('board');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { const r = await api<any>('/tasks'); setTasks(r.items || []); }
    catch { /* fallback */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    const title = prompt('عنوان المهمة:');
    if (!title) return;
    try { await api('/tasks', { method: 'POST', body: JSON.stringify({ title, status: 'todo', priority: 'medium' }) }); load(); } catch {}
  };

  const move = async (t: Task) => {
    const next = { todo:'inprogress', inprogress:'review', review:'done', done:'todo' }[t.status] || 'todo';
    try { await api(`/tasks/${t.id}`, { method: 'PATCH', body: JSON.stringify({ status: next }) }); load(); } catch {}
  };

  if (loading) return <div className="view-enter"><div className="skel skel-card" /><div className="skel skel-card" style={{marginTop:12}}/></div>;

  return (
    <div className="view-enter">
      <div className="sh"><h3>📋 إدارة المهام</h3><button className="btn btn-pr btn-sm" onClick={add}><i className="fa fa-plus"/> مهمة جديدة</button></div>
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
                <div key={t.id} className="card" style={{padding:12,marginBottom:8,cursor:'pointer'}} onClick={()=>move(t)}>
                  <div className="slbl" style={{marginBottom:4}}>{t.title}</div>
                  <span className={`badge ${t.priority==='urgent'?'bg-r':t.priority==='high'?'bg-o':'bg-gr'}`}>{t.priority==='urgent'?'عاجل':t.priority==='high'?'عالي':'متوسط'}</span>
                </div>
              ))}
              {tasks.filter(t=>t.status===col.key).length===0 && <div className="empty" style={{padding:20}}><i className="fa fa-inbox"/><p>لا توجد مهام</p></div>}
            </div>
          ))}
        </div>
      ) : (
        <div className="tw"><table><thead><tr><th>المهمة</th><th>الحالة</th><th>الأولوية</th></tr></thead><tbody>
          {tasks.map(t=><tr key={t.id}><td>{t.title}</td><td><span className="badge bg-gr">{COLS.find(c=>c.key===t.status)?.label}</span></td><td><span className={`badge ${t.priority==='urgent'?'bg-r':t.priority==='high'?'bg-o':'bg-gr'}`}>{t.priority}</span></td></tr>)}
        </tbody></table></div>
      )}
    </div>
  );
}
