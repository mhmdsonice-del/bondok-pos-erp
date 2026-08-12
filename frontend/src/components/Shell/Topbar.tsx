import { useState } from 'react';

interface Props { pageTitle: string; pageSub: string; onCmdK: () => void; }

export default function Topbar({ pageTitle, pageSub, onCmdK }: Props) {
  const [dark, setDark] = useState(() => document.documentElement.getAttribute('data-theme') !== 'light');
  const toggleTheme = () => {
    document.documentElement.setAttribute('data-theme', dark ? 'light' : 'dark');
    setDark(!dark);
  };
  return (
    <header className="topbar glass">
      <div className="pi"><div className="pt">{pageTitle}</div><div className="ps">{pageSub}</div></div>
      <div className="srch" onClick={onCmdK}>
        <i className="fa fa-search" />
        <input placeholder="Ctrl+K للبحث السريع..." readOnly />
      </div>
      <button className="theme-toggle" onClick={toggleTheme} title="تبديل الوضع">
        <i className={`fa ${dark ? 'fa-sun' : 'fa-moon'}`} />
      </button>
      <div className="ib"><i className="fa fa-bell" /><span className="dot" /></div>
    </header>
  );
}
