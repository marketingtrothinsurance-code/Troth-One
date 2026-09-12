import { useMemo, useState, type ReactNode } from 'react'
import { AlertTriangle, CalendarClock, CheckCircle2, Clock3, Eye, RefreshCw, RotateCcw, Search, UserRound } from 'lucide-react'
import { DataTable, Metric, Modal, PageHeader, Panel, StatusBadge, money } from '../components/FranchiseeUI'
import { buildFranchiseeRenewals, renewalPriority, type FranchiseeRenewal } from '../renewalsData'
import type { FranchiseeCase, FranchiseeCustomer } from '../types'
import './renewals.css'

type DaysFilter='All'|'Next 30 Days'|'31–60 Days'|'61–90 Days'|'Overdue'
type StatusFilter='All'|'Upcoming'|'Due Soon'|'Overdue'|'Renewal Initiated'
type SummaryFilter=DaysFilter

export function RenewalsPage({customers,cases,onViewCustomer,onStartRenewal,onViewCase}:{customers:FranchiseeCustomer[];cases:FranchiseeCase[];onViewCustomer:(customerId:string)=>void;onStartRenewal:(renewal:FranchiseeRenewal)=>string;onViewCase:()=>void}){
  const renewals=useMemo(()=>buildFranchiseeRenewals(customers,cases),[customers,cases])
  const [search,setSearch]=useState('')
  const [days,setDays]=useState<DaysFilter>('All')
  const [product,setProduct]=useState('All Products')
  const [status,setStatus]=useState<StatusFilter>('All')
  const [summary,setSummary]=useState<SummaryFilter>('All')
  const [page,setPage]=useState(1)
  const [details,setDetails]=useState<FranchiseeRenewal>()
  const [confirming,setConfirming]=useState<FranchiseeRenewal>()

  const manuallyFiltered=useMemo(()=>renewals.filter(item=>`${item.customerName} ${item.policyNumber} ${item.product}`.toLowerCase().includes(search.toLowerCase())&&(product==='All Products'||item.product===product)&&(status==='All'||item.status===status)&&matchesDays(item.daysRemaining,days)),[renewals,search,product,status,days])
  const filtered=useMemo(()=>manuallyFiltered.filter(item=>matchesDays(item.daysRemaining,summary)),[manuallyFiltered,summary])
  const pageRows=filtered.slice((page-1)*8,page*8)
  const setFilter=<T,>(setter:(value:T)=>void,value:T)=>{setter(value);setPage(1)}
  const chooseSummary=(value:SummaryFilter)=>{setSummary(current=>current===value&&value!=='All'?'All':value);setPage(1)}
  const reset=()=>{setSearch('');setDays('All');setProduct('All Products');setStatus('All');setSummary('All');setPage(1)}

  return <div className="franchisee-renewals">
    <PageHeader eyebrow="FRANCHISEE / RENEWALS" title="Renewals" description="Track upcoming policy and product renewals, prioritise due cases, and initiate renewal actions."/>
    <section className="fr-renewal-kpis" aria-label="Renewal summary filters">
      <SummaryCard active={summary==='All'}><Metric label="Total Renewals Due" value={manuallyFiltered.length} meta="Across current filters" icon={<RefreshCw/>} onClick={()=>chooseSummary('All')}/></SummaryCard>
      <SummaryCard active={summary==='Next 30 Days'}><Metric label="Due in Next 30 Days" value={manuallyFiltered.filter(item=>item.daysRemaining>=0&&item.daysRemaining<=30).length} meta="Immediate follow-up required" icon={<AlertTriangle/>} tone="red" onClick={()=>chooseSummary('Next 30 Days')}/></SummaryCard>
      <SummaryCard active={summary==='31–60 Days'}><Metric label="Due in 31–60 Days" value={manuallyFiltered.filter(item=>item.daysRemaining>=31&&item.daysRemaining<=60).length} meta="Approaching renewal" icon={<Clock3/>} tone="orange" onClick={()=>chooseSummary('31–60 Days')}/></SummaryCard>
      <SummaryCard active={summary==='61–90 Days'}><Metric label="Due in 61–90 Days" value={manuallyFiltered.filter(item=>item.daysRemaining>=61&&item.daysRemaining<=90).length} meta="Comfortably ahead" icon={<CalendarClock/>} tone="teal" onClick={()=>chooseSummary('61–90 Days')}/></SummaryCard>
      <SummaryCard active={summary==='Overdue'}><Metric label="Overdue" value={manuallyFiltered.filter(item=>item.daysRemaining<0).length} meta="Needs urgent attention" icon={<AlertTriangle/>} tone="red" onClick={()=>chooseSummary('Overdue')}/></SummaryCard>
    </section>
    <Panel title="Renewals Due" subtitle={`${filtered.length} renewal records · nearest due date first`}>
      <div className="fr-renewal-filters">
        <label className="fr-renewal-search"><span>Search</span><div><Search/><input value={search} onChange={event=>setFilter(setSearch,event.target.value)} placeholder="Customer, policy number or product"/></div></label>
        <Select label="Days to Renewal" value={days} set={value=>setFilter(setDays,value as DaysFilter)} options={['All','Next 30 Days','31–60 Days','61–90 Days','Overdue']}/>
        <Select label="Product" value={product} set={value=>setFilter(setProduct,value)} options={['All Products',...new Set(renewals.map(item=>item.product))]}/>
        <Select label="Status" value={status} set={value=>setFilter(setStatus,value as StatusFilter)} options={['All','Upcoming','Due Soon','Overdue','Renewal Initiated']}/>
        <button className="fr-renewal-reset" onClick={reset}><RotateCcw/> Reset Filters</button>
      </div>
      <DataTable headers={['Customer Name','Product / Policy','Policy Number / Reference','Insurer / Provider','Current Premium','Renewal Due Date','Days Remaining','Renewal Status','Actions']} empty={!pageRows.length}>{pageRows.map(item=><tr key={item.id} className={`fr-renewal-row priority-${renewalPriority(item.daysRemaining)}`}><td><button className="fr-customer-link" onClick={()=>onViewCustomer(item.customerId)}><b>{item.customerName}</b><small>{item.customerId}</small></button></td><td><b>{item.product}</b><small>Existing relationship</small></td><td>{item.policyNumber}</td><td>{item.provider}</td><td><b>{money(item.currentPremium)}</b></td><td>{date(item.renewalDueDate)}</td><td><span className={`fr-days ${renewalPriority(item.daysRemaining)}`}>{item.daysRemaining<0?`${Math.abs(item.daysRemaining)} days overdue`:`${item.daysRemaining} days`}</span></td><td><StatusBadge tone={item.status==='Overdue'?'red':item.status==='Due Soon'?'red':item.status==='Renewal Initiated'?'blue':renewalPriority(item.daysRemaining)}>{item.status}</StatusBadge></td><td><div className="fr-renewal-actions"><button title="View customer" onClick={()=>onViewCustomer(item.customerId)}><UserRound/></button><button title="View policy details" onClick={()=>setDetails(item)}><Eye/></button>{item.status==='Renewal Initiated'?<button className="case" onClick={onViewCase}>View Case</button>:<button className="renew" onClick={()=>setConfirming(item)}>Start Renewal</button>}</div></td></tr>)}</DataTable>
      <Pager page={page} count={filtered.length} set={setPage}/>
    </Panel>
    {details&&<RenewalDetails item={details} onClose={()=>setDetails(undefined)} onStart={()=>{setDetails(undefined);setConfirming(details)}}/>}
    {confirming&&<RenewalConfirmation item={confirming} onClose={()=>setConfirming(undefined)} onStart={onStartRenewal} onViewCase={onViewCase}/>} 
  </div>
}

