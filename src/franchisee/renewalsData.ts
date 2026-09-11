import type { FranchiseeCase, FranchiseeCustomer } from './types'

export type RenewalStatus='Upcoming'|'Due Soon'|'Overdue'|'Renewal Initiated'
export interface FranchiseeRenewal {
  id:string
  customerId:string
  customerName:string
  product:string
  policyNumber:string
  provider:string
  currentPremium:number
  renewalDueDate:string
  daysRemaining:number
  status:RenewalStatus
  caseId?:string
}

const day=86_400_000
const providerByProduct:Record<string,string>={
  'Health Insurance':'Care Health Insurance',
  'Term Insurance':'HDFC Life',
  'Motor Insurance':'ICICI Lombard',
  'Home Loan':'HDFC Bank',
  'Business Loan':'Axis Bank',
  'Personal Loan':'ICICI Bank',
  'Loan Protector':'Tata AIA',
  'Mutual Fund':'HDFC Mutual Fund',
  PMS:'Marcellus Investment Managers',
  AIF:'360 ONE Asset Management'
}
const offsets=[-8,9,24,38,53,67,79,88]
const startOfToday=()=>{const value=new Date();value.setHours(0,0,0,0);return value}
const iso=(value:Date)=>`${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,'0')}-${String(value.getDate()).padStart(2,'0')}`
const daysUntil=(date:string,today:Date)=>Math.ceil((new Date(`${date}T00:00:00`).getTime()-today.getTime())/day)
const statusFor=(days:number):RenewalStatus=>days<0?'Overdue':days<=30?'Due Soon':'Upcoming'

export function buildFranchiseeRenewals(customers:FranchiseeCustomer[],cases:FranchiseeCase[]):FranchiseeRenewal[]{
  const today=startOfToday()
  const recorded=customers.flatMap(customer=>(customer.profile360?.policies||[]).filter(policy=>policy.renewalDate).map(policy=>({customer,policy})))
  const actual:FranchiseeRenewal[]=recorded.map(({customer,policy})=>{const linked=cases.find(item=>item.transactionType==='Renewal'&&item.originalReference===policy.policyNumber),daysRemaining=daysUntil(policy.renewalDate,today);return{id:`REN-${policy.id}`,customerId:customer.id,customerName:customer.name,product:policy.planName||policy.category,policyNumber:policy.policyNumber,provider:policy.insurer,currentPremium:policy.premiumAmount||0,renewalDueDate:policy.renewalDate,daysRemaining,status:linked?'Renewal Initiated':statusFor(daysRemaining),caseId:linked?.id}})
  const legacy=customers.filter(customer=>!customer.profile360?.policies.length).flatMap((customer,customerIndex)=>customer.products.slice(0,2).map((product,productIndex)=>{const sequence=customerIndex*2+productIndex,offset=offsets[sequence%offsets.length],due=new Date(today.getTime()+offset*day),reference=`${product.replace(/[^A-Z0-9]/gi,'').slice(0,4).toUpperCase()}-${customer.id.replace(/\D/g,'').slice(-4)}-${String(productIndex+1).padStart(2,'0')}`,linked=cases.find(item=>item.transactionType==='Renewal'&&item.originalReference===reference);return{id:`REN-${customer.id}-${productIndex+1}`,customerId:customer.id,customerName:customer.name,product,policyNumber:reference,provider:providerByProduct[product]||'Partner Provider',currentPremium:Math.max(2400,Math.round((customer.relationshipValue*.0025+(sequence+1)*1750)/100)*100),renewalDueDate:iso(due),daysRemaining:offset,status:linked?'Renewal Initiated':statusFor(offset),caseId:linked?.id}}))
  return [...actual,...legacy].sort((a,b)=>a.daysRemaining-b.daysRemaining)
}

export const renewalPriority=(days:number):'green'|'amber'|'red'=>days>60?'green':days>30?'amber':'red'
