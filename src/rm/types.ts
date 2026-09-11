import type { ProductType } from '../types'

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
export interface RMLead { id:string; franchiseId:string; customer:string; product:ProductType; source:string; owner:string; stage:string; value:number; created:string; updated:string; age:number; timeline:string[] }
export interface RMEscalation { id:string; applicationId:string; type:string; subject:string; description:string; assignedTo:string; priority:Priority; status:'Open'|'In Progress'|'Resolved'|'Closed'; raisedAt:string; comments:string[] }
export interface RMApplication { id:string; franchiseId:string; customer:string; product:ProductType; type:string; stage:string; pendingWith:'Head Office'|'Franchise'|'Provider'|'Customer'; owner:string; submitted:string; updated:string; age:number; queryDays?:number; documents:{name:string;status:string}[]; timeline:string[] }
export interface RMTicket { id:string; franchiseId:string; category:string; subject:string; related?:string; desk:string; status:'Open'|'In Progress'|'Waiting'|'Resolved'|'Closed'; priority:Priority; created:string; updated:string; age:number; messages:string[] }
export interface RMCommunication { id:string; title:string; type:string; message:string; url?:string; franchiseIds:string[]; created:string }
export interface RMMaterial { id:string; title:string; type:string; product:string; franchiseIds:string[]; uploaded:string }
export interface RMTraining { id:string; title:string; category:string; product:string; type:string; franchiseIds:string[]; completion:Record<string,number>; uploaded:string; status:'Published'|'Draft' }
export interface RMSLAConfig { onTrackMaxDays:number; attentionMaxDays:number; queryAttentionDays:number; overrides?:Record<string,Partial<Omit<RMSLAConfig,'overrides'>>> }
export interface RMFilters { search:string; franchiseId:string; product:string; status:string }
