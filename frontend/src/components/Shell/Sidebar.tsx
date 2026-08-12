interface NavItem { id: string; label: string; icon: string; section: string; }

const navItems: NavItem[] = [
  { id:'dashboard', label:'لوحة القيادة', icon:'fa-th-large', section:'رئيسي' },
  { id:'orders', label:'الطلبات', icon:'fa-receipt', section:'نقطة البيع' },
  { id:'products', label:'المنتجات', icon:'fa-box', section:'نقطة البيع' },
  { id:'customers', label:'العملاء', icon:'fa-users', section:'نقطة البيع' },
  { id:'inventory', label:'المخزون', icon:'fa-warehouse', section:'العمليات' },
  { id:'suppliers', label:'الموردين', icon:'fa-truck', section:'العمليات' },
  { id:'expenses', label:'المصروفات', icon:'fa-money-bill-wave', section:'العمليات' },
  { id:'tasks', label:'المهام', icon:'fa-tasks', section:'العمليات' },
  { id:'haccp', label:'HACCP الجودة', icon:'fa-shield-check', section:'الجودة' },
  { id:'workflow', label:'سير العمل', icon:'fa-diagram-project', section:'الجودة' },
  { id:'assets', label:'صيانة الأصول', icon:'fa-screwdriver-wrench', section:'الجودة' },
  { id:'employees', label:'الموظفين', icon:'fa-user-tie', section:'الموارد البشرية' },
  { id:'attendance', label:'الحضور', icon:'fa-clock', section:'الموارد البشرية' },
  { id:'payroll', label:'الرواتب', icon:'fa-file-invoice-dollar', section:'الموارد البشرية' },
  { id:'reports', label:'التقارير', icon:'fa-chart-bar', section:'تقارير' },
  { id:'settings', label:'الإعدادات', icon:'fa-cog', section:'النظام' },
];

interface Props { active: string; onNavigate: (id: string) => void; mini: boolean; onToggle: () => void; }

export default function Sidebar({ active, onNavigate, mini, onToggle }: Props) {
  const sections = [...new Set(navItems.map(i => i.section))];
  return (
    <aside className={`sidebar ${mini ? 'mini' : ''}`}>
      <div className="sbh">
        <div className="sbt"><div className="n">BONDOK ERP</div><div className="s">Pro V8.0</div></div>
        <button className="sbtog" onClick={onToggle}><i className={`fa ${mini?'fa-angles-right':'fa-angles-left'}`} /></button>
      </div>
      <nav className="nav">
        {sections.map(sec => (
          <div key={sec}>
            <div className="nlbl">{sec}</div>
            {navItems.filter(i => i.section === sec).map(item => (
              <button key={item.id} className={`ni ${active===item.id?'active':''}`} onClick={() => onNavigate(item.id)}>
                <i className={`fa ${item.icon}`} /><span>{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="sbfoot">
        <div className="sbav">م</div>
        <div className="sbui"><div className="un">محمد بندق</div><div className="ur">SUPER ADMIN</div></div>
      </div>
    </aside>
  );
}
