import { CalendarClock, Upload } from 'lucide-react'
import { useState, type ChangeEvent, type ReactNode } from 'react'
import type { FranchiseeLead, LeadContactActivity, LeadDocument, LeadQualification, LeadQuote, LeadStage, TimelineEvent } from '../types'
import { crmStageService } from '../services/crmStageService'
import { DataTable, Modal, money, Panel, StatusBadge, Timeline } from './FranchiseeUI'

type DetailTab='Overview'|'Activity'|'Notes'|'Documents'|'Stage History'
type RequiredAction='contact'|'qualification'|'quote'

const stages:LeadStage[]=['New','Contacted','Qualified','Quote Raised','Won','Lost']
const now=()=>new Date().toISOString()
const dateTime=(value:string)=>{const parsed=new Date(value);return Number.isNaN(parsed.getTime())?value:parsed.toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}
const timelineEvent=(title:string,detail:string):TimelineEvent=>({id:crypto.randomUUID(),title,detail,time:dateTime(now()),actor:'Franchise'})

interface Props{
  lead:FranchiseeLead
  owners:string[]
  onClose:()=>void
  onUpdate:(patch:Partial<FranchiseeLead>)=>void
  onConvert:()=>void
  onToast:(message:string)=>void
}

export function CRMLeadDetail({lead,owners,onClose,onUpdate,onConvert,onToast}:Props){
  const [tab,setTab]=useState<DetailTab>('Overview')
  const [requiredAction,setRequiredAction]=useState<RequiredAction>()
  const [showLost,setShowLost]=useState(false)
  const requirement=crmStageService.requirement(lead)
  const currentIndex=stages.indexOf(lead.stage)

  const updateWithEvent=(title:string,detail:string,patch:Partial<FranchiseeLead>)=>onUpdate({...patch,updatedAt:now(),timeline:[timelineEvent(title,detail),...lead.timeline]})
  const showRequiredForm=()=>{
    if(lead.stage==='New')setRequiredAction('contact')
    if(lead.stage==='Contacted')setRequiredAction('qualification')
    if(lead.stage==='Qualified')setRequiredAction('quote')
    if(lead.stage==='Quote Raised')attemptMove('Won')
  }
  const attemptMove=(target:LeadStage)=>{
    if(target==='Lost'){setShowLost(true);return}
    if(!requirement.next||target!==requirement.next){onToast(requirement.next?`Complete the current stage first. The next valid stage is ${requirement.next}.`:'This lead is already closed.');return}
    if(target==='Won'){
      if(!crmStageService.hasValidQuote(lead)){onToast('Record valid quote or proposal details before converting this lead.');setRequiredAction('quote');return}
      onConvert();return
    }
    try{
      const updated=crmStageService.transition(lead,target)
      onUpdate(updated)
      onToast(`${lead.id} moved to ${target}`)
    }catch(error){
      onToast(error instanceof Error?error.message:'Complete the required action first.')
      showRequiredForm()
    }
  }
  const attach=(event:ChangeEvent<HTMLInputElement>)=>{
    const file=event.target.files?.[0]
    if(!file)return
    const document:LeadDocument={id:crypto.randomUUID(),name:'Lead attachment',fileName:file.name,size:file.size,uploadedAt:now()}
    updateWithEvent('Document added',file.name,{documents:[document,...(lead.documents||[])]})
    onToast(`${file.name} attached`)
  }

  return <Modal title={lead.name} subtitle={`${lead.id} · Lead Detail`} onClose={onClose}>
    <div className="crm-detail-head"><div><span>{lead.product}</span><h3>{money(lead.expectedValue)}</h3><p>{lead.owner} · Follow-up: {lead.followUp?dateTime(lead.followUp.dueAt):lead.nextAction}</p></div><StatusBadge>{lead.stage}</StatusBadge></div>
    <div className="crm-pipeline">{stages.map((stage,index)=>{const complete=index<currentIndex&&stage!=='Lost',next=stage===requirement.next,closed=['Won','Lost'].includes(lead.stage),locked=!next&&stage!=='Lost'&&stage!==lead.stage;return <button key={stage} className={`${stage===lead.stage?'active ':''}${complete?'complete ':''}${locked?'locked':''}`.trim()} disabled={closed||stage===lead.stage||complete} onClick={()=>attemptMove(stage)}>{stage}</button>})}</div>
    {!['Won','Lost'].includes(lead.stage)&&<section className={`crm-requirement ${requirement.complete?'complete':''}`}><div><span>Next stage: {requirement.next}</span><h3>{requirement.label}</h3><p>{requirement.complete?`Required work is recorded. You can move this lead to ${requirement.next}.`:requirement.message}</p></div><div className="crm-requirement-actions"><StatusBadge>{requirement.complete?'Complete':'Required'}</StatusBadge>{!requirement.complete&&lead.stage!=='Quote Raised'&&<button className="tf-secondary" onClick={showRequiredForm}>Complete Required Action</button>}<button className="tf-primary" onClick={()=>attemptMove(requirement.next!)}>{requirement.next==='Won'?'Convert & Mark Won':`Move to ${requirement.next}`}</button><button className="tf-secondary crm-danger" onClick={()=>setShowLost(true)}>Mark Lost</button></div></section>}
    <div className="tf-tabs crm-detail-tabs">{(['Overview','Activity','Notes','Documents','Stage History'] as DetailTab[]).map(item=><button key={item} className={tab===item?'active':''} onClick={()=>setTab(item)}>{item}</button>)}</div>
    <div className="crm-detail-body">
      {tab==='Overview'&&<><div className="crm-info-card"><Info label="Lead ID" value={lead.id}/><Info label="Product" value={lead.product}/><Info label="Sub Product" value={lead.subProduct||'Not specified'}/><Info label="Stage" value={lead.stage}/><Info label="Owner" value={lead.owner}/><Info label="Expected Value" value={money(lead.expectedValue)}/><Info label="Source" value={lead.source}/><Info label="Source Inquiry" value={lead.inquiryId||'Direct lead'}/><Info label="Mobile" value={lead.mobile}/><Info label="Email" value={lead.email||'Not provided'}/><Info label="Contact Records" value={String(lead.contactActivities?.length||0)}/><Info label="Qualification" value={lead.qualification?'Complete':'Not completed'}/><Info label="Quotes / Proposals" value={String(lead.quotes?.length||0)}/><Info label="Application" value={lead.convertedApplicationId||'Not converted'}/></div>
        <Panel title="Lead Ownership"><form className="crm-inline-form" onSubmit={event=>{event.preventDefault();const owner=String(new FormData(event.currentTarget).get('owner'));updateWithEvent('Lead reassigned',`${lead.owner} → ${owner}`,{owner});onToast('Lead owner updated')}}><label>Owner<select name="owner" defaultValue={lead.owner}>{owners.map(owner=><option key={owner}>{owner}</option>)}</select></label><button className="tf-secondary">Save Owner</button></form></Panel>
        <Panel title="Set Follow-Up"><form className="crm-inline-form" onSubmit={event=>{event.preventDefault();const data=new FormData(event.currentTarget),followUp={dueAt:String(data.get('dueAt')),type:String(data.get('type')) as 'Call'|'Meeting'|'Email'|'Other',note:String(data.get('note'))};updateWithEvent('Follow-up set',`${followUp.type} · ${dateTime(followUp.dueAt)} · ${followUp.note}`,{followUp,nextAction:followUp.dueAt});onToast('Follow-up saved')}}><div className="tf-form-row"><label>Date & Time<input name="dueAt" type="datetime-local" defaultValue={lead.followUp?.dueAt} required/></label><label>Type<select name="type" defaultValue={lead.followUp?.type||'Call'}><option>Call</option><option>Meeting</option><option>Email</option><option>Other</option></select></label></div><label>Note<input name="note" defaultValue={lead.followUp?.note} required/></label><button className="tf-primary"><CalendarClock/> Save Follow-Up</button></form></Panel></>}
      {tab==='Activity'&&<Panel title="Activity Timeline"><Timeline items={lead.timeline}/></Panel>}
      {tab==='Notes'&&<Panel title="Lead Notes"><form className="crm-inline-form" onSubmit={event=>{event.preventDefault();const note=String(new FormData(event.currentTarget).get('note')).trim();if(!note)return;updateWithEvent('Note added',note,{notes:[note,...lead.notes]});event.currentTarget.reset();onToast('Note added')}}><label>Add Note<textarea name="note" required/></label><button className="tf-primary">Add Note</button></form><ul className="crm-notes">{lead.notes.map((note,index)=><li key={`${note}-${index}`}>{note}</li>)}</ul></Panel>}
      {tab==='Documents'&&<Panel title="Attached Documents" action={<label className="tf-secondary crm-upload"><Upload/> Attach<input type="file" onChange={attach}/></label>}><DataTable headers={['Document','File','Size','Uploaded']} empty={!lead.documents?.length}>{(lead.documents||[]).map(document=><tr key={document.id}><td>{document.name}</td><td><b>{document.fileName}</b></td><td>{Math.ceil(document.size/1024)} KB</td><td>{dateTime(document.uploadedAt)}</td></tr>)}</DataTable></Panel>}
      {tab==='Stage History'&&<Panel title="Stage History"><DataTable headers={['From','To','Changed','Changed By','Reason']} empty={!lead.stageHistory?.length}>{(lead.stageHistory||[]).map(change=><tr key={change.id}><td>{change.from||'Created'}</td><td><StatusBadge>{change.to}</StatusBadge></td><td>{dateTime(change.changedAt)}</td><td>{change.changedBy}</td><td>{change.reason||'—'}</td></tr>)}</DataTable></Panel>}
      {requiredAction==='contact'&&<ContactForm lead={lead} close={()=>setRequiredAction(undefined)} save={activity=>{updateWithEvent('Contact activity recorded',`${activity.type} · ${activity.outcome} · ${activity.notes}`,{contactActivities:[activity,...(lead.contactActivities||[])]});setRequiredAction(undefined);onToast('Contact activity recorded. The lead can now move to Contacted.')}}/>}
      {requiredAction==='qualification'&&<QualificationForm lead={lead} close={()=>setRequiredAction(undefined)} save={qualification=>{updateWithEvent('Qualification completed',`${qualification.intent} · ${qualification.budgetRange} · ${qualification.closureTimeline}`,{qualification,expectedValue:qualification.estimatedValue,followUp:{dueAt:qualification.nextFollowUp,type:'Call',note:qualification.notes},nextAction:qualification.nextFollowUp});setRequiredAction(undefined);onToast('Qualification recorded. The lead can now move to Qualified.')}}/>}
      {requiredAction==='quote'&&<QuoteForm lead={lead} close={()=>setRequiredAction(undefined)} save={(quote,document)=>{updateWithEvent('Quote / proposal recorded',`${quote.provider} · ${quote.reference} · ${money(quote.amount)}`,{quotes:[quote,...(lead.quotes||[])],documents:document?[document,...(lead.documents||[])]:lead.documents});setRequiredAction(undefined);onToast('Quote recorded. The lead can now move to Quote Raised.')}}/>}
      {showLost&&<LostForm close={()=>setShowLost(false)} save={(reason,remarks)=>{try{const updated=crmStageService.transition(lead,'Lost',reason,remarks);onUpdate(updated);setShowLost(false);onToast(`${lead.id} marked Lost`)}catch(error){onToast(error instanceof Error?error.message:'Lost reason and remarks are required.')}}}/>} 
    </div>
  </Modal>
}

