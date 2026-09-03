import { ArrowRight, Bell, CalendarClock, CheckCircle2, FileWarning, Plus, TrendingUp, UserPlus, Users } from 'lucide-react'
import type { Application } from '../types'
import type { FranchiseeCustomer, FranchiseeLead, FranchiseeNotification } from '../types/franchisee'
import { franchiseeBusinessSummary } from '../data/franchiseeData'
import { formatINR } from '../data/mockData'
import { PageHeader, StatCard, StatusBadge } from '../components/UI'

interface Props {
  apps:Application[]
  customers:FranchiseeCustomer[]
  leads:FranchiseeLead[]
  notifications:FranchiseeNotification[]
  onNavigate:(page:string,filter?:string)=>void
  onToast:(message:string)=>void
}

export function FranchiseeDashboard({apps,customers,leads,notifications,onNavigate,onToast}:Props){
  const openApps=apps.filter(app=>!['Completed','Rejected'].includes(app.status))
  const pendingApps=apps.filter(app=>app.pendingAction!=='None'&&!['Completed','Rejected'].includes(app.status))
  const openLeads=leads.filter(lead=>!['Converted','Lost / Closed'].includes(lead.stage))
  const converted=leads.filter(lead=>lead.stage==='Converted').length
  const conversionBase=leads.filter(lead=>lead.stage!=='Lost / Closed').length
  const conversion=conversionBase?Math.round(converted/conversionBase*100):0
  const dueFollowUps=leads.filter(lead=>lead.nextFollowUp.startsWith('03 Sep')).slice(0,4)
  const appStatus=['New','In Progress','Action Required','Approved','Completed'].map(status=>({status,count:apps.filter(app=>app.status===status).length}))
  const pipeline=['New Lead','Contacted','Qualified','Requirement Identified','KYC Pending','Application Initiated'].map(stage=>({stage,count:leads.filter(lead=>lead.stage===stage).length}))
  const quickAction=(page:string,action?:string)=>{if(action)sessionStorage.setItem('troth-franchisee-action',action);onNavigate(page)}

  return <div className="page franchisee-dashboard-page">
    <PageHeader eyebrow="PARTNER WORKSPACE" title="Good morning, Neha" description="Focus on today’s customer actions, sales pipeline and applications." actions={<button className="date-chip"><CalendarClock/> 03 Sep 2026</button>}/>
    <section className="stats-grid franchisee-kpi-grid">
      <StatCard label="Customers" value={customers.length} meta={`${customers.filter(customer=>customer.relationshipStatus==='Active').length} active relationships`} onClick={()=>onNavigate('customers')}/>
      <StatCard label="Open Leads" value={openLeads.length} meta={`${dueFollowUps.length} follow-ups due today`} tone="blue" onClick={()=>onNavigate('crm')}/>
      <StatCard label="Active Applications" value={openApps.length} meta="Across your customers" tone="violet" onClick={()=>onNavigate('applications')}/>
      <StatCard label="Conversion" value={`${conversion}%`} meta={`${converted} converted lead`} tone="green" onClick={()=>{sessionStorage.setItem('troth-crm-stage','Converted');onNavigate('crm')}}/>
      <StatCard label="Recorded Revenue" value={formatINR(franchiseeBusinessSummary.recordedRevenue,true)} meta="Mock ledger • September" tone="green" onClick={()=>onNavigate('business')}/>
      <StatCard label="Pending Actions" value={pendingApps.length} meta="Applications need attention" tone="amber" onClick={()=>onNavigate('applications','Action Required')}/>
    </section>

    <div className="quick-strip franchisee-dashboard-actions"><span>Quick actions</span><button onClick={()=>quickAction('customers','add-customer')}><UserPlus/> Add customer</button><button onClick={()=>quickAction('crm','add-lead')}><Plus/> Add lead</button><button onClick={()=>quickAction('applications','new-application')}><FileWarning/> Start application</button><button onClick={()=>onNavigate('crm')}><CalendarClock/> Schedule follow-up</button></div>

    <section className="franchisee-operations-grid">
      <div className="panel franchisee-pending-panel">
        <div className="panel-head"><div><b>Pending actions</b><small>Prioritised application requirements</small></div><button onClick={()=>onNavigate('applications')}>View all <ArrowRight/></button></div>
        <div className="franchisee-action-list">{pendingApps.slice(0,5).map(app=><button key={app.id} onClick={()=>{sessionStorage.setItem('troth-open-app',app.id);onNavigate('applications')}}><span className="list-avatar"><FileWarning/></span><div><b>{app.pendingAction}</b><small>{app.customer} • {app.id}</small></div><StatusBadge status={app.status}/><ArrowRight/></button>)}</div>
      </div>
      <div className="panel">
        <div className="panel-head"><div><b>Today’s follow-ups</b><small>Customers and leads to contact</small></div><button onClick={()=>onNavigate('crm')}>Open CRM</button></div>
        <div className="franchisee-followup-list">{dueFollowUps.map(lead=><button key={lead.id} onClick={()=>onNavigate('crm')}><span>{lead.name.split(' ').map(part=>part[0]).join('')}</span><div><b>{lead.name}</b><small>{lead.interest} • {lead.nextFollowUp}</small></div><i className={`temperature-${lead.temperature.toLowerCase()}`}>{lead.temperature}</i></button>)}</div>
      </div>
      <div className="panel">
        <div className="panel-head"><div><b>Notifications</b><small>Partner and Head Office updates</small></div><button onClick={()=>onToast('All notifications marked as read')}>Mark read</button></div>
        <div className="franchisee-notification-list">{notifications.map(notification=><button key={notification.id} onClick={()=>notification.type==='message'?onNavigate('support'):onToast(notification.title)}><span className={notification.type}>{notification.type==='success'?<CheckCircle2/>:<Bell/>}</span><div><b>{notification.title}</b><small>{notification.description}</small><i>{notification.time}</i></div></button>)}</div>
      </div>
      <div className="panel">
        <div className="panel-head"><div><b>Application status</b><small>Current franchisee pipeline</small></div></div>
        <div className="franchisee-status-bars">{appStatus.map(item=><button key={item.status} onClick={()=>onNavigate('applications',item.status)}><span>{item.status}<b>{item.count}</b></span><i><em style={{width:`${apps.length?Math.max(5,item.count/apps.length*100):0}%`}}/></i></button>)}</div>
      </div>
      <div className="panel">
        <div className="panel-head"><div><b>Lead pipeline</b><small>Progress across active opportunities</small></div><button onClick={()=>onNavigate('crm')}>Manage</button></div>
        <div className="pipeline-summary">{pipeline.map(item=><button key={item.stage} onClick={()=>onNavigate('crm')}><b>{item.count}</b><span>{item.stage}</span></button>)}</div>
      </div>
      <div className="panel franchisee-business-panel">
        <div className="panel-head"><div><b>Business & revenue</b><small>Recorded mock ledger values</small></div><button onClick={()=>onNavigate('business')}>View report</button></div>
        <div className="business-summary-body"><div><span>Revenue recorded</span><b>{formatINR(franchiseeBusinessSummary.recordedRevenue)}</b></div><div><span>Pending earnings</span><b>{formatINR(franchiseeBusinessSummary.pendingEarnings)}</b></div><div><span>Monthly target</span><b>{formatINR(franchiseeBusinessSummary.monthlyTarget)}</b></div></div>
        <div className="target-progress"><span><b>{franchiseeBusinessSummary.targetAchieved}%</b> of target achieved</span><i><em style={{width:`${franchiseeBusinessSummary.targetAchieved}%`}}/></i></div>
      </div>
    </section>
  </div>
}
