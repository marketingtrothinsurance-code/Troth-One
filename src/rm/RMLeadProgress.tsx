import { Check, Clock3, X } from 'lucide-react'
import { crmLeadStageFlow } from '../franchisee/services/crmStageService'
import type { LeadStage } from '../franchisee/types'
import type { RMLead } from './types'

const dateTime=(value?:string)=>value?new Date(value).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'Not recorded'
const duration=(entered:string,completed?:string)=>{const end=completed?new Date(completed):new Date(),days=Math.max(0,Math.floor((end.getTime()-new Date(entered).getTime())/86400000));return days===0?'Less than a day':`${days} day${days===1?'':'s'}`}

export function RMLeadProgress({lead}:{lead:RMLead}){
 const stages:LeadStage[]=[...crmLeadStageFlow.active,lead.stage==='Lost'?crmLeadStageFlow.lost:crmLeadStageFlow.won]
 return <section className="rm-lead-progress-section">
  <div className="rm-lead-section-head"><div><h3>Lead Progress</h3><p>Franchise CRM stage history</p></div><span>{lead.stage==='Lost'?'Closed path':'Standard conversion path'}</span></div>
  <div className="rm-lead-stepper">{stages.map(stage=>{const detail=lead.stageProgress.find(item=>item.stage===stage),current=lead.stage===stage,complete=Boolean(detail?.completedAt)||['Won','Lost'].includes(stage)&&current,state=current?'current':complete?'completed':'upcoming';return <div className={`rm-lead-step ${state} ${stage==='Lost'?'lost':''}`} key={stage}><div className="rm-lead-step-marker">{stage==='Lost'&&current?<X/>:stage==='Won'&&current||complete&&!current?<Check/>:current?<Clock3/>:<span/>}</div><div><b>{stage}</b><small>{current?'Current Stage':complete?'Completed':'Upcoming'}</small>{detail&&<em>{dateTime(current?detail.enteredAt:detail.completedAt)}</em>}</div></div>})}</div>
  <div className="rm-lead-stage-details">{lead.stageProgress.map(item=><article className={item.stage===lead.stage?'current':''} key={`${item.stage}-${item.enteredAt}`}><header><span>{item.stage}</span>{item.stage===lead.stage&&<b>Current Stage</b>}</header><dl><div><dt>Entered</dt><dd>{dateTime(item.enteredAt)}</dd></div><div><dt>{item.completedAt?'Completed':'Time in stage'}</dt><dd>{item.completedAt?dateTime(item.completedAt):duration(item.enteredAt)}</dd></div><div><dt>Handled by</dt><dd>{item.handledBy}</dd></div>{item.activity&&<div><dt>Activity</dt><dd>{item.activity}</dd></div>}{item.notes&&<div><dt>Remarks</dt><dd>{item.notes}</dd></div>}{item.nextFollowUpAt&&<div><dt>Next follow-up</dt><dd>{dateTime(item.nextFollowUpAt)}</dd></div>}</dl></article>)}</div>
 </section>
}
