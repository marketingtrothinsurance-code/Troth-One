import { useEffect, useMemo, useState } from 'react'
import { ArrowDownUp, Download, Filter, MoreHorizontal, Plus, SlidersHorizontal, X } from 'lucide-react'
import { productTabs } from '../config/roles'
import { formatINR } from '../data/mockData'
import type { Application, AppStatus, ProductType, Role } from '../types'
import { PageHeader, SearchBox, Select, StatusBadge } from '../components/UI'

interface Props { role:Role; apps:Application[]; onUpdate:(id:string,patch:Partial<Application>)=>void; onToast:(s:string)=>void }

export function ApplicationsPage({role,apps,onUpdate,onToast}:Props) {
  const [search,setSearch]=useState('')
  const [product,setProduct]=useState<string>('All')
  const [status,setStatus]=useState(sessionStorage.getItem('troth-filter')||'All')
  const [selected,setSelected]=useState<Application|null>(null)
  const [createOpen,setCreateOpen]=useState(false)
  const [filtersOpen,setFiltersOpen]=useState(false)
  const [sortAsc,setSortAsc]=useState(true)
  useEffect(()=>{ sessionStorage.removeItem('troth-filter'); const id=sessionStorage.getItem('troth-open-app'); if(id){setSelected(apps.find(a=>a.id===id)||null);sessionStorage.removeItem('troth-open-app')} const action=sessionStorage.getItem('troth-franchisee-action'); if(action==='new-application'&&['admin','franchisee'].includes(role)){setCreateOpen(true);sessionStorage.removeItem('troth-franchisee-action')} },[apps,role])
  const rows=useMemo(()=>apps.filter(a=>(product==='All'||a.product===product)&&(status==='All'||a.status===status)&&(a.customer.toLowerCase().includes(search.toLowerCase())||a.id.toLowerCase().includes(search.toLowerCase())||a.franchisee.toLowerCase().includes(search.toLowerCase()))).sort((a,b)=>sortAsc?a.ageing-b.ageing:b.ageing-a.ageing),[apps,product,status,search,sortAsc])
  const canCreate=['admin','franchisee'].includes(role)
  return <div className="page">
    <PageHeader eyebrow={role==='operations'?'OPERATIONS QUEUE':'APPLICATION MASTER'} title={role==='customer'?'My applications':role==='operations'?'Applications work queue':'Applications'} description={role==='customer'?'Track progress and complete any pending requirements.':`View, filter and manage ${role==='rm'?'applications across your assigned franchisees':role==='franchisee'?'applications for your customers':'all product applications'}.`} actions={<>{role!=='customer'&&<button className="secondary-btn" onClick={()=>onToast('Report exported')}><Download size={17}/> Export</button>}{canCreate&&<button className="primary-btn" onClick={()=>setCreateOpen(true)}><Plus size={17}/> New application</button>}</>}/>
    <div className="product-tabs">{productTabs.map(p=><button key={p} className={product===p?'active':''} onClick={()=>setProduct(p)}>{p}<span>{p==='All'?apps.length:apps.filter(a=>a.product===p).length}</span></button>)}</div>
    <div className="table-panel">
      <div className="table-toolbar"><SearchBox value={search} onChange={setSearch} placeholder="Search ID, customer or franchisee"/><div className="toolbar-filters"><Select value={status} onChange={setStatus}><option>All</option>{['New','In Progress','Action Required','Approved','Completed','Delayed','Escalated','Rejected'].map(s=><option key={s}>{s}</option>)}</Select><button className="secondary-btn desktop-filter" onClick={()=>setFiltersOpen(v=>!v)}><SlidersHorizontal size={17}/> More filters</button><button className="filter-mobile" onClick={()=>setFiltersOpen(true)}><Filter size={18}/></button></div></div>
      {filtersOpen&&<div className="advanced-filters"><Select value="All franchisees" onChange={()=>{}} label="Franchisee"><option>All franchisees</option></Select><Select value="All assignees" onChange={()=>{}} label="Assigned to"><option>All assignees</option></Select><Select value="Any time" onChange={()=>{}} label="Updated"><option>Any time</option><option>Today</option><option>Last 7 days</option></Select><button onClick={()=>setFiltersOpen(false)}>Done</button></div>}
      <div className="result-count"><b>{rows.length} applications</b><span>{status!=='All'&&<>Filtered by <button onClick={()=>setStatus('All')}>{status} ×</button></>}</span></div>
      <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Application</th><th>Customer / Franchisee</th><th>Product / Provider</th><th>Amount</th><th>Stage</th><th>Status</th><th>Pending action</th><th>Assigned to</th><th><button onClick={()=>setSortAsc(v=>!v)}>Pending since <ArrowDownUp size={13}/></button></th><th/></tr></thead><tbody>{rows.map(a=><tr key={a.id} onClick={()=>setSelected(a)}><td data-label="Application"><b className="link-text">{a.id}</b><small>{a.updated}</small></td><td data-label="Customer"><b>{a.customer}</b><small>{a.franchisee}</small></td><td data-label="Product"><b>{a.productName}</b><small>{a.provider}</small></td><td data-label="Amount"><b>{formatINR(a.amount)}</b></td><td data-label="Stage"><span>{a.stage}</span></td><td data-label="Status"><StatusBadge status={a.status}/></td><td data-label="Pending action"><span className={a.pendingAction!=='None'?'attention-text':''}>{a.pendingAction}</span></td><td data-label="Assigned to"><span>{a.assignedTo}</span></td><td data-label="Pending since"><span>{a.ageing} days</span></td><td><button className="row-action"><MoreHorizontal size={18}/></button></td></tr>)}</tbody></table></div>
      {!rows.length&&<div className="empty-state"><div>⌕</div><h3>No applications found</h3><p>Try changing the filters or search terms.</p><button onClick={()=>{setSearch('');setProduct('All');setStatus('All')}}>Clear filters</button></div>}
    </div>
    {selected&&<ApplicationDrawer application={selected} role={role} onClose={()=>setSelected(null)} onUpdate={(patch)=>{onUpdate(selected.id,patch);setSelected({...selected,...patch})}} onToast={onToast}/>} 
    {createOpen&&<CreateApplication onClose={()=>setCreateOpen(false)} onCreate={()=>{setCreateOpen(false);onToast('New application created')}}/>}
  </div>
}

