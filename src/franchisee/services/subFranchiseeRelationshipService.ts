import type { FranchiseeAgent } from '../agentOnboarding'
import type { FranchiseeEmployee } from '../employees'

export interface SubFranchiseeAssignment {
  subFranchiseeId:string
  employeeIds:string[]
  agentIds:string[]
}

const STORAGE_KEY='troth-sub-franchisee-assignments-v1'

const read=():SubFranchiseeAssignment[]=>{
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]') as SubFranchiseeAssignment[]}
  catch{return []}
}

export const subFranchiseeRelationshipService={
  employees:(subFranchiseeId:string,employees:FranchiseeEmployee[])=>{
    const mapped=new Set(read().find(item=>item.subFranchiseeId===subFranchiseeId)?.employeeIds||[])
    return employees.filter(employee=>employee.subFranchiseeId===subFranchiseeId||mapped.has(employee.id))
  },
  agents:(subFranchiseeId:string,agents:FranchiseeAgent[])=>{
    const mapped=new Set(read().find(item=>item.subFranchiseeId===subFranchiseeId)?.agentIds||[])
    return agents.filter(agent=>agent.subFranchiseeId===subFranchiseeId||mapped.has(agent.id))
  }
}
