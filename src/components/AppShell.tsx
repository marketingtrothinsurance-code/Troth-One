import { useState, type ReactNode } from 'react'
import { BadgeCheck, Bell, Boxes, Calculator, ChartNoAxesCombined, Circle, Compass, Contact, FileText, Files, FolderCheck, LayoutDashboard, LifeBuoy, ListChecks, LogOut, Mail, Menu, MessagesSquare, PanelLeftClose, PanelLeftOpen, Search, Settings, Store, UserRound, Users, WalletCards, Workflow } from 'lucide-react'
import { roleConfigs } from '../config/roles'
import type { Role } from '../types'

interface Props { role: Role; page: string; onRoleChange: (r: Role) => void; onNavigate: (p: string) => void; onLogout?:()=>void; children: ReactNode }

export function AppShell({role,page,onRoleChange,onNavigate,onLogout,children}: Props) {
  const [collapsed,setCollapsed] = useState(false)
  const [mobileOpen,setMobileOpen] = useState(false)
  const [notifications,setNotifications] = useState(false)
  const [accountMenu,setAccountMenu] = useState(false)
  const config = roleConfigs[role]
  const iconMap = {BadgeCheck,Bell,Boxes,Calculator,ChartNoAxesCombined,Circle,Compass,Contact,Files,FolderCheck,LayoutDashboard,LifeBuoy,ListChecks,Menu,MessagesSquare,PanelLeftClose,PanelLeftOpen,Search,Settings,Store,UserRound,Users,WalletCards,Workflow}
  const go = (id:string) => { onNavigate(id); setMobileOpen(false); setAccountMenu(false) }
  return <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="brand" onClick={() => go('dashboard')}>
        <div className="brand-mark">T1</div>
        {!collapsed && <div><b>TROTH ONE</b><small>Financial Services</small></div>}
      </div>
      <nav>
        <span className="nav-caption">{!collapsed && 'WORKSPACE'}</span>
        {config.nav.map(item => {
          const Icon = iconMap[item.icon as keyof typeof iconMap] || Circle
          return <button key={item.id} className={page === item.id ? 'active' : ''} onClick={() => go(item.id)} title={item.label}>
            <Icon size={19}/>{!collapsed && <span>{item.label}</span>}
          </button>
        })}
      </nav>
      <div className="sidebar-footer">
        <button className="collapse-btn" onClick={() => setCollapsed(v=>!v)}>{collapsed ? <PanelLeftOpen size={18}/> : <><PanelLeftClose size={18}/><span>Collapse menu</span></>}</button>
      </div>
    </aside>
    {mobileOpen && <button className="scrim" onClick={()=>setMobileOpen(false)} aria-label="Close menu"/>}
    <section className="main-area">
      <header className="topbar">
        <button className="icon-button menu-button" onClick={()=>setMobileOpen(true)}><Menu size={21}/></button>
        <div className="topbar-search"><Search size={18}/><input placeholder="Search applications, customers..."/><kbd>⌘ K</kbd></div>
        <div className="top-actions">
          <div className="role-switcher">
            <span>Viewing as</span>
            <select value={role} onChange={e=>{setAccountMenu(false);setNotifications(false);onRoleChange(e.target.value as Role)}} aria-label="Switch user role">
              {(Object.keys(roleConfigs) as Role[]).map(r=><option key={r} value={r}>{roleConfigs[r].label}</option>)}
            </select>
          </div>
          {role==='customer'&&<button className="icon-button" title="Messages" onClick={()=>onNavigate('support')}><Mail size={19}/></button>}
          <button className="icon-button notification-btn" onClick={()=>{setNotifications(v=>!v);setAccountMenu(false)}}><Bell size={20}/><i/></button>
          {role==='customer'?<button className="user-pill user-menu-trigger" aria-expanded={accountMenu} onClick={()=>{setAccountMenu(value=>!value);setNotifications(false)}}><span>{config.user.split(' ').map(x=>x[0]).join('')}</span><div><b>{config.user}</b><small>{config.designation}</small></div></button>:<div className="user-pill"><span>{config.user.split(' ').map(x=>x[0]).join('')}</span><div><b>{config.user}</b><small>{config.designation}</small></div></div>}
        </div>
        {notifications && <div className="notification-panel">
          <div className="panel-head"><b>Notifications</b><button onClick={()=>setNotifications(false)}>Close</button></div>
          <div className="notice unread"><span className="notice-icon warning">!</span><div><b>5 cases need attention</b><small>Documents are pending or overdue</small></div></div>
          <div className="notice"><span className="notice-icon success">✓</span><div><b>Application approved</b><small>T1-20260062 • 18 min ago</small></div></div>
          <div className="notice"><span className="notice-icon info">i</span><div><b>New support response</b><small>Operations team replied • 1 hr ago</small></div></div>
        </div>}
        {role==='customer'&&accountMenu&&<div className="account-menu"><div className="account-menu-identity"><span>{config.user.split(' ').map(part=>part[0]).join('')}</span><div><b>{config.user}</b><small>{config.designation}</small></div></div><div className="account-menu-links"><button onClick={()=>go('profile')}><UserRound/><span><b>My Profile</b><small>Personal and account information</small></span></button><button onClick={()=>go('documents')}><FileText/><span><b>My Documents</b><small>KYC and uploaded documents</small></span></button></div><button className="account-logout" onClick={()=>{setAccountMenu(false);onLogout?.()}}><LogOut/> Logout</button></div>}
      </header>
      <main>{children}</main>
    </section>
  </div>
}
