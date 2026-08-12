import KPICard from '../../components/KPI/KPICard';

export default function DashboardPage() {
  return (
    <div className="view-enter">
      <div className="grid g4" style={{marginBottom:20}}>
        <KPICard title="إجمالي المبيعات" value="45,280 ج.م" sub="اليوم" icon="fa-chart-line" color="green" pct={12} trend="up" />
        <KPICard title="الطلبات" value="142" sub="مكتمل: 128" icon="fa-receipt" color="blue" pct={5} trend="up" />
        <KPICard title="متوسط الفاتورة" value="318 ج.م" sub="آخر 30 يوم" icon="fa-tag" color="gold" />
        <KPICard title="نسبة الإشغال" value="78%" sub="فرع وسط البلد" icon="fa-chair" color="purple" pct={3} trend="up" />
      </div>
      <div className="sh"><h3>حالة الفروع</h3><button className="btn btn-sm">عرض الكل</button></div>
      <div className="heat-grid">
        {[
          {name:'الفرع الرئيسي',val:'28,450',sub:'+8%',color:'#22c55e'},
          {name:'مدينة نصر',val:'16,830',sub:'+5%',color:'#22c55e'},
          {name:'المهندسين',val:'12,400',sub:'-2%',color:'#c8102e'},
          {name:'المعادي',val:'9,200',sub:'+12%',color:'#22c55e'},
        ].map((b,i)=><div key={i} className="heat-cell" style={{borderColor:b.color+'44',background:b.color+'11'}}><div className="heat-b">{b.name}</div><div className="heat-v">{b.val}</div><div className="heat-s">{b.sub}</div></div>)}
      </div>
      <div className="sh" style={{marginTop:24}}><h3>مهام سريعة</h3></div>
      <div className="grid g3">
        {[
          {icon:'fa-receipt',color:'c-g',lbl:'أمر جديد',bar:72,bc:'var(--green)',sub:'72% من الطاقة'},
          {icon:'fa-boxes',color:'c-b',lbl:'المخزون',bar:45,bc:'var(--blue)',sub:'5 منتجات تحت الحد الأدنى'},
          {icon:'fa-tasks',color:'c-o',lbl:'المهام المعلقة',val:8,sub:'3 منها عاجلة'},
        ].map((m,i)=><div key={i} className="card" style={{textAlign:'center',padding:'28px'}}>
          <i className={`fa ${m.icon} ${m.color}`} style={{fontSize:28,marginBottom:10}} />
          <div className="slbl">{m.lbl}</div>
          {m.bar!==undefined?<div className="pbar" style={{marginTop:10}}><span style={{width:`${m.bar}%`,background:m.bc}} /></div>:<div className="sval" style={{fontSize:20,marginTop:6}}>{m.val}</div>}
          <div className="ssub" style={{marginTop:6}}>{m.sub}</div>
        </div>)}
      </div>
    </div>
  );
}
