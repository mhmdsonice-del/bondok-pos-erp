import { useState, useEffect } from 'react';
import { login, logout } from './lib/api';
import Sidebar from './components/Shell/Sidebar';
import Topbar from './components/Shell/Topbar';
import CommandPalette from './components/Shell/CommandPalette';
import DashboardPage from './pages/Dashboard/DashboardPage';
import TasksPage from './pages/Tasks/TasksPage';
import WorkflowPage from './pages/Workflow/WorkflowPage';
import HACCPPage from './pages/HACCP/HACCPPage';
import AssetsPage from './pages/Assets/AssetsPage';
import PayslipPage from './pages/Payslip/PayslipPage';
import AttendancePage from './pages/Attendance/AttendancePage';
import CalendarPage from './pages/Calendar/CalendarPage';
import ReportsPage from './pages/Reports/ReportsPage';
import SettingsPage from './pages/Settings/SettingsPage';
import ProductsPage from './pages/Products/ProductsPage';
import OrdersPage from './pages/Orders/OrdersPage';
import InventoryPage from './pages/Inventory/InventoryPage';
import CustomersPage from './pages/Customers/CustomersPage';
import SuppliersPage from './pages/Suppliers/SuppliersPage';
import ExpensesPage from './pages/Expenses/ExpensesPage';
import EmployeesPage from './pages/Employees/EmployeesPage';

const PAGES: Record<string, { title: string; sub: string; component: React.FC }> = {
  dashboard: { title:'لوحة القيادة', sub:'Command Center — نظرة شاملة', component:DashboardPage },
  orders: { title:'الطلبات', sub:'إدارة طلبات نقطة البيع', component:OrdersPage },
  products: { title:'المنتجات', sub:'كتالوج المنتجات والأسعار', component:ProductsPage },
  customers: { title:'العملاء', sub:'قاعدة بيانات العملاء', component:CustomersPage },
  inventory: { title:'المخزون', sub:'حركة المخزون والمستودعات', component:InventoryPage },
  suppliers: { title:'الموردين', sub:'إدارة الموردين والتوريد', component:SuppliersPage },
  expenses: { title:'المصروفات', sub:'تسجيل ومراجعة المصروفات', component:ExpensesPage },
  tasks: { title:'المهام', sub:'Kanban Board لسير العمل', component:TasksPage },
  haccp: { title:'HACCP الجودة', sub:'نقاط التحكم الحرجة', component:HACCPPage },
  workflow: { title:'سير العمل', sub:'Workflow Builder', component:WorkflowPage },
  assets: { title:'صيانة الأصول', sub:'إدارة المعدات والصيانة', component:AssetsPage },
  employees: { title:'الموظفون', sub:'قاعدة بيانات الموظفين', component:EmployeesPage },
  attendance: { title:'الحضور', sub:'QR + Geo-fence', component:AttendancePage },
  payroll: { title:'كشف المرتب', sub:'Payslip Generator', component:PayslipPage },
  calendar: { title:'التقويم والإجازات', sub:'إدارة الإجازات', component:CalendarPage },
  reports: { title:'التقارير', sub:'تقارير شاملة', component:ReportsPage },
  settings: { title:'الإعدادات', sub:'إعدادات النظام', component:SettingsPage },
};

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { await login(username, password); onLogin(); } catch { setErr('بيانات الدخول غير صحيحة'); } finally { setBusy(false); }
  };
  return (
    <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'radial-gradient(ellipse at 60% 40%,#1a0a0e,#0f1117 70%)',zIndex:999}}>
      <div style={{background:'var(--surf)',border:'1px solid var(--bord)',borderRadius:22,padding:'44px 40px',width:'100%',maxWidth:420,boxShadow:'0 32px 80px rgba(0,0,0,.6)'}}>
        <div style={{textAlign:'center',marginBottom:24}}><i className="fa fa-utensils" style={{fontSize:64,color:'var(--red)'}}/></div>
        <div style={{fontFamily:'Cairo',fontSize:20,fontWeight:800,textAlign:'center'}}>BONDOK ERP Pro V8.0</div>
        <div style={{fontSize:13,color:'var(--text2)',textAlign:'center',marginBottom:26}}>نظام إدارة سلسلة مطاعم متكاملة</div>
        <form onSubmit={submit}>
          <div className="fg" style={{marginBottom:14}}><label>اسم المستخدم</label><input value={username} onChange={e=>setUsername(e.target.value)} /></div>
          <div className="fg" style={{marginBottom:14}}><label>كلمة المرور</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
          {err && <div style={{color:'var(--red)',fontSize:12,textAlign:'center',marginBottom:12}}>{err}</div>}
          <button className="btn btn-pr" style={{width:'100%',padding:13,fontSize:15}} disabled={busy}>{busy ? 'جاري الدخول...' : 'تسجيل الدخول'}</button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [mini, setMini] = useState(false);
  const [cmdK, setCmdK] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => { if (localStorage.getItem('bondok_token')) setAuthed(true); }, []);

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;
  const pageInfo = PAGES[page] || PAGES.dashboard;
  const PageComponent = pageInfo.component;

  return (
    <div className="shell">
      <Sidebar active={page} onNavigate={setPage} mini={mini} onToggle={()=>setMini(!mini)} />
      <main className="main">
        <Topbar pageTitle={pageInfo.title} pageSub={pageInfo.sub} onCmdK={()=>setCmdK(true)} />
        <div className="content"><PageComponent /></div>
      </main>
      <CommandPalette open={cmdK} onClose={()=>setCmdK(false)} onNavigate={(id)=>{setPage(id);setCmdK(false)}} />
    </div>
  );
}
