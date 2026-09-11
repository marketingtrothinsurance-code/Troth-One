import { operationsSeed,productDeskConfig } from './data'
import type { CounterOffer,OpsCase,OpsQuery,OpsStage,OpsStore,OpsUser } from './types'
const KEY='troth-operations-workspace-v1'
const clone=<T,>(v:T):T=>JSON.parse(JSON.stringify(v)) as T
const read=():OpsStore=>{try{const raw=localStorage.getItem(KEY);return raw?JSON.parse(raw) as OpsStore:clone(operationsSeed)}catch{return clone(operationsSeed)}}
const write=(store:OpsStore)=>localStorage.setItem(KEY,JSON.stringify(store))
const stamp=()=>new Date().toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})
export const operationsRepository={
 load:read,save:write,reset:()=>write(clone(operationsSeed)),productDeskConfig,
 scoped(store:OpsStore){const u=store.user;return store.cases.filter(c=>(u.scope==='all'||u.allocatedFranchiseIds.includes(c.franchiseId))&&u.authorisedDesks.includes(c.desk))},
 updateCase(store:OpsStore,id:string,patch:Partial<OpsCase>,action:string,note:string){const next=clone(store),row=next.cases.find(c=>c.id===id);if(!row)return store;Object.assign(row,patch,{updatedAt:stamp()});row.timeline.unshift({id:`EV-${Date.now()}`,at:stamp(),actor:next.user.name,role:'Operations',action,note});write(next);return next},
 setStage(store:OpsStore,id:string,stage:OpsStage){return this.updateCase(store,id,{stage},'Status updated',`Case moved to ${stage}`)},
 raiseQuery(store:OpsStore,caseId:string,draft:Omit<OpsQuery,'id'|'caseId'|'status'|'raisedAt'|'raisedBy'|'rmComments'|'documents'|'updatedAt'>){const next=clone(store),id=`Q-${Date.now().toString().slice(-6)}`,now=stamp();next.queries.unshift({...draft,id,caseId,status:'Open',raisedAt:now,raisedBy:next.user.name,rmComments:[],documents:[],updatedAt:now});const row=next.cases.find(c=>c.id===caseId);if(row){row.queryIds.unshift(id);row.stage='Query Raised';row.pendingAction='Awaiting franchise response';row.timeline.unshift({id:`EV-${Date.now()}`,at:now,actor:next.user.name,role:'Operations',action:'Query raised',note:draft.subject})}write(next);return next},
 updateQuery(store:OpsStore,id:string,status:OpsQuery['status'],note:string){const next=clone(store),q=next.queries.find(x=>x.id===id);if(!q)return store;q.status=status;q.updatedAt=stamp();const row=next.cases.find(c=>c.id===q.caseId);if(row){row.stage=status==='Closed'?'Query Resolved':'Query Raised';row.pendingAction=status==='Closed'?'Continue processing':'Awaiting franchise response';row.timeline.unshift({id:`EV-${Date.now()}`,at:stamp(),actor:next.user.name,role:'Operations',action:`Query ${status.toLowerCase()}`,note})}write(next);return next},
 saveOffer(store:OpsStore,id:string,offer:CounterOffer){return this.updateCase(store,id,{counterOffer:offer},'Counter offer sent',`Revised value ₹${offer.revisedValue.toLocaleString('en-IN')}`)},
 saveUser(store:OpsStore,user:OpsUser){const next={...clone(store),user};write(next);return next}
}
