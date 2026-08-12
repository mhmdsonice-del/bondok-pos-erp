export default function HACCPPage() {
  const checks = [
    {id:1,point:'درجة حرارة التبريد',target:'< 5°C',freq:'كل 4 ساعات',status:'pass'},
    {id:2,point:'درجة حرارة الطهي',target:'> 75°C',freq:'كل وجبة',status:'pass'},
    {id:3,point:'نظافة الأسطح',target:'ممتاز',freq:'كل وردية',status:'fail'},
    {id:4,point:'تخزين المواد الخام',target:'FIFO',freq:'يومياً',status:'pass'},
    {id:5,point:'غسل الأيدي',target:'مطابق',freq:'كل ساعة',status:'pass'},
  ];
  return (
    <div className="view-enter">
      <div className="sh"><h3>🛡️ HACCP — نقاط التحكم الحرجة</h3><button className="btn btn-pr btn-sm"><i className="fa fa-plus"/> فحص جديد</button></div>
      <div className="tw"><table><thead><tr><th>نقطة الفحص</th><th>الحد المستهدف</th><th>التكرار</th><th>الحالة</th><th>إجراء</th></tr></thead><tbody>
        {checks.map(c=><tr key={c.id}><td>{c.point}</td><td><span className="chip">{c.target}</span></td><td>{c.freq}</td><td><span className={`badge ${c.status==='pass'?'bg-g':'bg-r'}`}>{c.status==='pass'?'مطابق ✓':'غير مطابق ✗'}</span></td><td><button className="btn btn-sm"><i className="fa fa-pen"/></button></td></tr>)}
      </tbody></table></div>
    </div>
  );
}
