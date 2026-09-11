import { currentRM, rmApplications, rmCustomers, rmFranchises, rmLeads, rmTickets, seedCommunications, seedEscalations, seedMaterials, seedTraining } from './data'
import type { RMCommunication, RMEscalation, RMMaterial, RMTraining, RMUser } from './types'

const scoped=<T extends {franchiseId:string}>(rows:T[])=>rows.filter(row=>currentRM.allocatedFranchiseIds.includes(row.franchiseId))
const load=<T,>(key:string,fallback:T):T=>{try{const value=localStorage.getItem(key);return value?JSON.parse(value) as T:fallback}catch{return fallback}}
const save=<T,>(key:string,value:T)=>localStorage.setItem(key,JSON.stringify(value))

export const rmRepository={
 currentRM,
 profile:()=>({...load<RMUser>('troth-rm-profile',currentRM),id:currentRM.id,employeeId:currentRM.employeeId,designation:currentRM.designation,department:currentRM.department,branch:currentRM.branch,region:currentRM.region,reportingManager:currentRM.reportingManager,joiningDate:currentRM.joiningDate,status:currentRM.status,allocatedFranchiseIds:[...currentRM.allocatedFranchiseIds]}),
 franchises:()=>rmFranchises.filter(f=>currentRM.allocatedFranchiseIds.includes(f.id)),
 customers:()=>scoped(rmCustomers), leads:()=>scoped(rmLeads), applications:()=>scoped(rmApplications), tickets:()=>scoped(load('troth-rm-tickets',rmTickets)),
 escalations:()=>load<RMEscalation[]>('troth-rm-escalations',seedEscalations),
 communications:()=>load<RMCommunication[]>('troth-rm-communications',seedCommunications).filter(row=>row.franchiseIds.every(id=>currentRM.allocatedFranchiseIds.includes(id))),
 materials:()=>load<RMMaterial[]>('troth-rm-materials',seedMaterials).filter(row=>row.franchiseIds.every(id=>currentRM.allocatedFranchiseIds.includes(id))), training:()=>load<RMTraining[]>('troth-rm-training',seedTraining).filter(row=>row.franchiseIds.every(id=>currentRM.allocatedFranchiseIds.includes(id))),
 saveEscalations:(rows:RMEscalation[])=>save('troth-rm-escalations',rows), saveCommunications:(rows:RMCommunication[])=>save('troth-rm-communications',rows),
 saveMaterials:(rows:RMMaterial[])=>save('troth-rm-materials',rows), saveTraining:(rows:RMTraining[])=>save('troth-rm-training',rows), saveTickets:(rows:typeof rmTickets)=>save('troth-rm-tickets',scoped(rows)),
 saveProfile:(profile:RMUser)=>save('troth-rm-profile',{...profile,id:currentRM.id,employeeId:currentRM.employeeId,designation:currentRM.designation,department:currentRM.department,branch:currentRM.branch,region:currentRM.region,reportingManager:currentRM.reportingManager,joiningDate:currentRM.joiningDate,status:currentRM.status,allocatedFranchiseIds:[...currentRM.allocatedFranchiseIds]})
}
