import { useState } from 'react';
import Sidebar from './components/Shell/Sidebar';
import Topbar from './components/Shell/Topbar';
import CommandPalette from './components/Shell/CommandPalette';
import DashboardPage from './pages/Dashboard/DashboardPage';
import TasksPage from './pages/Tasks/TasksPage';
import WorkflowPage from './pages/Workflow/WorkflowPage';
import HACCPPage from './pages/HACCP/HACCPPage';
import AssetsPage from './pages/Assets/AssetsPage';

const PAGES: Record<string, { title: string; sub: string; component: React.FC }> = {
  dashboard: { title:'لوحة القيادة — Command Center', sub:'نظرة شاملة على أداء المؤسسة', component:DashboardPage },
  tasks: { title:'إدارة المهام', sub:'Kanban Board لإدارة سير العمل', component:TasksPage },
  workflow: { title:'بناء سير العمل', sub:'محرر سير العمل البصري', component:WorkflowPage },
  haccp: { title:'HACCP — نقاط التحكم الحرجة', sub:'إدارة جودة وسلامة الغذاء', component:HACCPPage },
  assets: { title:'صيانة الأصول', sub:'إدارة صيانة المعدات والأصول', component:AssetsPage },
};

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [mini, setMini] = useState(false);
  const [cmdK, setCmdK] = useState(false);
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
