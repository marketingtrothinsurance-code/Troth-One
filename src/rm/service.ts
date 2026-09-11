import { currentRM, rmApplications, rmCustomers, rmFranchises, rmLeads, rmTickets, seedCommunications, seedEscalations, seedMaterials, seedTraining } from './data'
import type { RMCommunication, RMEscalation, RMIssueActivity, RMIssueComment, RMMaterial, RMTraining, RMUser } from './types'

const scoped=<T extends {franchiseId:string}>(rows:T[])=>rows.filter(row=>currentRM.allocatedFranchiseIds.includes(row.franchiseId))
const load=<T,>(key:string,fallback:T):T=>{try{const value=localStorage.getItem(key);return value?JSON.parse(value) as T:fallback}catch{return fallback}}
const save=<T,>(key:string,value:T)=>localStorage.setItem(key,JSON.stringify(value))

export const rmRepository={
 currentRM,
 profile:()=>({...load<RMUser>('troth-rm-profile',currentRM),id:currentRM.id,employeeId:currentRM.employeeId,designation:currentRM.designation,department:currentRM.department,branch:currentRM.branch,region:currentRM.region,reportingManager:currentRM.reportingManager,joiningDate:currentRM.joiningDate,status:currentRM.status,allocatedFranchiseIds:[...currentRM.allocatedFranchiseIds]}),
 franchises:()=>rmFranchises.filter(f=>currentRM.allocatedFranchiseIds.includes(f.id)),
 customers:()=>scoped(rmCustomers), leads:()=>scoped(rmLeads), applications:()=>scoped(rmApplications), tickets:()=>scoped(load('troth-rm-tickets',rmTickets)),
 escalations:()=>{
  const permittedApplications=new Set(scoped(rmApplications).map(row=>row.id))
  return load<any[]>('troth-rm-escalations',seedEscalations).filter(row=>permittedApplications.has(row.applicationId)).map((row,index)=>{
   const comments:RMIssueComment[]=(row.comments||[]).map((comment:string|RMIssueComment,commentIndex:number)=>typeof comment==='string'?{id:`CMT-${index}-${commentIndex}`,author:comment.includes('HO Operations')?'HO Operations':currentRM.name,role:comment.includes('HO Operations')?'Head Office Operations':'Relationship Manager',createdAt:row.updatedAt||row.raisedAt,text:comment}:comment)
   const activity:RMIssueActivity[]=row.activity||[{id:`ACT-${index}-1`,createdAt:row.raisedAt,text:`Issue raised by ${row.raisedBy||currentRM.name}`},{id:`ACT-${index}-2`,createdAt:row.raisedAt,text:`Assigned to ${row.assignedTo}`}]
   return {...row,assignedTo:row.assignedTo==='Franchise'?'Franchise':'Head Office Operations',raisedBy:row.raisedBy||currentRM.name,raisedByRole:row.raisedByRole||'Relationship Manager',updatedAt:row.updatedAt||row.raisedAt,comments,activity} as RMEscalation
  })
 },
 communications:()=>load<RMCommunication[]>('troth-rm-communications',seedCommunications).filter(row=>row.franchiseIds.every(id=>currentRM.allocatedFranchiseIds.includes(id))),
 materials:()=>load<RMMaterial[]>('troth-rm-materials',seedMaterials).filter(row=>row.franchiseIds.every(id=>currentRM.allocatedFranchiseIds.includes(id))), training:()=>load<RMTraining[]>('troth-rm-training',seedTraining).filter(row=>row.franchiseIds.every(id=>currentRM.allocatedFranchiseIds.includes(id))),
 saveEscalations:(rows:RMEscalation[])=>{
  const permittedApplications=new Set(scoped(rmApplications).map(row=>row.id))
  const hiddenRows=load<RMEscalation[]>('troth-rm-escalations',seedEscalations).filter(row=>!permittedApplications.has(row.applicationId))
  save('troth-rm-escalations',[...hiddenRows,...rows.filter(row=>permittedApplications.has(row.applicationId))])
 }, saveCommunications:(rows:RMCommunication[])=>save('troth-rm-communications',rows),
 saveMaterials:(rows:RMMaterial[])=>save('troth-rm-materials',rows), saveTraining:(rows:RMTraining[])=>save('troth-rm-training',rows), saveTickets:(rows:typeof rmTickets)=>save('troth-rm-tickets',scoped(rows)),
 saveProfile:(profile:RMUser)=>save('troth-rm-profile',{...profile,id:currentRM.id,employeeId:currentRM.employeeId,designation:currentRM.designation,department:currentRM.department,branch:currentRM.branch,region:currentRM.region,reportingManager:currentRM.reportingManager,joiningDate:currentRM.joiningDate,status:currentRM.status,allocatedFranchiseIds:[...currentRM.allocatedFranchiseIds]})
}
