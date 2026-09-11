import {
  AlertTriangle, ArrowRight, CalendarDays, ChartNoAxesCombined,
  ChevronRight, CircleAlert, Clock3, FilePlus2, FileWarning, Headphones,
  LifeBuoy, Plus, ShieldAlert, Store, UserPlus,
} from 'lucide-react'
import { PageHeader, StatCard } from '../components/UI'
import { adminActivity, adminDashboardFixture, type AdminActivityIcon } from '../data/adminDashboardData'
import { buildAdminBusinessView, formatAdminBusinessINR } from '../data/adminBusinessData'
import { franchisees } from '../data/mockData'
import type { Application, AppStatus } from '../types'

interface Props {
  apps: Application[]
  onNavigate: (page: string, filter?: string) => void
  onToast: (message: string) => void
}

type Severity = 'critical' | 'attention' | 'warning'
interface AttentionItem { severity:Severity; label:string; detail:string; target:string; filter?:string }

const statusColours: Record<string,string> = {
  'In Progress':'#315efb', 'Action Required':'#e69a2e', Delayed:'#e05252',
  Escalated:'#9f3f63', Completed:'#1b9c6c',
}
const activityIcons: Record<AdminActivityIcon, typeof FileWarning> = {
  application:FileWarning, customer:UserPlus, support:LifeBuoy, created:FilePlus2,
}

