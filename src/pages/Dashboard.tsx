import { ArrowRight, CalendarDays, ChevronRight, FileWarning, Headphones, Plus, Upload, UserPlus } from 'lucide-react'
import { formatINR, franchisees, recentActivity } from '../data/mockData'
import type { Application, Role } from '../types'
import { PageHeader, StatCard, StatusBadge } from '../components/UI'
import { CustomerDashboard } from './CustomerDashboard'
import { AdminDashboard } from './AdminDashboard'
import type { CustomerGoal } from '../data/customerGoalsData'

interface Props { role: Role; apps: Application[]; customerGoals:CustomerGoal[]; onNavigate:(page:string,filter?:string)=>void; onToast:(s:string)=>void }

const copy: Record<Role,{eyebrow:string,title:string,desc:string}> = {
  admin:{eyebrow:'PLATFORM OVERVIEW',title:'Good morning, Aarav',desc:'Here’s what is happening across Troth One today.'},
  franchisee:{eyebrow:'PARTNER WORKSPACE',title:'Good morning, Neha',desc:'Focus on today’s follow-ups and keep your applications moving.'},
  rm:{eyebrow:'WEST REGION',title:'Good morning, Rohan',desc:'Your assigned partners, priorities and performance at a glance.'},
  operations:{eyebrow:'INSURANCE OPERATIONS',title:'Your work queue',desc:'Start with delayed cases, then work through actions due today.'},
  customer:{eyebrow:'MY FINANCIAL WORLD',title:'Welcome back, Vivek',desc:'Your products, applications and next actions in one place.'}
}

