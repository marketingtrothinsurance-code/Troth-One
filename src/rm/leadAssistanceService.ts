import { currentRM, rmLeads } from './data'
import type { RMLeadAssistance, RMAssistancePriority, RMAssistanceType } from './types'

const STORAGE_KEY='troth-rm-lead-assistance'
const allocatedLeadIds=new Set(rmLeads.filter(lead=>currentRM.allocatedFranchiseIds.includes(lead.franchiseId)).map(lead=>lead.id))

const seed:RMLeadAssistance[]=[
 {id:'RMA-1001',leadId:'TL-2200',rmId:currentRM.id,createdBy:currentRM.name,assistanceType:'Documentation Support',details:'Advised the Franchisee to collect the latest income proof and six-month bank statement before the next customer discussion.',createdAt:'2026-09-10T05:15:00.000Z',followUpRequired:true,followUpAt:'2026-09-12T05:30:00.000Z',followUpNote:'Confirm whether the updated documents were received.',followUpStatus:'Pending',priority:'Important'},
 {id:'RMA-1002',leadId:'TL-2198',rmId:currentRM.id,createdBy:currentRM.name,assistanceType:'Product / Policy Guidance',details:'Shared product-positioning guidance with the Franchisee and clarified how to explain the relevant benefits without changing the customer commitment or lead stage.',createdAt:'2026-09-09T09:20:00.000Z',followUpRequired:false,followUpStatus:'Not Required',priority:'Normal'}
]

const read=():RMLeadAssistance[]=>{try{const stored=localStorage.getItem(STORAGE_KEY);return stored?JSON.parse(stored) as RMLeadAssistance[]:seed}catch{return seed}}
const write=(records:RMLeadAssistance[])=>localStorage.setItem(STORAGE_KEY,JSON.stringify(records))

interface CreateInput {leadId:string;assistanceType:RMAssistanceType;details:string;followUpRequired:boolean;followUpAt?:string;followUpNote?:string;priority:RMAssistancePriority}

export const leadAssistanceService={
 listAll:()=>read().filter(record=>allocatedLeadIds.has(record.leadId)),
 create:async(input:CreateInput,actor:{role:string;id:string;name:string})=>{
  if(actor.role!=='rm'||actor.id!==currentRM.id)throw new Error('Only the allocated Relationship Manager can add assistance.')
  if(!allocatedLeadIds.has(input.leadId))throw new Error('This lead is outside the RM allocation.')
  if(!input.assistanceType||!input.details.trim())throw new Error('Assistance type and details are required.')
  if(input.followUpRequired&&!input.followUpAt)throw new Error('Follow-up date and time are required.')
  const record:RMLeadAssistance={id:`RMA-${Date.now()}`,leadId:input.leadId,rmId:actor.id,createdBy:actor.name,assistanceType:input.assistanceType,details:input.details.trim(),createdAt:new Date().toISOString(),followUpRequired:input.followUpRequired,followUpAt:input.followUpRequired?input.followUpAt:undefined,followUpNote:input.followUpRequired?input.followUpNote?.trim()||undefined:undefined,followUpStatus:input.followUpRequired?'Pending':'Not Required',priority:input.priority}
  await Promise.resolve()
  write([record,...read()])
  return record
 }
}
