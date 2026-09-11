import { seededCustomerGoals, type CustomerGoal } from '../data/customerGoalsData'

const storageKey='troth-customer-goals'
const cloneSeeds=()=>seededCustomerGoals.map(goal=>({...goal}))

export const customerGoalsRepository={
  load():CustomerGoal[]{
    try{
      const stored=localStorage.getItem(storageKey)
      if(!stored)return cloneSeeds()
      const goals:unknown=JSON.parse(stored)
      return Array.isArray(goals)?goals as CustomerGoal[]:cloneSeeds()
    }catch{return cloneSeeds()}
  },
  save(goals:CustomerGoal[]){
    try{localStorage.setItem(storageKey,JSON.stringify(goals))}catch{/* Best-effort persistence for this prototype. */}
  }
}
