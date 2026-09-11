import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { AlertTriangle, ArrowLeft, Check, ChevronRight, FileText, Search, Send, ShieldCheck, X } from 'lucide-react'
import { rmRepository } from './service'
import { applicationSLA, slaLabel } from './sla'
import type { Priority, RMApplication, RMEscalation, RMIssueAssignee, RMIssueStatus, SLAStatus } from './types'

interface Props { franchiseContext:string; globalSearch:string; onToast:(message:string)=>void }
type Filters={search:string;franchiseId:string;product:string;stage:string;caseStatus:string;sla:string;issue:string;from:string;to:string}
const emptyFilters:Filters={search:'',franchiseId:'all',product:'all',stage:'all',caseStatus:'all',sla:'all',issue:'all',from:'',to:''}
const products=['Insurance','Loans','Loan Protector','Mutual Fund','Demat','Research','Advisory']
const isOpen=(issue:RMEscalation)=>issue.status!=='Closed'
const stamp=()=>new Date().toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})
const franchiseName=(id:string)=>rmRepository.franchises().find(item=>item.id===id)?.name||'Restricted'

function SLA({value}:{value:SLAStatus}){return <span className={`rm-sla ${value}`}><i/>{slaLabel[value]}</span>}
function Chip({children,tone='neutral'}:{children:ReactNode;tone?:string}){return <span className={`rm-chip ${tone}`}>{children}</span>}
function DetailGrid({rows}:{rows:[string,string][]}){return <div className="rm-detail-grid">{rows.map(([label,value])=><div key={label}><small>{label}</small><b>{value}</b></div>)}</div>}
function Notice({children}:{children:ReactNode}){return <div className="rm-notice"><ShieldCheck/>{children}</div>}
function Empty(){return <div className="rm-empty"><Search/><b>No matching applications</b><span>Try changing the search or filters.</span></div>}
function Drawer({title,subtitle,close,children}:{title:string;subtitle:string;close:()=>void;children:ReactNode}){return <><button className="rm-drawer-scrim" onClick={close} aria-label="Close case detail"/><aside className="rm-drawer wide"><header><div><b>{title}</b><small>{subtitle}</small></div><button onClick={close} aria-label="Close"><X/></button></header><div className="rm-drawer-body">{children}</div></aside></>}

