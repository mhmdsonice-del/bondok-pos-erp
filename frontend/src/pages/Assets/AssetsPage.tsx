export default function AssetsPage() {
  const assets = [
    {id:1,name:'ثلاجة العرض رقم 1',type:'تبريد',branch:'الرئيسي',lastMaint:'2026-07-15',status:'ok'},
    {id:2,name:'فرن البيتزا',type:'معدات طبخ',branch:'الرئيسي',lastMaint:'2026-08-01',status:'due'},
    {id:3,name:'ماكينة القهوة',type:'مشروبات',branch:'مدينة نصر',lastMaint:'2026-06-20',status:'overdue'},
    {id:4,name:'غسالة الأطباق',type:'تنظيف',branch:'الرئيسي',lastMaint:'2026-08-05',status:'ok'},
  ];
  return (
    <div className="view-enter">
      <div className="sh"><h3>🔧 صيانة الأصول</h3><button className="btn btn-pr btn-sm"><i className="fa fa-plus"/> أصل جديد</button></div>
      <div className="tw"><table><thead><tr><th>الأصل</th><th>النوع</th><th>الفرع</th><th>آخر صيانة</th><th>الحالة</th></tr></thead><tbody>
        {assets.map(a=><tr key={a.id}><td>{a.name}</td><td>{a.type}</td><td>{a.branch}</td><td>{a.lastMaint}</td><td><span className={`badge ${a.status==='ok'?'bg-g':a.status==='due'?'bg-o':'bg-r'}`}>{a.status==='ok'?'سليم':a.status==='due'?'مستحق':'متأخر'}</span></td></tr>)}
      </tbody></table></div>
    </div>
  );
}
