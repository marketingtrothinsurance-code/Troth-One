import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { AlertTriangle, CalendarClock, ChevronLeft, ChevronRight, MessageSquareText, PhoneCall, Search, Send, ShieldCheck, X } from 'lucide-react'
import { rmRenewalService } from './renewalService'
import { rmRepository } from './service'
import type { RMRenewal } from './types'

interface Props {franchiseContext:string;globalSearch:string;onToast:(message:string)=>void}
type FollowUpType='Call Logged'|'Follow-Up Added'|'Comment Added'

const dateLabel=(value:string,options:Intl.DateTimeFormatOptions={day:'2-digit',month:'short',year:'numeric'})=>new Date(`${value}T00:00:00`).toLocaleDateString('en-IN',options)
const dateTime=(value:string)=>new Date(value).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})
const money=(value:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(value)
const iso=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
const franchiseName=(id:string)=>rmRepository.franchises().find(item=>item.id===id)?.name||'Restricted'
const todayIso=()=>iso(new Date())

function Chip({children,tone='neutral'}:{children:ReactNode;tone?:string}){return <span className={`rm-chip ${tone}`}>{children}</span>}
function urgencyLabel(item:RMRenewal){const urgency=rmRenewalService.urgency(item);return urgency==='red'?(item.daysRemaining<0?'Overdue':'Critical'):urgency==='amber'?'Attention':'On Track'}

export function RMRenewalsPage({franchiseContext,globalSearch,onToast}:Props){
 const [items,setItems]=useState(rmRenewalService.list)
 const [search,setSearch]=useState(globalSearch)
 const [franchise,setFranchise]=useState(franchiseContext)
 const [product,setProduct]=useState('all')
 const [status,setStatus]=useState('all')
 const [selectedDate,setSelectedDate]=useState(todayIso)
 const initialDate=new Date()
 const [calendarDate,setCalendarDate]=useState(()=>new Date(initialDate.getFullYear(),initialDate.getMonth(),1))
 const [selected,setSelected]=useState<string>()

 useEffect(()=>{setSearch(globalSearch);setFranchise(franchiseContext)},[globalSearch,franchiseContext])

 const products=[...new Set(items.map(item=>item.product))]
 const filteredItems=items.filter(item=>(franchise==='all'||item.franchiseId===franchise)&&(product==='all'||item.product===product)&&(status==='all'||item.status===status)&&`${item.id} ${item.customerName} ${item.mobile} ${franchiseName(item.franchiseId)} ${item.product} ${item.provider} ${item.policyNumber}`.toLowerCase().includes(search.trim().toLowerCase()))
 const rows=filteredItems.filter(item=>item.renewalDueDate===selectedDate).sort((a,b)=>a.customerName.localeCompare(b.customerName))
 const selectedRenewal=items.find(item=>item.id===selected)
 const update=(next:RMRenewal)=>setItems(current=>current.map(item=>item.id===next.id?next:item))
 const open=(id:string)=>{try{const next=rmRenewalService.recordView(id);update(next);setSelected(id)}catch(error){onToast(error instanceof Error?error.message:'Unable to open renewal')}}
 const nudge=(id:string)=>{try{const next=rmRenewalService.nudge(id);update(next);onToast(`Franchise reminder recorded for ${id}`)}catch(error){onToast(error instanceof Error?error.message:'Unable to record reminder')}}
 const addActivity=(id:string,type:FollowUpType,remarks:string,followUpAt?:string)=>{try{const next=rmRenewalService.addActivity(id,type,remarks,followUpAt);update(next);onToast(`${type} for ${id}`)}catch(error){onToast(error instanceof Error?error.message:'Unable to record follow-up')}}
 const reset=()=>{setSearch(globalSearch);setFranchise(franchiseContext);setProduct('all');setStatus('all')}
 const changeMonth=(next:Date)=>{setCalendarDate(next);setSelectedDate(iso(next))}

 return <>
  <div className="rm-page-header rm-renewals-header"><div><small>PORTFOLIO RETENTION · MONITORING</small><h1>Renewals</h1><p>Calendar-led renewal monitoring across your allocated franchise network.</p></div><div className="rm-renewal-scope"><CalendarClock/><span><b>{filteredItems.length} renewals</b><small>{franchise==='all'?'All allocated franchises':franchiseName(franchise)}</small></span></div></div>
  <div className="rm-renewal-calendar-filters">
   <label className="search"><Search/><input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search customer, policy or provider..."/></label>
   <select aria-label="Franchise" value={franchise} onChange={event=>setFranchise(event.target.value)}><option value="all">All franchises</option>{rmRepository.franchises().map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select>
   <select aria-label="Product" value={product} onChange={event=>setProduct(event.target.value)}><option value="all">All products</option>{products.map(item=><option key={item}>{item}</option>)}</select>
   <select aria-label="Status" value={status} onChange={event=>setStatus(event.target.value)}><option value="all">All statuses</option>{['Live','Overdue','Renewed','Lost','Renewal Initiated'].map(item=><option key={item}>{item}</option>)}</select>
   <button onClick={reset}>Reset</button>
  </div>
  <RenewalCalendar items={filteredItems} month={calendarDate} selectedDate={selectedDate} setMonth={changeMonth} selectDay={setSelectedDate}/>
  <SelectedDateRenewals date={selectedDate} items={rows} open={open}/>
  {selectedRenewal&&<RenewalDrawer item={selectedRenewal} close={()=>setSelected(undefined)} nudge={nudge} addActivity={addActivity}/>}
 </>
}

function RenewalCalendar({items,month,selectedDate,setMonth,selectDay}:{items:RMRenewal[];month:Date;selectedDate:string;setMonth:(date:Date)=>void;selectDay:(date:string)=>void}){
 const year=month.getFullYear(),monthIndex=month.getMonth(),days=new Date(year,monthIndex+1,0).getDate(),offset=new Date(year,monthIndex,1).getDay()
 const cells=[...Array(offset).fill(null),...Array.from({length:days},(_,index)=>index+1)]
 const years=Array.from({length:7},(_,index)=>year-3+index)
 const move=(amount:number)=>setMonth(new Date(year,monthIndex+amount,1))
 return <section className="rm-panel rm-renewal-calendar premium">
  <div className="rm-calendar-head"><div><span>RENEWAL SCHEDULE</span><b>{month.toLocaleDateString('en-IN',{month:'long',year:'numeric'})}</b><small>Select any date to review its renewals below</small></div><div><button onClick={()=>move(-1)} aria-label="Previous month"><ChevronLeft/></button><select aria-label="Month" value={monthIndex} onChange={event=>setMonth(new Date(year,Number(event.target.value),1))}>{Array.from({length:12},(_,index)=><option key={index} value={index}>{new Date(2026,index,1).toLocaleDateString('en-IN',{month:'long'})}</option>)}</select><select aria-label="Year" value={year} onChange={event=>setMonth(new Date(Number(event.target.value),monthIndex,1))}>{years.map(item=><option key={item}>{item}</option>)}</select><button onClick={()=>move(1)} aria-label="Next month"><ChevronRight/></button></div></div>
  <div className="rm-renewal-legend"><span><i className="green"/>On Track</span><span><i className="amber"/>Attention</span><span><i className="red"/>Critical / Overdue</span></div>
  <div className="rm-calendar-weekdays">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((item,index)=><span className={index===0||index===6?'weekend':''} key={item}>{item}</span>)}</div>
  <div className="rm-calendar-grid">{cells.map((day,index)=>{if(!day)return <div className="blank" key={`blank-${index}`}/>;const value=iso(new Date(year,monthIndex,day)),due=items.filter(item=>item.renewalDueDate===value),urgencies=[...new Set(due.map(item=>rmRenewalService.urgency(item)))];return <button key={value} className={`${due.length?'has-renewals':''} ${value===selectedDate?'selected':''} ${value===todayIso()?'today':''} ${index%7===0||index%7===6?'weekend':''}`} onClick={()=>selectDay(value)} aria-label={`${dateLabel(value,{day:'numeric',month:'long',year:'numeric'})}, ${due.length} renewals`}><span>{day}{value===todayIso()&&<em>Today</em>}</span>{due.length>0?<><b>{due.length}<small> Renewal{due.length===1?'':'s'}</small></b><div className="rm-calendar-dots">{urgencies.map(item=><i className={item} key={item}/>)}</div></>:<small className="none">No renewals</small>}</button>})}</div>
 </section>
}

function SelectedDateRenewals({date,items,open}:{date:string;items:RMRenewal[];open:(id:string)=>void}){
 return <section className="rm-panel rm-selected-renewals"><div className="rm-selected-date-head"><div><small>SELECTED DATE</small><h2>Renewals for {dateLabel(date,{day:'numeric',month:'long',year:'numeric'})}</h2><p>{items.length} renewal{items.length===1?'':'s'} due</p></div><CalendarClock/></div>{items.length?<div className="rm-table-wrap"><table><thead><tr><th>Customer</th><th>Franchise</th><th>Product</th><th>Policy / Reference Number</th><th>Renewal Due Date</th><th>Days Remaining</th><th>Status</th><th>Last Follow-Up</th><th>Urgency</th><th>Action</th></tr></thead><tbody>{items.map(item=>{const urgency=rmRenewalService.urgency(item),last=item.activities.find(activity=>!['Renewal Generated','Franchise Notified','RM Viewed'].includes(activity.type));return <tr key={item.id} className={`rm-renewal-row ${urgency}`}><td><b>{item.customerName}</b><small>{item.mobile}</small></td><td><b>{franchiseName(item.franchiseId)}</b><small>{item.franchiseId}</small></td><td>{item.product}<small>{item.provider}</small></td><td>{item.policyNumber}</td><td>{dateLabel(item.renewalDueDate)}</td><td>{item.daysRemaining<0?`${Math.abs(item.daysRemaining)} days overdue`:`${item.daysRemaining} days`}</td><td><Chip tone={item.status==='Overdue'||item.status==='Lost'?'red':item.status==='Renewed'?'green':item.status==='Renewal Initiated'?'blue':'neutral'}>{item.status}</Chip></td><td>{last?dateTime(last.createdAt):'No RM follow-up'}<small>{last?.type}</small></td><td><span className={`rm-renewal-urgency ${urgency}`}><i/>{urgencyLabel(item)}</span></td><td><button className="rm-open-case" onClick={()=>open(item.id)}>Open <ChevronRight/></button></td></tr>})}</tbody></table></div>:<div className="rm-renewal-empty"><CalendarClock/><b>No renewals due on this date.</b><span>Select another highlighted date or change the calendar month.</span></div>}</section>
}

function RenewalDrawer({item,close,nudge,addActivity}:{item:RMRenewal;close:()=>void;nudge:(id:string)=>void;addActivity:(id:string,type:FollowUpType,remarks:string,followUpAt?:string)=>void}){
 const urgency=rmRenewalService.urgency(item),[mode,setMode]=useState<FollowUpType>()
 return <><button className="rm-drawer-scrim rm-renewal-scrim" onClick={close} aria-label="Close renewal details"/><aside className="rm-drawer wide rm-renewal-drawer"><header><div><b>{item.id} · {item.customerName}</b><small>{item.policyNumber} · {franchiseName(item.franchiseId)}</small></div><button onClick={close} aria-label="Close"><X/></button></header><div className="rm-drawer-body"><div className={`rm-renewal-alert ${urgency}`}><AlertTriangle/><div><b>{urgencyLabel(item)} renewal</b><span>{item.daysRemaining<0?`${Math.abs(item.daysRemaining)} days overdue`:`${item.daysRemaining} days remaining`} · Franchise owns renewal initiation and confirmation.</span></div><span className={`rm-renewal-urgency ${urgency}`}><i/>{urgencyLabel(item)}</span></div><section className="rm-lead-detail-section"><div className="rm-lead-section-head"><div><h3>Renewal Details</h3><p>Existing policy, customer and ownership information</p></div></div><div className="rm-detail-grid">{([['Customer',item.customerName],['Contact',item.mobile],['Email',item.email],['Franchise',`${franchiseName(item.franchiseId)} · ${item.franchiseId}`],['Product',item.product],['Provider / insurer',item.provider],['Policy / account',item.policyNumber],['Current premium',money(item.currentPremium)],['Renewal due date',dateLabel(item.renewalDueDate)],['Days remaining',item.daysRemaining<0?`${Math.abs(item.daysRemaining)} overdue`:`${item.daysRemaining} days`],['Renewal status',item.status],['Linked case',item.caseId||'Not initiated']] as [string,string][]).map(([label,value])=><div key={label}><small>{label}</small><b>{value}</b></div>)}</div></section><div className="rm-renewal-ownership"><ShieldCheck/><span><b>Monitoring permissions</b>RM can follow up and record assistance. Starting, confirming, and completing the renewal remains with the Franchise.</span></div><section className="rm-renewal-actions"><div className="rm-lead-section-head"><div><h3>{urgency==='red'?'Critical Renewal Follow-Up':'RM Follow-Up'}</h3><p>Coordinate action without taking over the renewal workflow</p></div></div><div><button className="nudge" onClick={()=>nudge(item.id)}><Send/> Nudge Franchisee</button><button onClick={()=>setMode('Call Logged')}><PhoneCall/> Log Call</button><button onClick={()=>setMode('Follow-Up Added')}><CalendarClock/> Add Follow-Up</button><button onClick={()=>setMode('Comment Added')}><MessageSquareText/> Add Comment</button></div></section>{mode&&<FollowUpForm mode={mode} cancel={()=>setMode(undefined)} submit={(remarks,followUpAt)=>{addActivity(item.id,mode,remarks,followUpAt);setMode(undefined)}}/>}<section className="rm-lead-history rm-renewal-history"><div className="rm-lead-section-head"><div><h3>Renewal Activity</h3><p>Franchise notifications and RM follow-up history</p></div></div>{item.activities.map(activity=><article key={activity.id}><i/><div><header><b>{activity.type}</b><Chip tone={activity.role==='Relationship Manager'?'blue':'neutral'}>{activity.role}</Chip></header><p>{activity.remarks}</p><small>{dateTime(activity.createdAt)} · {activity.user}{activity.followUpAt?` · Follow-up ${dateTime(activity.followUpAt)}`:''}</small></div></article>)}</section></div></aside></>
}

function FollowUpForm({mode,cancel,submit}:{mode:FollowUpType;cancel:()=>void;submit:(remarks:string,followUpAt?:string)=>void}){
 const [remarks,setRemarks]=useState(''),[followUpAt,setFollowUpAt]=useState(''),[error,setError]=useState('')
 const save=(event:FormEvent)=>{event.preventDefault();if(remarks.trim().length<3){setError('Add a short activity note.');return}if(mode==='Follow-Up Added'&&!followUpAt){setError('Select a follow-up date and time.');return}submit(remarks.trim(),followUpAt||undefined)}
 return <form className="rm-renewal-followup-form" onSubmit={save}><h3>{mode}</h3>{mode==='Follow-Up Added'&&<label>Follow-up date and time<input type="datetime-local" value={followUpAt} onChange={event=>setFollowUpAt(event.target.value)}/></label>}<label>Notes<textarea value={remarks} onChange={event=>setRemarks(event.target.value)} placeholder="Record the discussion, reminder or next action..."/></label>{error&&<p>{error}</p>}<footer><button type="button" onClick={cancel}>Cancel</button><button className="rm-primary">Save Activity</button></footer></form>
}
