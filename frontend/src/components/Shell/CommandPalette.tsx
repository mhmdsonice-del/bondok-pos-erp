import { useState, useEffect, useRef } from 'react';

const commands = [
  { id:'dashboard', label:'لوحة القيادة', icon:'fa-th-large', desc:'Command Center' },
  { id:'tasks', label:'المهام', icon:'fa-tasks', desc:'Kanban Board' },
  { id:'workflow', label:'سير العمل', icon:'fa-diagram-project', desc:'Workflow Builder' },
  { id:'haccp', label:'HACCP الجودة', icon:'fa-shield-check', desc:'Quality Checks' },
  { id:'assets', label:'صيانة الأصول', icon:'fa-screwdriver-wrench', desc:'Asset Maintenance' },
  { id:'payroll', label:'الرواتب', icon:'fa-file-invoice-dollar', desc:'Payroll' },
  { id:'orders', label:'الطلبات', icon:'fa-receipt', desc:'POS Orders' },
  { id:'products', label:'المنتجات', icon:'fa-box', desc:'Product Catalog' },
  { id:'reports', label:'التقارير', icon:'fa-chart-bar', desc:'Reports' },
  { id:'settings', label:'الإعدادات', icon:'fa-cog', desc:'Settings' },
];

interface Props { open: boolean; onClose: () => void; onNavigate: (id: string) => void; }

export default function CommandPalette({ open, onClose, onNavigate }: Props) {
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if(open){setQ('');setIdx(0);setTimeout(()=>ref.current?.focus(),50)} }, [open]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key==='k'&&(e.metaKey||e.ctrlKey)){e.preventDefault();if(open)onClose()}
      if(!open)return;
      if(e.key==='Escape')onClose();
      if(e.key==='ArrowDown'){e.preventDefault();setIdx(i=>Math.min(i+1,filtered.length-1))}
      if(e.key==='ArrowUp'){e.preventDefault();setIdx(i=>Math.max(0,i-1))}
      if(e.key==='Enter'&&filtered[idx]){onNavigate(filtered[idx].id);onClose()}
    };
    window.addEventListener('keydown',h);return ()=>window.removeEventListener('keydown',h);
  },[open,idx]);
  const filtered = q ? commands.filter(c=>c.label.includes(q)||c.desc.toLowerCase().includes(q.toLowerCase())) : commands;
  if(!open)return null;
  return (
    <div className="cp-overlay" onClick={onClose}>
      <div className="cp-box" onClick={e=>e.stopPropagation()}>
        <div className="cp-ib"><i className="fa fa-search" /><input ref={ref} value={q} onChange={e=>{setQ(e.target.value);setIdx(0)}} placeholder="ابحث عن صفحة..." /></div>
        <div className="cp-results">
          {filtered.length===0?<div className="cp-empty">لا توجد نتائج</div>:filtered.map((c,i)=>(<div key={c.id} className={`cp-item ${i===idx?'active':''}`} onClick={()=>{onNavigate(c.id);onClose()}}><div className="cp-ic"><i className={`fa ${c.icon}`} /></div><div><div className="cp-t">{c.label}</div><div className="cp-s">{c.desc}</div></div></div>))}
        </div>
        <div className="cp-foot"><span><i className="fa fa-arrow-up"/><i className="fa fa-arrow-down"/> التنقل</span><span><i className="fa fa-level-down fa-rotate-90"/> اختيار</span><span>ESC إغلاق</span></div>
      </div>
    </div>
  );
}
