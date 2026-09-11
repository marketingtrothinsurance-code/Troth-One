import type { FranchiseeLead, LeadStage, TimelineEvent } from '../types'

type ActiveLeadStage=Exclude<LeadStage,'Won'|'Lost'>
export const crmLeadStageFlow={active:['New','Contacted','Qualified','Quote Raised'] as const,won:'Won' as const,lost:'Lost' as const}
const nextStage:Record<ActiveLeadStage,LeadStage>={New:'Contacted',Contacted:'Qualified',Qualified:'Quote Raised','Quote Raised':'Won'}
const event=(title:string,detail:string):TimelineEvent=>({id:crypto.randomUUID(),title,detail,time:new Date().toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}),actor:'Franchise'})

export interface StageRequirement {next?:LeadStage;label:string;complete:boolean;message:string}

export const crmStageService={
  hasValidContact:(lead:FranchiseeLead)=>Boolean(lead.contactActivities?.some(item=>item.type&&item.outcome.trim()&&item.notes.trim()&&!Number.isNaN(new Date(item.occurredAt).getTime()))),
  hasValidQualification:(lead:FranchiseeLead)=>{const item=lead.qualification;return Boolean(item?.requirementConfirmed&&item.productConfirmed&&item.estimatedValue>0&&item.intent.trim()&&item.budgetRange.trim()&&item.closureTimeline.trim()&&item.notes.trim()&&!Number.isNaN(new Date(item.nextFollowUp).getTime()))},
  hasValidQuote:(lead:FranchiseeLead)=>Boolean(lead.quotes?.some(item=>item.provider.trim()&&item.reference.trim()&&item.amount>0&&item.notes.trim()&&!Number.isNaN(new Date(item.quoteDate).getTime())&&!Number.isNaN(new Date(item.validUntil).getTime()))),
  requirement:(lead:FranchiseeLead):StageRequirement=>{
    if(lead.stage==='New')return {next:'Contacted',label:'Log a valid contact activity',complete:crmStageService.hasValidContact(lead),message:'Complete a contact activity before moving this lead to Contacted.'}
    if(lead.stage==='Contacted')return {next:'Qualified',label:'Complete qualification',complete:crmStageService.hasValidQualification(lead),message:'Record the qualification outcome before moving this lead to Qualified.'}
    if(lead.stage==='Qualified')return {next:'Quote Raised',label:'Record a quote or proposal',complete:crmStageService.hasValidQuote(lead),message:'Add quote or proposal details before moving this lead to Quote Raised.'}
    if(lead.stage==='Quote Raised')return {next:'Won',label:'Convert to customer application',complete:Boolean(lead.convertedApplicationId),message:'Create the linked customer application before this lead can become Won.'}
    return {label:'Pipeline complete',complete:true,message:lead.stage==='Won'?'This lead was converted successfully.':'This lead is closed as Lost.'}
  },
  transition:(lead:FranchiseeLead,to:LeadStage,reason?:string,lostNotes?:string):FranchiseeLead=>{
    if(['Won','Lost'].includes(lead.stage))throw new Error('Closed leads cannot change stage.')
    if(to==='Lost'){
      if(!reason?.trim()||!lostNotes?.trim())throw new Error('Lost reason and remarks are required.')
    }else{
      const expected=nextStage[lead.stage as keyof typeof nextStage]
      if(to!==expected)throw new Error(`The next valid stage is ${expected}. Stages cannot be skipped.`)
      const requirement=crmStageService.requirement(lead)
      if(!requirement.complete)throw new Error(requirement.message)
    }
    const changedAt=new Date().toISOString(),detail=to==='Lost'?`${lead.stage} → Lost · ${reason}: ${lostNotes}`:`${lead.stage} → ${to}`
    const stageEvent=event('Stage changed',detail)
    return {...lead,stage:to,lostReason:to==='Lost'?reason:lead.lostReason,lostNotes:to==='Lost'?lostNotes:lead.lostNotes,updatedAt:changedAt,timeline:[stageEvent,...lead.timeline],stageHistory:[{id:crypto.randomUUID(),from:lead.stage,to,changedAt,changedBy:'Franchise',reason:to==='Lost'?`${reason}: ${lostNotes}`:undefined,relatedActivityId:stageEvent.id},...(lead.stageHistory||[])]}
  }
}
