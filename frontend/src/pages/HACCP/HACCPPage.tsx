import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface C { id:string; checkPoint:string; targetValue?:string; frequency?:string; status:string; }

export default function HACCPPage() {
  const [checks, setChecks] = useState<C[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => { try { const r = await api<any>('/haccp'); setChecks(r.items || []); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const add = async () => {
    const checkPoint = prompt('نقطة الفحص:');
    if (!checkPoint) return;
    const targetValue = prompt('الحد المستهدف (اختياري):') || undefined;
    const frequency = prompt('التكرار (اختياري):') || undefined;
    try { await api('/haccp', { method:'POST', body: JSON.stringify({ checkPoint, targetValue, frequency, status:'pass' }) }); load(); } catch {}
  };

  if (loading) return <div className="view-enter"><div className="skel skel-card"/></div>;

  return (
    <div className="view-enter">
      <div className="sh"><h3>🛡️ HACCP — نقاط التحكم الحرجة</h3><button className="btn btn-pr btn-sm" onClick={add}><i className="fa fa-plus"/> فحص جديد</button></div>
      <div className="tw"><table><thead><tr><th>نقطة الفحص</th><th>الحد المستهدف</th><th>التكرار</th><th>الحالة</th></tr></thead><tbody>
        {checks.length === 0 ? <tr><td colSpan={4} style={{textAlign:'center',padding:30,color:'var(--text3)'}}>لا توجد فحوصات بعد</td></tr> :
        checks.map(c=><tr key={c.id}><td>{c.checkPoint}</td><td><span className="chip">{c.targetValue||'-'}</span></td><td>{c.frequency||'-'}</td><td><span className={`badge ${c.status==='pass'?'bg-g':'bg-r'}`}>{c.status==='pass'?'مطابق ✓':'غير مطابق ✗'}</span></td></tr>)}
      </tbody></table></div>
    </div>
  );
}