function ApplicationDrawer({application:a,role,onClose,onUpdate,onToast}:{application:Application;role:Role;onClose:()=>void;onUpdate:(p:Partial<Application>)=>void;onToast:(s:string)=>void}) {
  const [tab,setTab]=useState('Overview')
  const [action,setAction]=useState(false)
  const tabs=['Overview','Customer','Product Details','Documents','Workflow','Remarks & Communication','Activity']
  const steps=['New','In Progress','Action Required','Approved','Completed']
  const index = a.status==='Delayed'||a.status==='Escalated'?2:Math.max(0,steps.indexOf(a.status))
  const fields = a.product==='Insurance'?[['Policy type',a.productName],['Insurer',a.provider],['Annual premium',formatINR(a.amount)],['Sum insured',formatINR(a.amount*120)]]:a.product==='Loans'?[['Loan type',a.productName],['Lender',a.provider],['Requested amount',formatINR(a.amount)],['Tenure','15 years']]:[['Product',a.productName],['Provider / AMC',a.provider],['Investment amount',formatINR(a.amount)],['Transaction','One-time']]
  return <><button className="drawer-scrim" onClick={onClose}/><aside className="detail-drawer">
    <div className="drawer-header"><div><span className="eyebrow">{a.product.toUpperCase()}</span><h2>{a.id}</h2><p>{a.customer} • {a.franchisee}</p></div><button className="icon-button" onClick={onClose}><X size={21}/></button></div>
    <div className="drawer-summary"><StatusBadge status={a.status}/><span>Assigned to <b>{a.assignedTo}</b></span><span>Created <b>12 Aug 2026</b></span></div>
    <div className="drawer-tabs">{tabs.map(t=><button className={tab===t?'active':''} onClick={()=>setTab(t)} key={t}>{t}</button>)}</div>
    <div className="drawer-body">
      {tab==='Overview'&&<><section className="detail-section"><h3>Application overview</h3><div className="detail-grid">{fields.map(([k,v])=><div key={k}><span>{k}</span><b>{v}</b></div>)}</div></section><section className="detail-section"><h3>Next action</h3><div className="next-action"><b>{a.pendingAction}</b><p>{a.pendingAction==='None'?'There are no outstanding requirements.':'Complete this requirement to keep the application moving.'}</p></div></section></>}
      {tab==='Workflow'&&<section className="detail-section"><h3>Application progress</h3><div className="workflow">{steps.map((s,i)=><div className={i<index?'done':i===index?'current':''} key={s}><i>{i<index?'✓':i+1}</i><div><b>{s}</b><span>{i<index?'Completed':i===index?'Current stage':'Not started'}</span></div></div>)}</div></section>}
      {tab==='Documents'&&<section className="detail-section"><h3>Required documents</h3><div className="document-list">{[['PAN card','Verified'],['Aadhaar card','Verified'],['Bank statement',a.pendingAction.includes('bank')?'Missing':'Received'],['Signed proposal form','Received']].map(([d,s])=><div key={d}><span className={`doc-icon ${s.toLowerCase()}`}>▤</span><div><b>{d}</b><small>PDF or image • Max 10 MB</small></div><StatusBadge status={s}/>{s==='Missing'&&<button onClick={()=>onToast('Document request sent')}>Request</button>}</div>)}</div></section>}
      {tab==='Customer'&&<section className="detail-section"><h3>Customer information</h3><div className="detail-grid"><div><span>Full name</span><b>{a.customer}</b></div><div><span>Mobile</span><b>+91 98••• ••426</b></div><div><span>PAN</span><b>ABCDE••••F</b></div><div><span>KYC status</span><b className="success-text">Verified</b></div><div><span>City</span><b>{a.city}</b></div><div><span>Customer since</span><b>18 Mar 2024</b></div></div></section>}
      {tab==='Product Details'&&<section className="detail-section"><h3>{a.product} details</h3><div className="detail-grid">{fields.map(([k,v])=><div key={k}><span>{k}</span><b>{v}</b></div>)}</div></section>}
      {(tab==='Remarks & Communication'||tab==='Activity')&&<section className="detail-section"><h3>{tab}</h3><div className="timeline"><div><i/><p><b>Application moved to {a.stage}</b><span>Priya Nair • 02 Sep 2026, 10:14 AM</span></p></div><div><i/><p><b>Customer documents reviewed</b><span>Harsh Vyas • 01 Sep 2026, 4:32 PM</span></p></div><div><i/><p><b>Application created by {a.franchisee}</b><span>12 Aug 2026, 11:08 AM</span></p></div></div>{tab.startsWith('Remarks')&&<div className="note-box"><textarea placeholder="Add an internal remark..."/><button onClick={()=>onToast('Remark added')}>Add remark</button></div>}</section>}
    </div>
    {role!=='customer'&&role!=='rm'&&<div className="drawer-actions"><button className="secondary-btn" onClick={()=>onToast('Document request sent')}>Request document</button><button className="primary-btn" onClick={()=>setAction(v=>!v)}>Update application</button>{action&&<div className="action-menu"><b>Change status</b>{['In Progress','Action Required','Approved','Completed','Delayed','Escalated'].map(s=><button key={s} onClick={()=>{onUpdate({status:s as AppStatus});setAction(false)}}><StatusBadge status={s}/></button>)}</div>}</div>}
  </aside></>
}

function CreateApplication({onClose,onCreate}:{onClose:()=>void;onCreate:()=>void}) {
  return <><button className="drawer-scrim" onClick={onClose}/><aside className="form-drawer"><div className="drawer-header"><div><span className="eyebrow">NEW BUSINESS</span><h2>Create application</h2><p>Start a new product application.</p></div><button className="icon-button" onClick={onClose}><X size={21}/></button></div><form onSubmit={e=>{e.preventDefault();onCreate()}}><label>Customer<select required><option value="">Select customer</option><option>Vivek Joshi</option><option>Riya Desai</option></select></label><label>Product<select required><option value="">Select product</option>{productTabs.slice(1).map(p=><option key={p}>{p}</option>)}</select></label><label>Provider<select required><option>Choose after product selection</option></select></label><label>Requested amount<input type="number" placeholder="₹ 0"/></label><label>Notes<textarea placeholder="Add any useful context for operations"/></label><div className="form-actions"><button type="button" className="secondary-btn" onClick={onClose}>Cancel</button><button className="primary-btn">Create application</button></div></form></aside></>
}
