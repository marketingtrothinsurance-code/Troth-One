import type { LeadStage } from '../franchisee/types'
import type { RMLead } from './types'

export const leadMonitoringConfig={
  stageAttentionDays:{New:3,Contacted:5,Qualified:6,'Quote Raised':5,Won:Number.POSITIVE_INFINITY,Lost:Number.POSITIVE_INFINITY} satisfies Record<LeadStage,number>,
  noActivityDays:5,
}

export type LeadAttention={label:string;tone:'amber'|'red'}

const daysSince=(value:string,now:Date)=>Math.max(0,Math.floor((now.getTime()-new Date(value).getTime())/86400000))

export const getLeadAttention=(lead:RMLead,now=new Date()):LeadAttention|undefined=>{
  if(['Won','Lost'].includes(lead.stage))return undefined
  if(lead.nextFollowUpAt&&new Date(lead.nextFollowUpAt).getTime()<now.getTime())return {label:'Follow-up Overdue',tone:'red'}
  if(lead.attentionReason)return {label:lead.attentionReason,tone:'amber'}
  if(lead.age>=leadMonitoringConfig.stageAttentionDays[lead.stage])return {label:'Stuck at Stage',tone:'red'}
  if(daysSince(lead.lastActivityAt,now)>=leadMonitoringConfig.noActivityDays)return {label:'No Recent Activity',tone:'amber'}
  return undefined
}

export const isAwaitingFollowUp=(lead:RMLead)=>Boolean(lead.nextFollowUpAt&&!['Won','Lost'].includes(lead.stage))