export function AdminDashboard({apps,onNavigate,onToast}:Props) {
  const countStatus = (status:AppStatus) => apps.filter(app=>app.status===status).length
  const openApplications = apps.filter(app=>!['Completed','Rejected'].includes(app.status))
  const active = openApplications.length
  const pending = apps.filter(app=>app.pendingAction!=='None').length
  const delayed = countStatus('Delayed')
  const escalated = countStatus('Escalated')
  const unassigned = apps.filter(app=>app.assignedTo==='Unassigned'&&!['Completed','Rejected'].includes(app.status)).length
  const beyondSla = apps.filter(app=>app.ageing>10&&!['Completed','Rejected'].includes(app.status)).length
  const needsAttention = franchisees.filter(item=>item.pending>=6)
  const oldestOpen = Math.max(0,...openApplications.map(app=>app.ageing))
  const todayBusiness = buildAdminBusinessView(apps,franchisees,'Today')
  const monthBusiness = buildAdminBusinessView(apps,franchisees,'This Month')
  const topProduct = monthBusiness.products[0]
  const topFranchisee = monthBusiness.franchisees[0]
  const navigate = (page:string,filter?:string) => onNavigate(page,filter)
  const startApplication = () => {
    sessionStorage.setItem('troth-franchisee-action','new-application')
    navigate('applications')
  }

  const attentionItems: AttentionItem[] = [
    {severity:'critical',label:`${beyondSla} cases beyond SLA`,detail:'Open for more than 10 days',target:'applications'},
    {severity:'critical',label:`${escalated} escalated applications`,detail:'Immediate review recommended',target:'applications',filter:'Escalated'},
    {severity:'attention',label:`${needsAttention.length} franchisees need attention`,detail:'High pending case volume',target:'franchisees'},
    {severity:'attention',label:`${adminDashboardFixture.overdueSupport} support tickets overdue`,detail:'Response SLA has elapsed',target:'support'},
    {severity:'warning',label:`${unassigned} applications unassigned`,detail:'Assignment required to progress',target:'applications'},
  ]
  const statusRows = Object.keys(statusColours).map(status=>({status,value:countStatus(status as AppStatus),colour:statusColours[status]}))
  const statusTotal = statusRows.reduce((sum,row)=>sum+row.value,0)
  let statusCursor = 0
  const donutStops = statusRows.flatMap(row=>{
    const start=statusCursor
    statusCursor+=statusTotal?row.value/statusTotal*100:0
    return [`${row.colour} ${start}%`,`${row.colour} ${statusCursor}%`]
  }).join(',')
  const ageingBuckets = [
    {label:'0–2 Days',value:openApplications.filter(app=>app.ageing<=2).length},
    {label:'3–5 Days',value:openApplications.filter(app=>app.ageing>=3&&app.ageing<=5).length},
    {label:'6–10 Days',value:openApplications.filter(app=>app.ageing>=6&&app.ageing<=10).length},
    {label:'10+ Days',value:openApplications.filter(app=>app.ageing>10).length},
  ]

  return <div className="page dashboard-page admin-dashboard">
    <PageHeader eyebrow="ADMIN COMMAND CENTRE" title="Good morning, Aarav" description="Here’s what needs your attention across Troth One today." actions={<button className="date-chip"><CalendarDays size={17}/> 02 Sep 2026</button>}/>
    <section className="admin-business-performance" aria-labelledby="admin-business-title">
      <div className="admin-section-heading"><div><span>BUSINESS PERFORMANCE</span><h2 id="admin-business-title">Business movement at a glance</h2></div><button onClick={()=>navigate('business-details')}>View details <ArrowRight/></button></div>
      <div className="admin-business-performance-grid">
        <BusinessPerformanceCard label="Today's Business" value={formatAdminBusinessINR(todayBusiness.amount)} comparison={`${signed(todayBusiness.growthPercent)} vs yesterday`} context={`${todayBusiness.applications} applications`} onClick={()=>navigate('business-details')}/>
        <BusinessPerformanceCard label="Month-to-Date Business" value={formatAdminBusinessINR(monthBusiness.amount)} comparison={`${signed(monthBusiness.growthPercent)} vs previous month-to-date`} context={`Across ${monthBusiness.products.length} products`} onClick={()=>navigate('business-details')}/>
        <BusinessPerformanceCard label="Top Product" value={topProduct?.product||'—'} comparison={topProduct?formatAdminBusinessINR(topProduct.amount):'No business'} context={topProduct?`${topProduct.contributionPercent.toFixed(1)}% of total business`:'No contribution'} onClick={()=>navigate('business-details')}/>
        <BusinessPerformanceCard label="Top Franchisee" value={topFranchisee?.franchiseeName||'—'} comparison={topFranchisee?formatAdminBusinessINR(topFranchisee.amount):'No business'} context={topFranchisee?`${topFranchisee.contributionPercent.toFixed(1)}% contribution`:'No contribution'} onClick={()=>navigate('business-details')}/>
      </div>
    </section>
    <section className="admin-kpi-grid" aria-label="Daily action summary">
      <StatCard label="Pending Actions" value={pending} meta="Needs follow-up" tone="amber" onClick={()=>navigate('applications')}/>
      <StatCard label="Delayed Cases" value={delayed} meta="Outside expected time" tone="red" onClick={()=>navigate('applications','Delayed')}/>
      <StatCard label="Escalated Cases" value={escalated} meta="Priority intervention" tone="red" onClick={()=>navigate('applications','Escalated')}/>
      <StatCard label="Approvals Pending" value={adminDashboardFixture.approvalsPending} meta="Awaiting admin review" tone="violet" onClick={()=>onToast('Approvals workspace is a prototype action')}/>
      <StatCard label="Support Pending" value={adminDashboardFixture.supportPending} meta="Awaiting response" tone="cyan" onClick={()=>navigate('support')}/>
    </section>

    <div className="quick-strip admin-quick-strip"><span>Quick actions</span>
      <button onClick={()=>navigate('franchisees')}><Plus size={16}/> Add Franchisee</button>
      <button onClick={()=>navigate('customers')}><UserPlus size={16}/> Add Customer</button>
      <button onClick={startApplication}><FilePlus2 size={16}/> New Application</button>
      <button onClick={()=>navigate('applications','Delayed')}><ShieldAlert size={16}/> Review Delayed</button>
      <button onClick={()=>navigate('support')}><Headphones size={16}/> Support Queue</button>
      <button onClick={()=>navigate('reports')}><ChartNoAxesCombined size={16}/> Reports</button>
    </div>

    <section className="admin-primary-grid">
      <article className="panel admin-attention-panel">
        <PanelHeader title="Needs Your Attention" subtitle="Priority items requiring admin intervention"/>
        <div className="admin-attention-list">{attentionItems.map(item=><button key={item.label} onClick={()=>navigate(item.target,item.filter)}>
          <span className={`attention-symbol severity-${item.severity}`}>{item.severity==='critical'?<CircleAlert/>:<AlertTriangle/>}</span>
          <span><b>{item.label}</b><small>{item.detail}</small></span>
          <em className={`severity-label severity-${item.severity}`}>{item.severity}</em><ChevronRight size={17}/>
        </button>)}</div>
        <div className="admin-panel-footer"><button onClick={()=>navigate('applications')}>View all <ArrowRight size={15}/></button></div>
      </article>
      <article className="panel admin-status-panel">
        <PanelHeader title="Application Status" subtitle="Current operational pipeline"/>
        <div className="admin-donut-wrap">
          <div className="donut admin-donut" style={{background:`conic-gradient(${donutStops||'#e7ebf1 0 100%'})`}}><div><strong>{statusTotal}</strong><span>Tracked</span></div></div>
          <div className="admin-status-legend">{statusRows.map(row=><button key={row.status} onClick={()=>navigate('applications',row.status)}><i style={{background:row.colour}}/><span>{row.status}</span><b>{row.value}</b><ChevronRight/></button>)}</div>
        </div>
      </article>
    </section>

    <section className="admin-health-grid">
      <article className="panel"><PanelHeader title="Application Ageing" subtitle="Time open across the portfolio"/>
        <div className="admin-metric-list">{ageingBuckets.map((bucket,index)=><button key={bucket.label} onClick={()=>navigate('applications')}><span>{bucket.label}</span><b className={index===3?'danger-text':''}>{bucket.value}</b><ChevronRight/></button>)}</div>
        <p className="admin-card-note"><Clock3/> Oldest open case: <b>{oldestOpen} days</b></p>
      </article>
      <article className="panel"><PanelHeader title="Franchisee Health" subtitle="Network signals requiring review"/>
        <div className="admin-health-summary">
          <div><b>{franchisees.filter(item=>item.status==='Active').length}</b><span>Active</span></div><div><b>{needsAttention.length}</b><span>Need Attention</span></div>
          <div><b>{adminDashboardFixture.belowTargetFranchisees}</b><span>Below Target</span></div><div><b>{adminDashboardFixture.inactiveBusinessFranchisees}</b><span>No Business 30+ Days</span></div>
        </div>
        <div className="admin-franchisee-list">{needsAttention.slice(0,3).map(item=><button key={item.code} onClick={()=>navigate('franchisees')}><Store/><span><b>{item.name}</b><small>{item.pending} pending cases</small></span><ChevronRight/></button>)}</div>
      </article>
      <article className="panel"><PanelHeader title="Operations Snapshot" subtitle="Platform-level case workload"/>
        <div className="admin-metric-list">{[
          ['Open Cases',active],['Action Required',countStatus('Action Required')],['Unassigned',unassigned],['Delayed',delayed],['Escalated',escalated],
        ].map(([label,value])=><button key={String(label)} onClick={()=>navigate('applications',label==='Open Cases'||label==='Unassigned'?undefined:String(label))}><span>{label}</span><b>{value}</b><ChevronRight/></button>)}</div>
        <div className="admin-panel-footer"><button onClick={()=>navigate('operations')}>View Operations <ArrowRight size={15}/></button></div>
      </article>
    </section>

    <section className="admin-bottom-grid">
      <article className="panel"><PanelHeader title="Today’s Activity" subtitle="Recent platform events"/>
        <div className="admin-activity-list">{adminActivity.map(item=>{const Icon=activityIcons[item.icon];return <div key={`${item.time}-${item.title}`}><time>{item.time}</time><i><Icon/></i><span><b>{item.title}</b><small>{item.detail}</small></span></div>})}</div>
      </article>
    </section>
  </div>
}

function PanelHeader({title,subtitle}:{title:string;subtitle:string}) {
  return <div className="panel-head"><div><b>{title}</b><small>{subtitle}</small></div></div>
}

function BusinessPerformanceCard({label,value,comparison,context,onClick}:{label:string;value:string;comparison:string;context:string;onClick:()=>void}) {
  return <button className="admin-business-performance-card" onClick={onClick}><span>{label}</span><strong>{value}</strong><em>{comparison}</em><small>{context}</small><ArrowRight/></button>
}

function signed(value:number):string { return `${value>=0?'+':''}${value.toFixed(1)}%` }