function SummaryCard({active,children}:{active:boolean;children:ReactNode}){return <div className={`fr-renewal-kpi${active?' active':''}`}>{children}</div>}

function Select({label,value,set,options}:{label:string;value:string;set:(value:string)=>void;options:string[]}){return <label className="fr-renewal-select"><span>{label}</span><select value={value} onChange={event=>set(event.target.value)}>{options.map(option=><option key={option}>{option}</option>)}</select></label>}
function Pager({page,count,set}:{page:number;count:number;set:(page:number)=>void}){const pages=Math.max(1,Math.ceil(count/8));return <div className="fr-renewal-pager"><span>{count} records · Page {page} of {pages}</span><button disabled={page===1} onClick={()=>set(page-1)}>Previous</button><button disabled={page===pages} onClick={()=>set(page+1)}>Next</button></div>}

function RenewalDetails({item,onClose,onStart}:{item:FranchiseeRenewal;onClose:()=>void;onStart:()=>void}){return <Modal title="Policy / Renewal Details" subtitle={item.policyNumber} onClose={onClose}><div className="fr-renewal-modal-body"><div className="fr-renewal-facts">{[['Customer',item.customerName],['Product',item.product],['Policy / Reference',item.policyNumber],['Insurer / Provider',item.provider],['Current Premium',money(item.currentPremium)],['Renewal Due',date(item.renewalDueDate)],['Days Remaining',item.daysRemaining<0?`${Math.abs(item.daysRemaining)} days overdue`:`${item.daysRemaining} days`],['Status',item.status]].map(([label,value])=><div key={label}><span>{label}</span><b>{value}</b></div>)}</div><div className="fr-renewal-modal-actions"><button className="tf-secondary" onClick={onClose}>Close</button>{item.status!=='Renewal Initiated'&&<button className="tf-primary" onClick={onStart}><RefreshCw/> Start Renewal</button>}</div></div></Modal>}