function ContactForm({lead,close,save}:{lead:FranchiseeLead;close:()=>void;save:(activity:LeadContactActivity)=>void}){return <RequiredForm title="Record Contact Activity" close={close}><form className="tf-form crm-required-form" onSubmit={event=>{event.preventDefault();const data=new FormData(event.currentTarget);save({id:crypto.randomUUID(),type:String(data.get('type')) as LeadContactActivity['type'],occurredAt:String(data.get('occurredAt')),outcome:String(data.get('outcome')).trim(),notes:String(data.get('notes')).trim(),createdBy:'Franchise'})}}><div className="tf-form-row"><label>Contact Type<select name="type" required><option>Call</option><option>Meeting</option><option>WhatsApp / Message</option><option>Email</option><option>Contact Attempt</option></select></label><label>Date & Time<input name="occurredAt" type="datetime-local" required/></label></div><label>Outcome<input name="outcome" placeholder={`Outcome for ${lead.name}`} required/></label><label>Notes<textarea name="notes" required/></label><footer><button type="button" className="tf-secondary" onClick={close}>Cancel</button><button className="tf-primary">Save Contact Record</button></footer></form></RequiredForm>}

function QualificationForm({lead,close,save}:{lead:FranchiseeLead;close:()=>void;save:(qualification:LeadQualification)=>void}){return <RequiredForm title="Complete Qualification" close={close}><form className="tf-form crm-required-form" onSubmit={event=>{event.preventDefault();const data=new FormData(event.currentTarget);save({id:crypto.randomUUID(),requirementConfirmed:data.get('requirementConfirmed')==='on',productConfirmed:data.get('productConfirmed')==='on',estimatedValue:Number(data.get('estimatedValue')),intent:String(data.get('intent')),budgetRange:String(data.get('budgetRange')),closureTimeline:String(data.get('closureTimeline')),nextFollowUp:String(data.get('nextFollowUp')),notes:String(data.get('notes')),completedAt:now(),completedBy:'Franchise'})}}><div className="crm-check-row"><label><input name="requirementConfirmed" type="checkbox" required/> Requirement confirmed</label><label><input name="productConfirmed" type="checkbox" required/> Product interest confirmed</label></div><div className="tf-form-row"><label>Estimated Value<input name="estimatedValue" type="number" min="0" defaultValue={lead.expectedValue} required/></label><label>Intent / Need<input name="intent" required/></label></div><div className="tf-form-row"><label>Budget Range<input name="budgetRange" required/></label><label>Expected Closure Timeline<input name="closureTimeline" required/></label></div><label>Next Follow-Up<input name="nextFollowUp" type="datetime-local" required/></label><label>Qualification Notes<textarea name="notes" required/></label><footer><button type="button" className="tf-secondary" onClick={close}>Cancel</button><button className="tf-primary">Save Qualification</button></footer></form></RequiredForm>}

