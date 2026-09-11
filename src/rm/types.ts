import type { ProductType } from '../types'
import type { LeadStage } from '../franchisee/types'

export type SLAStatus = 'on-track' | 'attention' | 'overdue'
export type RMModule = 'dashboard'|'customers'|'leads'|'applications'|'support'|'franchises'|'communications'|'marketing'|'training'|'reports'|'profile'
export type Priority = 'Low'|'Normal'|'High'|'Critical'

export interface RMUser {
  id:string
  employeeId:string
  name:string
  designation:string
  department:string
  branch:string
  region:string
  reportingManager:string
  joiningDate:string
  status:'Active'|'Inactive'
  mobile:string
  alternateMobile?:string
  email:string
  address:string
  city:string
  state:string
  pinCode:string
  allocatedFranchiseIds:string[]
}
export interface RMFranchise { id:string; name:string; principal:string; city:string; mobile:string; email:string; status:'Active'|'Onboarding'|'Inactive'; customers:number; business:number; lastActivity:string; documents:{name:string;status:string}[]; team:{name:string;role:string;mobile:string;email:string;status:string}[] }
export interface RMCustomer { id:string; franchiseId:string; name:string; mobile:string; email:string; kyc:'Verified'|'Pending'|'Expired'; products:ProductType[]; value:number; lastActivity:string; status:'Active'|'Review due'|'Inactive' }
export interface RMLeadActivity { id:string; occurredAt:string; action:string; stage:LeadStage; user:string; notes?:string }
export interface RMLeadStageDetail { stage:LeadStage; enteredAt:string; completedAt?:string; handledBy:string; activity?:string; notes?:string; nextFollowUpAt?:string }
export interface RMLead { id:string; franchiseId:string; customer:string; mobile:string; email?:string; product:ProductType; source:string; owner:string; stage:LeadStage; value:number; created:string; createdAt:string; updated:string; lastActivityAt:string; nextFollowUpAt?:string; nextFollowUpNote?:string; age:number; attentionReason?:string; stageProgress:RMLeadStageDetail[]; timeline:string[]; activities:RMLeadActivity[] }
export type RMAssistanceType='Guidance'|'Franchise Follow-up'|'Customer Discussion Support'|'Documentation Support'|'Product / Policy Guidance'|'Quotation / Pricing Support'|'Escalation Support'|'Internal Coordination'|'Case Review'|'Other'
export type RMAssistancePriority='Normal'|'Important'|'Urgent'
export interface RMLeadAssistance {id:string;leadId:string;rmId:string;createdBy:string;assistanceType:RMAssistanceType;details:string;createdAt:string;followUpRequired:boolean;followUpAt?:string;followUpNote?:string;followUpStatus:'Not Required'|'Pending'|'Completed';priority:RMAssistancePriority}
export interface RMEscalation { id:string; applicationId:string; type:string; subject:string; description:string; assignedTo:string; priority:Priority; status:'Open'|'In Progress'|'Resolved'|'Closed'; raisedAt:string; comments:string[] }
export interface RMApplication { id:string; franchiseId:string; customer:string; product:ProductType; type:string; stage:string; pendingWith:'Head Office'|'Franchise'|'Provider'|'Customer'; owner:string; submitted:string; updated:string; age:number; queryDays?:number; documents:{name:string;status:string}[]; timeline:string[] }
export interface RMTicket { id:string; franchiseId:string; category:string; subject:string; related?:string; desk:string; status:'Open'|'In Progress'|'Waiting'|'Resolved'|'Closed'; priority:Priority; created:string; updated:string; age:number; messages:string[] }
export interface RMCommunication { id:string; title:string; type:string; message:string; url?:string; franchiseIds:string[]; created:string }
export interface RMMaterial { id:string; title:string; type:string; product:string; franchiseIds:string[]; uploaded:string }
export interface RMTraining { id:string; title:string; category:string; product:string; type:string; franchiseIds:string[]; completion:Record<string,number>; uploaded:string; status:'Published'|'Draft' }
export interface RMSLAConfig { onTrackMaxDays:number; attentionMaxDays:number; queryAttentionDays:number; overrides?:Record<string,Partial<Omit<RMSLAConfig,'overrides'>>> }
export interface RMFilters { search:string; franchiseId:string; product:string; status:string }
