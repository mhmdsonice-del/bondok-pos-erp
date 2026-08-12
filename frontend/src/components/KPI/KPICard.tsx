interface Props { title: string; value: string|number; sub?: string; icon: string; color: 'red'|'green'|'gold'|'blue'|'purple'; pct?: number; trend?: 'up'|'down'; }

export default function KPICard({ title, value, sub, icon, color, pct, trend }: Props) {
  return (
    <div className="card stat">
      <div className={`si b-${color} c-${color}`}><i className={`fa ${icon}`} /></div>
      <div className="slbl">{title}</div>
      <div className="sval">{value}</div>
      {pct !== undefined && <div className={`ssub ${trend==='up'?'c-g':'c-r'}`}><i className={`fa fa-arrow-${trend==='up'?'up':'down'}`}/> {pct}% {sub}</div>}
      {pct === undefined && sub && <div className="ssub">{sub}</div>}
    </div>
  );
}