function QuoteForm({lead,close,save}:{lead:FranchiseeLead;close:()=>void;save:(quote:LeadQuote,document?:LeadDocument)=>void}){const [file,setFile]=useState<File>();return <RequiredForm title="Record Quote / Proposal" close={close}><form className="tf-form crm-required-form" onSubmit={event=>{event.preventDefault();const data=new FormData(event.currentTarget),createdAt=now();const document=file?{id:crypto.randomUUID(),name:'Quote / proposal',fileName:file.name,size:file.size,uploadedAt:createdAt}:undefined;save({id:crypto.randomUUID(),product:lead.product,provider:String(data.get('provider')),reference:String(data.get('reference')),amount:Number(data.get('amount')),quoteDate:String(data.get('quoteDate')),validUntil:String(data.get('validUntil')),notes:String(data.get('notes')),document,createdAt,createdBy:'Franchise'},document)}}><div className="tf-form-row"><label>Provider / Insurer<input name="provider" required/></label><label>Quote / Proposal Reference<input name="reference" required/></label></div><div className="tf-form-row"><label>Quoted Amount<input name="amount" type="number" min="0" required/></label><label>Quote Date<input name="quoteDate" type="date" required/></label></div><label>Valid Until<input name="validUntil" type="date" required/></label><label>Notes<textarea name="notes" required/></label><label>Proposal Document (optional)<input type="file" onChange={event=>setFile(event.target.files?.[0])}/></label><footer><button type="button" className="tf-secondary" onClick={close}>Cancel</button><button className="tf-primary">Save Quote / Proposal</button></footer></form></RequiredForm>}

function LostForm({close,save}:{close:()=>void;save:(reason:string,remarks:string)=>void}){return <RequiredForm title="Mark Lead as Lost" close={close}><form className="tf-form crm-required-form" onSubmit={event=>{event.preventDefault();const data=new FormData(event.currentTarget);save(String(data.get('reason')),String(data.get('remarks')).trim())}}><label>Lost Reason<select name="reason" required><option value="">Select reason</option><option>Not interested</option><option>Price / rate</option><option>Eligibility</option><option>Competitor selected</option><option>Unable to contact</option><option>Other</option></select></label><label>Remarks<textarea name="remarks" required/></label><footer><button type="button" className="tf-secondary" onClick={close}>Cancel</button><button className="tf-primary">Confirm Lost</button></footer></form></RequiredForm>}

function RequiredForm({title,close,children}:{title:string;close:()=>void;children:ReactNode}){return <section className="crm-required-shell"><header><h3>{title}</h3><button type="button" className="tf-text-btn" onClick={close}>Close</button></header>{children}</section>}
function Info({label,value}:{label:string;value:string}){return <div><span>{label}</span><b>{value}</b></div>}
