import { currentRM } from './data'
import type { RMInquiry, RMInquiryAction } from './types'

const STORAGE_KEY='troth-rm-inquiries'
const seed:RMInquiry[]=[
 {id:'INQ-3084',customerId:'TC-1048',customerName:'Aarav Shah',mobile:'+91 9824000000',email:'aarav.shah@example.in',franchiseId:'FR-0101',assignedRMId:currentRM.id,assignedRMName:currentRM.name,inquiryType:'Product Inquiry',source:'Customer App',productService:'Mutual Fund',subject:'SIP portfolio review',details:'Customer wants help choosing an appropriate SIP amount and understanding the next steps.',receivedAt:'2026-09-11T04:35:00.000Z',status:'Open',activities:[{id:'IA-3084-1',action:'Comment Added',user:'Neha Patel',role:'Franchise',createdAt:'2026-09-11T05:05:00.000Z',remarks:'Requested RM support for the product discussion.'}]},
 {id:'INQ-3079',customerId:'TC-1053',customerName:'Ishita Rao',mobile:'+91 9824003655',email:'ishita.rao@example.in',franchiseId:'FR-0105',inquiryType:'Call Back',source:'Call Me Back',productService:'Loans',subject:'Business loan eligibility',details:'Customer requested a call to understand indicative eligibility and documentation.',receivedAt:'2026-09-10T07:20:00.000Z',status:'Open',activities:[]},
 {id:'INQ-3072',customerId:'TC-1058',customerName:'Ishaan Dave',mobile:'+91 9824007310',franchiseId:'FR-0109',inquiryType:'Service Inquiry',source:'Endorsement / Service',productService:'Insurance',subject:'Nominee update guidance',details:'Customer needs guidance on the documents required for a nominee update.',receivedAt:'2026-09-08T09:40:00.000Z',status:'Open',activities:[{id:'IA-3072-1',action:'Call Logged',user:'Aditi Vora',role:'Franchise',createdAt:'2026-09-08T11:10:00.000Z',remarks:'Initial requirement confirmed with customer.'}]},
 {id:'INQ-3068',customerName:'Diya Bhatt',mobile:'+91 9824010965',email:'diya.bhatt@example.in',assignedRMId:currentRM.id,assignedRMName:currentRM.name,inquiryType:'Direct RM Inquiry',source:'Phone / Manual',productService:'Advisory',subject:'Financial planning discussion',details:'Direct inquiry assigned to the RM for an initial needs discussion.',receivedAt:'2026-09-07T06:15:00.000Z',status:'Open',activities:[]},
 {id:'INQ-2999',customerName:'Restricted Customer',mobile:'-',franchiseId:'FR-9999',assignedRMId:'RM-999',assignedRMName:'Other RM',inquiryType:'Product Inquiry',source:'Customer App',productService:'Loans',subject:'Out-of-scope inquiry',details:'This record must never appear for the logged-in RM.',receivedAt:'2026-09-11T03:00:00.000Z',status:'Open',activities:[]}
]

const read=():RMInquiry[]=>{try{const stored=localStorage.getItem(STORAGE_KEY);return stored?JSON.parse(stored) as RMInquiry[]:seed}catch{return seed}}
const write=(items:RMInquiry[])=>localStorage.setItem(STORAGE_KEY,JSON.stringify(items))
const allowed=(item:RMInquiry)=>Boolean(item.franchiseId&&currentRM.allocatedFranchiseIds.includes(item.franchiseId))||item.assignedRMId===currentRM.id
const change=(id:string,action:RMInquiryAction,remarks:string,followUpAt?:string,status?:RMInquiry['status'])=>{
 const items=read(),target=items.find(item=>item.id===id)
 if(!target||!allowed(target))throw new Error('This inquiry is outside the RM allocation.')
 const createdAt=new Date().toISOString(),activity={id:`IA-${Date.now()}`,action,user:currentRM.name,role:'Relationship Manager',createdAt,remarks:remarks.trim(),followUpAt}
 const next=items.map(item=>item.id===id?{...item,status:status||item.status,activities:[activity,...item.activities]}:item)
 write(next)
 return next.find(item=>item.id===id) as RMInquiry
}

export const rmInquiryService={
 list:()=>read().filter(allowed),
 recordOpen:(id:string)=>change(id,'Inquiry Opened','Inquiry details reviewed by RM.'),
 addAction:(id:string,action:Exclude<RMInquiryAction,'Inquiry Opened'|'Status Changed'>,remarks:string,followUpAt?:string)=>change(id,action,remarks,followUpAt),
 close:(id:string,remarks:string)=>change(id,'Status Changed',remarks,undefined,'Closed')
}
