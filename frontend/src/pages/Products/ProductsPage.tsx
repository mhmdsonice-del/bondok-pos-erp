const p = [
  {sku:'SHW-001',name:'شاورما فراخ',cat:'ساندويتشات',price:55,stock:100},
  {sku:'SHW-002',name:'شاورما لحمة',cat:'ساندويتشات',price:75,stock:80},
  {sku:'COM-001',name:'وجبة كومبو',cat:'وجبات',price:90,stock:50},
  {sku:'DRK-001',name:'بيبسي',cat:'مشروبات',price:15,stock:200},
  {sku:'DRK-002',name:'مياه معدنية',cat:'مشروبات',price:8,stock:300},
];
export default function ProductsPage() {
  return (<div className="view-enter"><div className="sh"><h3>📦 المنتجات</h3><button className="btn btn-pr btn-sm"><i className="fa fa-plus"/> منتج</button></div><div className="tw"><table><thead><tr><th>SKU</th><th>الاسم</th><th>الفئة</th><th>السعر</th><th>المخزون</th></tr></thead><tbody>{p.map(x=><tr key={x.sku}><td><span className="chip">{x.sku}</span></td><td>{x.name}</td><td>{x.cat}</td><td className="c-g">{x.price} ج.م</td><td><span className={`badge ${x.stock<60?'bg-o':'bg-g'}`}>{x.stock}</span></td></tr>)}</tbody></table></div></div>);
}