export function RMApplicationsPage({franchiseContext,globalSearch,onToast}:Props){
 const [filters,setFilters]=useState<Filters>({...emptyFilters,franchiseId:franchiseContext,search:globalSearch})
 const [selected,setSelected]=useState<string>()
 const [tab,setTab]=useState('Overview')
 const [raisingIssue,setRaisingIssue]=useState(false)
 const [selectedIssue,setSelectedIssue]=useState<string>()
 const [escalations,setEscalations]=useState(rmRepository.escalations())
 useEffect(()=>setFilters(value=>({...value,franchiseId:franchiseContext,search:globalSearch})),[franchiseContext,globalSearch])

 const applications=rmRepository.applications()
 const stages=[...new Set(applications.map(item=>item.stage))]
 const statuses=[...new Set(applications.map(item=>item.status))]
 const inDateRange=(item:RMApplication)=>{const submitted=new Date(item.submitted).getTime();return(!filters.from||submitted>=new Date(`${filters.from}T00:00:00`).getTime())&&(!filters.to||submitted<=new Date(`${filters.to}T23:59:59`).getTime())}
 const contextRows=applications.filter(item=>(filters.franchiseId==='all'||item.franchiseId===filters.franchiseId)&&(filters.product==='all'||item.product===filters.product)&&inDateRange(item)&&`${item.id} ${item.customer} ${franchiseName(item.franchiseId)} ${item.product} ${item.stage} ${item.status}`.toLowerCase().includes(filters.search.toLowerCase()))
 const rows=contextRows.filter(item=>{const issues=escalations.filter(issue=>issue.applicationId===item.id);return(filters.stage==='all'||item.stage===filters.stage)&&(filters.caseStatus==='all'||item.status===filters.caseStatus)&&(filters.sla==='all'||applicationSLA(item,escalations)===filters.sla)&&(filters.issue==='all'||(filters.issue==='open'?issues.some(isOpen):!issues.some(isOpen)))})
 const openIssueCount=contextRows.filter(item=>escalations.some(issue=>issue.applicationId===item.id&&isOpen(issue))).length
 const app=applications.find(item=>item.id===selected)
 const appIssues=app?escalations.filter(item=>item.applicationId===app.id):[]
 const activeIssue=appIssues.find(item=>item.id===selectedIssue)
 const persist=(next:RMEscalation[])=>{setEscalations(next);rmRepository.saveEscalations(next)}

 const raise=(form:{type:string;subject:string;description:string;assignedTo:RMIssueAssignee;priority:Priority})=>{
  if(!app)return
  const createdAt=stamp(),nextNumber=Math.max(1042,...escalations.map(item=>Number(item.id.replace(/\D/g,''))||0))+1
  const created:RMEscalation={id:`ISS-${nextNumber}`,applicationId:app.id,status:'Open',raisedBy:rmRepository.currentRM.name,raisedByRole:'Relationship Manager',raisedAt:createdAt,updatedAt:createdAt,comments:[],activity:[{id:`ACT-${nextNumber}-1`,createdAt,text:`Issue raised by ${rmRepository.currentRM.name}`},{id:`ACT-${nextNumber}-2`,createdAt,text:`Assigned to ${form.assignedTo}`}],...form}
  persist([created,...escalations]);setRaisingIssue(false);setSelectedIssue(created.id);setTab('Issues / Escalations');onToast(`Issue ${created.id} linked to ${app.id}; ${created.assignedTo} notified`)
 }
 const updateIssue=(id:string,status:RMIssueStatus,resolution?:string)=>{
  const updatedAt=stamp(),next=escalations.map(item=>item.id===id?{...item,status,updatedAt,resolution:resolution||item.resolution,resolvedAt:status==='Resolved'?updatedAt:item.resolvedAt,closedAt:status==='Closed'?updatedAt:item.closedAt,activity:[...item.activity,{id:`ACT-${id}-${item.activity.length+1}`,createdAt:updatedAt,text:status==='Closed'?`Issue closed by ${rmRepository.currentRM.name} after fix confirmation`:`Status changed to ${status}`}]}:item)
  persist(next);onToast(status==='Closed'?`${id} closed; the case flag now reflects remaining open issues`:`${id} marked ${status.toLowerCase()}`)
 }
 const addComment=(id:string,text:string)=>{const createdAt=stamp(),next=escalations.map(item=>item.id===id?{...item,updatedAt:createdAt,comments:[...item.comments,{id:`CMT-${id}-${item.comments.length+1}`,author:rmRepository.currentRM.name,role:'Relationship Manager',createdAt,text}],activity:[...item.activity,{id:`ACT-${id}-${item.activity.length+1}`,createdAt,text:`Comment added by ${rmRepository.currentRM.name}`}]}:item);persist(next);onToast(`Comment added to ${id}`)}
 const reset=()=>setFilters({...emptyFilters,franchiseId:franchiseContext,search:globalSearch})

 return <>
  <div className="rm-page-header"><div><small>CORE OPERATIONS</small><h1>Application Tracking</h1><p>Monitor allocated-franchise cases, spot SLA risk and coordinate resolution without changing processing data.</p></div></div>
  <div className="rm-application-summary">
   <SummaryFilter label="Open Issues" value={openIssueCount} tone="red" active={filters.issue==='open'} onClick={()=>setFilters(value=>({...value,issue:'open',sla:'all'}))}/>
  </div>
  <div className="rm-app-filters">
   <label className="search"><Search/><input aria-label="Search applications" value={filters.search} onChange={e=>setFilters({...filters,search:e.target.value})} placeholder="Search case, customer, franchise..."/></label>
   <select aria-label="Filter by franchise" value={filters.franchiseId} onChange={e=>setFilters({...filters,franchiseId:e.target.value})}><option value="all">All franchises</option>{rmRepository.franchises().map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select>
   <select aria-label="Filter by product" value={filters.product} onChange={e=>setFilters({...filters,product:e.target.value})}><option value="all">All products</option>{products.map(item=><option key={item}>{item}</option>)}</select>
   <select aria-label="Filter by stage" value={filters.stage} onChange={e=>setFilters({...filters,stage:e.target.value})}><option value="all">All stages</option>{stages.map(item=><option key={item}>{item}</option>)}</select>
   <select aria-label="Filter by case status" value={filters.caseStatus} onChange={e=>setFilters({...filters,caseStatus:e.target.value})}><option value="all">All case statuses</option>{statuses.map(item=><option key={item}>{item}</option>)}</select>
   <select aria-label="Filter by SLA" value={filters.sla} onChange={e=>setFilters({...filters,sla:e.target.value})}><option value="all">All SLA flags</option><option value="on-track">Green / On Track</option><option value="attention">Amber / Attention</option><option value="overdue">Red / Critical</option></select>
   <select aria-label="Filter by issue" value={filters.issue} onChange={e=>setFilters({...filters,issue:e.target.value})}><option value="all">All issue states</option><option value="open">Open issue</option><option value="none">No open issue</option></select>
   <label className="date"><span>From</span><input type="date" value={filters.from} onChange={e=>setFilters({...filters,from:e.target.value})}/></label><label className="date"><span>To</span><input type="date" value={filters.to} onChange={e=>setFilters({...filters,to:e.target.value})}/></label>
   <button onClick={reset}>Reset</button>
  </div>
  <section className="rm-panel"><div className="rm-panel-head"><div><b>{rows.length} applications</b><small>SLA flags use configured product ageing rules; any unresolved issue is critical</small></div></div><div className="rm-table-wrap"><table className="rm-app-table"><thead><tr><th>Application / Case ID</th><th>Customer</th><th>Franchise</th><th>Product</th><th>Current Stage</th><th>Case Status</th><th>Age / Pending</th><th>Last Updated</th><th>Open Issue</th><th>SLA Flag</th><th>Action</th></tr></thead><tbody>{rows.map(item=>{const sla=applicationSLA(item,escalations),openIssues=escalations.filter(issue=>issue.applicationId===item.id&&isOpen(issue));return <tr key={item.id} className={`sla-row ${sla}`}><td><b>{item.id}</b><small>{item.type}</small></td><td><b>{item.customer}</b></td><td>{franchiseName(item.franchiseId)}<small>{item.franchiseId}</small></td><td>{item.product}</td><td><Chip tone="blue">{item.stage}</Chip><small>With {item.pendingWith}</small></td><td><Chip tone={item.status==='Completed'||item.status==='Approved'?'green':item.status==='Pending'?'amber':'blue'}>{item.status}</Chip></td><td><b>{item.age} days</b><small>Since {item.pendingSince}</small></td><td>{item.updated}</td><td>{openIssues.length?<button className="rm-issue-link" onClick={()=>{setSelected(item.id);setSelectedIssue(openIssues[0].id);setTab('Issues / Escalations')}}><AlertTriangle/>{openIssues.length} open</button>:<span className="rm-muted">No issue</span>}</td><td><SLA value={sla}/></td><td><button className="rm-open-case" onClick={()=>{setSelected(item.id);setTab('Overview');setSelectedIssue(undefined)}}>Open Case <ChevronRight/></button></td></tr>})}</tbody></table>{!rows.length&&<Empty/>}</div></section>
  {app&&<Drawer title={app.id} subtitle={`${app.customer} · ${franchiseName(app.franchiseId)} · Read-only case view`} close={()=>{setSelected(undefined);setRaisingIssue(false);setSelectedIssue(undefined)}}>
   <div className="rm-detail-hero"><div><small>SLA STATUS</small><SLA value={applicationSLA(app,escalations)}/></div><div className="rm-case-state"><small>CASE STATUS</small><Chip tone={app.status==='Pending'?'amber':'blue'}>{app.status}</Chip></div><button className="rm-danger" onClick={()=>{setRaisingIssue(true);setTab('Issues / Escalations')}}><AlertTriangle/> Raise Issue</button></div>
   <div className="rm-tabs rm-case-tabs">{['Overview','Documents','Issues / Escalations','Timeline'].map(item=><button key={item} className={tab===item?'active':''} onClick={()=>{setTab(item);setSelectedIssue(undefined)}}>{item}{item==='Issues / Escalations'&&appIssues.length>0?` (${appIssues.length})`:''}</button>)}</div>
   {tab==='Overview'&&<><DetailGrid rows={[["Case ID",app.id],["Customer",app.customer],["Franchise",franchiseName(app.franchiseId)],["Product",app.product],["Application date",app.submitted],["Current stage",app.stage],["Status",app.status],["Pending since",app.pendingSince],["Pending with",app.pendingWith],["Last updated",app.updated]]}/><Notice>This RM view is monitoring-only. Operational processing, payment approval, issuance and source-data changes remain with authorised teams.</Notice></>}
   {tab==='Documents'&&<><h3>Document status</h3>{app.documents.map(item=><div className="rm-document" key={item.name}><FileText/><span><b>{item.name}</b><small>View-only status</small></span><Chip tone={item.status==='Verified'||item.status==='Received'?'green':'amber'}>{item.status}</Chip></div>)}</>}
   {tab==='Issues / Escalations'&&(raisingIssue?<IssueForm app={app} submit={raise} cancel={()=>setRaisingIssue(false)}/>:activeIssue?<IssueDetail issue={activeIssue} back={()=>setSelectedIssue(undefined)} addComment={addComment} updateStatus={updateIssue}/>:<IssueList issues={appIssues} select={setSelectedIssue} raise={()=>setRaisingIssue(true)}/>)}
   {tab==='Timeline'&&<Timeline issues={appIssues} caseItems={app.timeline}/>} 
  </Drawer>}
 </>
}

function SummaryFilter({label,value,tone='neutral',active,onClick}:{label:string;value:number;tone?:string;active:boolean;onClick:()=>void}){return <button className={`${tone} ${active?'active':''}`} onClick={onClick}><span>{label}</span><strong>{value}</strong><small>Click to filter</small></button>}

function IssueList({issues,select,raise}:{issues:RMEscalation[];select:(id:string)=>void;raise:()=>void}){return <><div className="rm-subhead"><div><b>Issues & escalations</b><small>All open and historical issues linked to this case</small></div><button className="rm-danger" onClick={raise}><AlertTriangle/> Raise Issue</button></div>{issues.length?issues.map(item=><button className="rm-issue-card" key={item.id} onClick={()=>select(item.id)}><span className={`rm-priority ${item.priority.toLowerCase()}`}>{item.priority}</span><div><b>{item.subject}</b><small>{item.id} · {item.type} · Assigned to {item.assignedTo}</small></div><Chip tone={item.status==='Closed'?'green':item.status==='Resolved'?'blue':'red'}>{item.status}</Chip><ChevronRight/></button>):<div className="rm-empty compact"><ShieldCheck/><b>No issues raised</b><span>This case has no escalation history.</span></div>}</>}

function IssueForm({app,submit,cancel}:{app:RMApplication;submit:(form:{type:string;subject:string;description:string;assignedTo:RMIssueAssignee;priority:Priority})=>void;cancel:()=>void}){
 const [type,setType]=useState('Processing Delay'),[subject,setSubject]=useState(''),[description,setDescription]=useState(''),[assignedTo,setAssigned]=useState<RMIssueAssignee>('Head Office Operations'),[priority,setPriority]=useState<Priority>('High'),[error,setError]=useState('')
 const chooseType=(value:string)=>{setType(value);setAssigned(['Missing / Incorrect Data','Missing Document','Customer / Franchise Information'].includes(value)?'Franchise':'Head Office Operations')}
 const send=(event:FormEvent)=>{event.preventDefault();if(subject.trim().length<5||description.trim().length<10){setError('Add a clear title and at least 10 characters of detail.');return}submit({type,subject:subject.trim(),description:description.trim(),assignedTo,priority})}
 return <div className="rm-inline-form rm-issue-form"><div className="rm-subhead"><div><b>Raise issue against {app.id}</b><small>The escalation remains linked to this case.</small></div></div><form onSubmit={send}><label>Issue type<select value={type} onChange={e=>chooseType(e.target.value)}>{['Processing Delay','Issuance / Payment Issue','Missing / Incorrect Data','Missing Document','Status Incorrect','Customer / Franchise Information','Other'].map(item=><option key={item}>{item}</option>)}</select></label><label>Responsible side<select value={assignedTo} onChange={e=>setAssigned(e.target.value as RMIssueAssignee)}><option>Head Office Operations</option><option>Franchise</option></select></label><label>Priority<select value={priority} onChange={e=>setPriority(e.target.value as Priority)}><option>Low</option><option>Normal</option><option>High</option><option>Critical</option></select></label><label className="span">Issue title<input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Concise description of what needs attention"/></label><label className="span">Description / supporting comment<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Explain what appears incorrect, delayed or requires intervention"/></label>{error&&<p className="rm-form-error">{error}</p>}<div className="rm-form-actions"><button type="button" onClick={cancel}>Cancel</button><button className="rm-primary" type="submit"><Send/> Raise & notify</button></div></form></div>
}

function IssueDetail({issue,back,addComment,updateStatus}:{issue:RMEscalation;back:()=>void;addComment:(id:string,text:string)=>void;updateStatus:(id:string,status:RMIssueStatus,resolution?:string)=>void}){
 const [comment,setComment]=useState(''),[resolution,setResolution]=useState(issue.resolution||''),[error,setError]=useState('')
 const resolve=()=>{if(resolution.trim().length<5){setError('Add a short resolution note before marking the issue resolved.');return}updateStatus(issue.id,'Resolved',resolution.trim())}
 return <div className="rm-issue-detail"><button className="rm-back rm-inline-back" onClick={back}><ArrowLeft/> All issues</button><div className="rm-issue-detail-head"><div><small>{issue.id} · {issue.type}</small><h2>{issue.subject}</h2></div><Chip tone={issue.status==='Closed'?'green':issue.status==='Resolved'?'blue':'red'}>{issue.status}</Chip></div><p className="rm-issue-description">{issue.description}</p><DetailGrid rows={[["Parent Case ID",issue.applicationId],["Raised by",`${issue.raisedBy} · ${issue.raisedByRole}`],["Raised date",issue.raisedAt],["Sent / assigned to",issue.assignedTo],["Priority",issue.priority],["Last updated",issue.updatedAt],["Resolved date",issue.resolvedAt||'—'],["Closed date",issue.closedAt||'—']]}/>
  {issue.status!=='Closed'&&<div className="rm-resolution-box"><h3>Resolution workflow</h3>{issue.status!=='Resolved'?<><textarea value={resolution} onChange={e=>setResolution(e.target.value)} placeholder="Record the confirmed fix or resolution..."/>{error&&<p className="rm-form-error">{error}</p>}<button className="rm-primary" onClick={resolve}><Check/> Mark Resolved</button></>:<><p><Check/> Responsible-side fix is recorded. RM can close after confirming it.</p><button className="rm-primary" onClick={()=>updateStatus(issue.id,'Closed')}><ShieldCheck/> Confirm Fix & Close Issue</button></>}</div>}
  {issue.resolution&&<div className="rm-resolution"><small>RESOLUTION</small><p>{issue.resolution}</p></div>}
  <section className="rm-comments"><h3>Comments</h3>{issue.comments.length?issue.comments.map(item=><article key={item.id}><span>{item.author.split(' ').map(part=>part[0]).join('').slice(0,2)}</span><div><b>{item.author}<em>{item.role}</em></b><small>{item.createdAt}</small><p>{item.text}</p></div></article>):<p className="rm-muted">No comments yet.</p>}{issue.status!=='Closed'&&<form onSubmit={event=>{event.preventDefault();if(!comment.trim())return;addComment(issue.id,comment.trim());setComment('')}}><textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add a monitoring or follow-up comment..."/><button className="rm-primary" type="submit"><Send/> Add Comment</button></form>}</section>
  <section className="rm-timeline"><h3>Issue history</h3>{[...issue.activity].reverse().map(item=><div key={item.id}><i/><span><b>{item.text}</b><small>{item.createdAt}</small></span></div>)}</section>
 </div>
}

function Timeline({issues,caseItems}:{issues:RMEscalation[];caseItems:string[]}){const issueItems=issues.flatMap(issue=>issue.activity.map(item=>({id:item.id,text:item.text,date:item.createdAt}))).reverse();return <section className="rm-timeline"><h3>Case & issue history</h3>{issueItems.map(item=><div key={item.id}><i/><span><b>{item.text}</b><small>{item.date}</small></span></div>)}{[...caseItems].reverse().map((item,index)=><div key={`${item}-${index}`}><i/><span><b>{item}</b><small>Case activity</small></span></div>)}</section>}