function RenewalConfirmation({item,onClose,onStart,onViewCase}:{item:FranchiseeRenewal;onClose:()=>void;onStart:(item:FranchiseeRenewal)=>string;onViewCase:()=>void}){
  const [caseId,setCaseId]=useState('')
  if(caseId)return <Modal title="Renewal case created successfully" subtitle={caseId} onClose={onClose}><div className="fr-renewal-success"><CheckCircle2/><h3>Renewal Initiated</h3><p>The case has been submitted to Head Office Operations for processing.</p><div><button className="tf-secondary" onClick={onClose}>Close</button><button className="tf-primary" onClick={onViewCase}>View Case</button></div></div></Modal>
  return <Modal title="Start Renewal" subtitle="Confirm the existing relationship before creating the case" onClose={onClose}><div className="fr-renewal-modal-body"><div className="fr-renewal-facts">{[['Customer',item.customerName],['Product',item.product],['Existing Policy',item.policyNumber],['Renewal Due',date(item.renewalDueDate)],['Current Premium',money(item.currentPremium)],['Transaction Type','Renewal']].map(([label,value])=><div key={label}><span>{label}</span><b>{value}</b></div>)}</div><div className="fr-renewal-routing"><RefreshCw/><div><b>Next handler: Head Office Operations</b><p>A new Renewal case linked to the original policy will be submitted through the existing case workflow.</p></div></div><div className="fr-renewal-modal-actions"><button className="tf-secondary" onClick={onClose}>Cancel</button><button className="tf-primary" onClick={()=>setCaseId(onStart(item))}>Start Renewal</button></div></div></Modal>
}

function matchesDays(value:number,filter:DaysFilter){if(filter==='Next 30 Days')return value>=0&&value<=30;if(filter==='31–60 Days')return value>=31&&value<=60;if(filter==='61–90 Days')return value>=61&&value<=90;if(filter==='Overdue')return value<0;return true}
const date=(value:string)=>new Date(`${value}T00:00:00`).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})