export function Dashboard({role,apps,customerGoals,onNavigate,onToast}:Props) {
  if (role === 'customer') return <CustomerDashboard apps={apps} goals={customerGoals} onNavigate={onNavigate} onToast={onToast}/>
  if (role === 'admin') return <AdminDashboard apps={apps} onNavigate={onNavigate} onToast={onToast}/>
  const active = apps.filter(a=>!['Completed','Rejected'].includes(a.status)).length
  const delayed = apps.filter(a=>a.status==='Delayed').length
  const pending = apps.filter(a=>a.pendingAction!=='None').length
  const completed = apps.filter(a=>a.status==='Completed').length
  const total = apps.reduce((s,a)=>s+a.amount,0)
  const c = copy[role]
  const stats = role === 'franchisee' ? [
    ['Total Customers','64','+5 this month','navy','customers'],['Active Applications',active,'Across all products','blue','applications'],['Pending Follow-ups','8','3 due today','amber','customers'],['Pending Documents',pending,'Needs customer action','red','applications'],['Business This Month',formatINR(total,true),'↑ 8.2%','green','business']
  ] : role === 'rm' ? [
    ['Assigned Franchisees','3','All active','navy','franchisees'],['Total Business',formatINR(total,true),'This month','green','performance'],['Active Applications',active,'Across your network','blue','applications'],['Pending Cases',pending,'Needs coordination','amber','applications'],['Delayed Cases',delayed,'Escalate if needed','red','applications']
  ] : role === 'operations' ? [
    ['New Cases',apps.filter(a=>a.status==='New').length,'Ready to accept','navy','work-queue'],['Assigned to Me',apps.filter(a=>a.assignedTo==='Priya Nair').length,'Insurance queue','blue','work-queue'],['Action Pending',pending,'Requirements open','amber','work-queue'],['Due Soon','4','Within 24 hours','violet','work-queue'],['Delayed',delayed,'Prioritise now','red','work-queue'],['Completed Today',completed,'Good progress','green','completed']
  ] : [
    ['My Products','4','3 active, 1 maturing','navy','my-products'],['Active Applications',active,'Track progress','blue','applications'],['Pending Actions',pending,'Your response needed','amber','applications'],['Upcoming Renewals','2','Next: 18 Sep','green','my-products']
  ]

  const actions = role === 'operations' ? [['Open Work Queue','work-queue'],['View Delayed Cases','applications'],['Review Documents','documents']] : role === 'rm' ? [['View Franchisee','franchisees'],['View Delayed Cases','applications'],['Add Follow-up','support']] : role === 'franchisee' ? [['Add Customer','customers'],['Add Lead','customers'],['New Application','applications'],['Schedule Meeting','customers']] : [['Add Franchisee','franchisees'],['Review Delayed','applications'],['View Reports','reports']]
  return <div className="page dashboard-page">
    <PageHeader eyebrow={c.eyebrow} title={c.title} description={c.desc} actions={<button className="date-chip"><CalendarDays size={17}/> 02 Sep 2026</button>}/>
    <section className={`stats-grid stats-${stats.length}`}>{stats.map(([label,value,meta,tone,target])=><StatCard key={String(label)} label={String(label)} value={value} meta={String(meta)} tone={String(tone)} onClick={()=>onNavigate(String(target),label==='Delayed Cases'?'Delayed':undefined)}/>)}</section>
    <div className="quick-strip"><span>Quick actions</span>{actions.map(([label,target],i)=><button key={label} onClick={()=>i===0?onNavigate(target):onToast(`${label} opened`)}>{i===0?<Plus size={16}/>:i===1?<UserPlus size={16}/>:i===2?<Upload size={16}/>:<Headphones size={16}/>} {label}</button>)}</div>
    <section className="dashboard-grid">
      <div className="panel span-2">
        <div className="panel-head"><div><b>{role==='operations'?'Priority work queue':'Applications requiring attention'}</b><small>Ordered by urgency and pending action</small></div><button onClick={()=>onNavigate(role==='operations'?'work-queue':'applications')}>View all <ArrowRight size={15}/></button></div>
        <div className="priority-list">{apps.filter(a=>a.status==='Delayed'||a.status==='Action Required'||a.status==='Escalated').slice(0,5).map(app=><button key={app.id} onClick={()=>{sessionStorage.setItem('troth-open-app',app.id);onNavigate('applications')}}>
          <div className={`product-icon product-${app.product.toLowerCase().replaceAll(' ','-')}`}>{app.product.slice(0,2)}</div>
          <div className="priority-main"><b>{app.customer}</b><span>{app.id} • {app.productName}</span></div>
          <div className="provider"><span>{app.provider}</span><small>{app.franchisee}</small></div>
          <StatusBadge status={app.status}/><div className="pending-label"><FileWarning size={15}/>{app.pendingAction}</div><ChevronRight size={17}/>
        </button>)}</div>
      </div>
      <div className="panel">
        <div className="panel-head"><div><b>Application status</b><small>Current open pipeline</small></div></div>
        <div className="donut-wrap"><div className="donut" style={{'--complete':`${Math.max(18,completed/apps.length*100)}%`} as React.CSSProperties}><div><strong>{apps.length}</strong><span>Total</span></div></div>
          <div className="legend">{[['In progress',active,'#315efb'],['Needs action',pending,'#f59e0b'],['Completed',completed,'#1b9c6c'],['Delayed',delayed,'#e05252']].map(x=><div key={String(x[0])}><i style={{background:String(x[2])}}/><span>{x[0]}</span><b>{x[1]}</b></div>)}</div></div>
      </div>
      <div className="panel">
        <div className="panel-head"><div><b>Product-wise business</b><small>September 2026</small></div></div>
        <div className="bar-list">{['Insurance','Loans','Mutual Fund','Loan Protector'].map((p,i)=><div key={p}><p><span>{p}</span><b>{formatINR([12400000,18100000,8700000,4900000][i],true)}</b></p><div><i style={{width:`${[68,88,51,37][i]}%`}}/></div></div>)}</div>
      </div>
      <div className="panel">
        <div className="panel-head"><div><b>{role==='rm'?'Franchisees requiring attention':role==='franchisee'?'Today’s follow-ups':'Recent activity'}</b><small>Latest priorities</small></div></div>
        {role==='rm' ? <div className="rank-list">{franchisees.filter(f=>f.rm==='Rohan Mehta').map((f,i)=><button key={f.code} onClick={()=>onNavigate('franchisees')}><span>{i+1}</span><div><b>{f.name}</b><small>{f.pending} pending cases</small></div><ChevronRight size={16}/></button>)}</div> : <div className="activity-list">{recentActivity.map(([a,b])=><div key={a}><i/><p><b>{a}</b><span>{b}</span></p></div>)}</div>}
      </div>
    </section>
  </div>
}
