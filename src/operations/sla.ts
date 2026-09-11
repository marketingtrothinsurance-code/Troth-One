import type { OpsCase,OpsSLAConfig,SLAStatus } from './types'
export const opsSLAConfig:OpsSLAConfig={onTrackMaxDays:2,attentionMaxDays:5,overrides:{'Wealth Operations':{onTrackMaxDays:3,attentionMaxDays:6}}}
export function getAgeingStatus(item:Pick<OpsCase,'age'|'desk'>,config=opsSLAConfig):SLAStatus{const rule=config.overrides[item.desk]||config;return item.age>rule.attentionMaxDays?'overdue':item.age>rule.onTrackMaxDays?'attention':'on-track'}
export const slaLabel:Record<SLAStatus,string>={'on-track':'On track',attention:'Needs attention',overdue:'Overdue'}
export const slaRank:Record<SLAStatus,number>={overdue:0,attention:1,'on-track':2}
