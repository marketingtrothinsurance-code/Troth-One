import { buildFranchiseeRenewals, renewalPriority } from '../franchisee/renewalsData'
import type { FranchiseeCustomer } from '../franchisee/types'
import { currentRM, rmApplications, rmCustomers, rmFranchises } from './data'
import type { RMRenewal, RMRenewalActivityType } from './types'

const STORAGE_KEY='troth-rm-renewal-activity'
const allocatedCustomers=rmCustomers.filter(customer=>currentRM.allocatedFranchiseIds.includes(customer.franchiseId))
const franchiseName=(id:string)=>rmFranchises.find(item=>item.id===id)?.name||'Responsible Franchise'
const franchiseeCompatible:FranchiseeCustomer[]=allocatedCustomers.map(customer=>({id:customer.id,name:customer.name,mobile:customer.mobile,email:customer.email,city:'',kyc:customer.kyc,relationshipValue:customer.value,performance:0,products:customer.products,lastActivity:customer.lastActivity,tags:[],documents:[],timeline:[]}))
const sourceRenewals=buildFranchiseeRenewals(franchiseeCompatible,[])
const baseRenewals:RMRenewal[]=sourceRenewals.map(source=>{
 const customer=allocatedCustomers.find(item=>item.id===source.customerId)!
 const linked=rmApplications.find(item=>item.customer===source.customerName&&item.product===source.product&&item.type==='Renewal')
 const status:RMRenewal['status']=linked?.status==='Completed'?'Renewed':source.status==='Overdue'?'Overdue':linked?'Renewal Initiated':'Live'
 const generatedAt=new Date(new Date(`${source.renewalDueDate}T00:00:00`).getTime()-90*86_400_000).toISOString()
 const linkedActivity:RMRenewal['activities']=linked?[{id:`RA-${source.id}-started`,type:'Renewal Started',createdAt:new Date(linked.submitted).toISOString(),user:franchiseName(customer.franchiseId),role:'Franchise',remarks:`Renewal case ${linked.id} entered the existing application workflow.`},...(linked.status==='Completed'?[{id:`RA-${source.id}-completed`,type:'Renewal Completed' as const,createdAt:new Date(linked.updated).toISOString(),user:'TROTH ONE',role:'System',remarks:`Linked renewal case ${linked.id} was completed.`}]:[])]:[]
 return {...source,mobile:customer.mobile,email:customer.email,franchiseId:customer.franchiseId,status,caseId:linked?.id,notes:[],activities:[...linkedActivity,{id:`RA-${source.id}-1`,type:'Franchise Notified',createdAt:generatedAt,user:'TROTH ONE',role:'System',remarks:'Renewal reminder made available to the responsible Franchise.'},{id:`RA-${source.id}-2`,type:'Renewal Generated',createdAt:generatedAt,user:'TROTH ONE',role:'System',remarks:'Renewal monitoring record generated from the existing customer relationship.'}]}
})
const allowedIds=new Set(baseRenewals.map(item=>item.id))
const readActivity=():Record<string,RMRenewal['activities']>=>{try{const stored=localStorage.getItem(STORAGE_KEY);return stored?JSON.parse(stored) as Record<string,RMRenewal['activities']>: {}}catch{return {}}}
const writeActivity=(value:Record<string,RMRenewal['activities']>)=>localStorage.setItem(STORAGE_KEY,JSON.stringify(value))
const list=()=>{const saved=readActivity();return baseRenewals.map(item=>({...item,activities:[...(saved[item.id]||[]),...item.activities]}))}
const record=(id:string,type:RMRenewalActivityType,remarks:string,followUpAt?:string)=>{
 if(!allowedIds.has(id))throw new Error('This renewal is outside the RM allocation.')
 const saved=readActivity(),activity={id:`RA-${Date.now()}`,type,createdAt:new Date().toISOString(),user:currentRM.name,role:'Relationship Manager',remarks:remarks.trim(),followUpAt}
 saved[id]=[activity,...(saved[id]||[])];writeActivity(saved)
 return list().find(item=>item.id===id) as RMRenewal
}

export const rmRenewalService={
 list,
 urgency:(item:RMRenewal)=>item.status==='Renewed'||item.status==='Lost'?'green' as const:renewalPriority(item.daysRemaining),
 recordView:(id:string)=>record(id,'RM Viewed','Renewal details reviewed by RM.'),
 nudge:(id:string)=>record(id,'RM Nudge Sent','Reminder recorded for the responsible Franchise. No external message was simulated.'),
 addActivity:(id:string,type:Extract<RMRenewalActivityType,'Call Logged'|'Follow-Up Added'|'Comment Added'>,remarks:string,followUpAt?:string)=>record(id,type,remarks,followUpAt)
}
