import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface A { id:string; name:string; type:string; status:string; lastMaintenance?:string; }

export default function AssetsPage() {
  const [assets, setAssets] = useState<A[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => { try { const r = await api<any>('/assets'); setAssets(r.items || []); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const add = async () => {
    const name = prompt('اسم الأصل:');
    if (!name) return;
    const type = prompt('النوع (تبريد/معدات/تنظيف...):') || 'عام';
    try { await api('/assets', { method:'POST', body: JSON.stringify({ name, type, status:'ok' }) }); load(); } catch {}
  };

  if (loading) return <div className="view-enter"><div className="skel skel-card"/></div>;

  return (
    <div className="view-enter">
      <div className="sh"><h3>🔧 صيانة الأصول</h3><button className="btn btn-pr btn-sm" onClick={add}><i className="fa fa-plus"/> أصل جديد</button></div>
      <div className="tw"><table><thead><tr><th>الأصل</th><th>النوع</th><th>آخر صيانة</th><th>الحالة</th></tr></thead><tbody>
        {assets.length === 0 ? <tr><td colSpan={4} style={{textAlign:'center',padding:30,color:'var(--text3)'}}>لا توجد أصول بعد</td></tr> :
        assets.map(a=><tr key={a.id}><td>{a.name}</td><td>{a.type}</td><td>{a.lastMaintenance||'-'}</td><td><span className={`badge ${a.status==='ok'?'bg-g':a.status==='due'?'bg-o':'bg-r'}`}>{a.status==='ok'?'سليم':a.status==='due'?'مستحق':'متأخر'}</span></td></tr>)}
      </tbody></table></div>
    </div>
  );
}
