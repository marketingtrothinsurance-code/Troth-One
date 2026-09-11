import type { RMApplication, RMEscalation, RMSLAConfig, SLAStatus } from './types'

export const defaultSLAConfig:RMSLAConfig={onTrackMaxDays:2,attentionMaxDays:5,queryAttentionDays:2,overrides:{Loans:{onTrackMaxDays:3,attentionMaxDays:6}}}

export function getSLAStatus(item:{age:number;product?:string;queryDays?:number;id?:string},config=defaultSLAConfig,escalations:RMEscalation[]=[]):SLAStatus {
  const rule={...config,...(item.product&&config.overrides?.[item.product]||{})}
  // A resolved issue remains flagged until the RM confirms the fix and closes it.
  const openEscalation=item.id&&escalations.some(e=>e.applicationId===item.id&&e.status!=='Closed')
  if(openEscalation||item.age>rule.attentionMaxDays)return'overdue'
  if(item.age>rule.onTrackMaxDays||(item.queryDays||0)>=rule.queryAttentionDays)return'attention'
  return'on-track'
}

export const slaRank:Record<SLAStatus,number>={overdue:0,attention:1,'on-track':2}
export const slaLabel:Record<SLAStatus,string>={overdue:'Overdue',attention:'Needs attention','on-track':'On track'}
export const applicationSLA=(item:RMApplication,escalations:RMEscalation[])=>getSLAStatus(item,defaultSLAConfig,escalations)
