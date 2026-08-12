const em = [
  {name:'محمد بندق',code:'EMP-001',role:'SUPER_ADMIN',salary:'15,000'},
  {name:'أحمد مدير',code:'EMP-002',role:'BRANCH_MANAGER',salary:'10,000'},
  {name:'سارة كاشير',code:'EMP-003',role:'CASHIER',salary:'35/ساعة'},
  {name:'خالد محاسب',code:'EMP-004',role:'ACCOUNTANT',salary:'12,000'},
  {name:'نورا مخازن',code:'EMP-005',role:'INVENTORY_CLERK',salary:'30/ساعة'},
];
export default function EmployeesPage() {
  return (<div className="view-enter"><div className="sh"><h3>👔 الموظفون</h3><button className="btn btn-pr btn-sm"><i className="fa fa-plus"/> موظف</button></div><div className="tw"><table><thead><tr><th>الاسم</th><th>الكود</th><th>الدور</th><th>الراتب</th></tr></thead><tbody>{em.map(e=><tr key={e.code}><td>{e.name}</td><td><span className="chip">{e.code}</span></td><td><span className="badge bg-b">{e.role}</span></td><td>{e.salary}</td></tr>)}</tbody></table></div></div>);
}
