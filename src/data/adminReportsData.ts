import { adminBusinessPeriodFixtures, type BusinessPeriod } from './adminBusinessData'
import type { AdminCustomer } from './adminCustomersData'
import type { AdminPartner, AdminProduct } from './adminProductsPartnersData'
import type { Application, Franchisee, ProductType } from '../types'

export type ReportPeriod='Today'|'Yesterday'|'This Week'|'This Month'|'This Quarter'
export interface ReportFilters { period:ReportPeriod; product:string; franchisee:string; rm:string; partner:string; city:string; status:string }
export interface ReportSummary { businessValue:number; previousBusiness:number; growthPercent:number; applications:number; conversionPercent:number; activeFranchisees:number; totalFranchisees:number; slaPercent:number }
export interface ProductReportMetric { product:string; businessValue:number; applications:number; completed:number; pending:number; delayed:number; conversionPercent:number; contributionPercent:number; growthPercent:number; sellingFranchisees:number }
export interface FranchiseeReportMetric { franchiseeName:string; city:string; rm:string; businessValue:number; applications:number; conversionPercent:number; growthPercent:number; delayedCases:number; customers:number; status:'Healthy'|'Watch'|'Needs Attention' }
export interface PartnerReportMetric { partnerId:string; partner:string; products:number; applications:number; businessValue:number; conversionPercent:number; delayedCases:number; relationshipStatus:string }
export interface AgeingMetric { label:string; count:number; percent:number }
export interface OperationsReportMetric { open:number; completed:number; actionRequired:number; delayed:number; escalated:number; averageTat:number; slaPercent:number }
export interface CustomerReportMetric { total:number; newCustomers:number; active:number; activeApplications:number; attention:number; previousNew:number; byFranchisee:{name:string;count:number}[]; byInterest:{name:string;count:number}[] }
export interface SupportReportMetric { open:number; awaitingResponse:number; resolved:number; overdue:number; averageResponseHours:number }
export interface TrendPoint { label:string; value:number; previous:number }
export interface AdminReportView { summary:ReportSummary; products:ProductReportMetric[]; franchisees:FranchiseeReportMetric[]; partners:PartnerReportMetric[]; funnel:{status:string;count:number;percent:number}[]; ageing:AgeingMetric[]; operations:OperationsReportMetric; customers:CustomerReportMetric; support:SupportReportMetric; trend:TrendPoint[]; oldestOpen:number; filteredApps:Application[] }

export const reportPeriods:ReportPeriod[]=['Today','Yesterday','This Week','This Month','This Quarter']
export const defaultReportFilters:ReportFilters={period:'This Month',product:'All Products',franchisee:'All Franchisees',rm:'All RMs',partner:'All Partners',city:'All Regions / Cities',status:'All Statuses'}
const quarterFixture={amount:142600000,previousAmount:128468468,contributingApplications:38}
const trendRatios:Record<ReportPeriod,number[]>={Today:[.42,.58,.66,.81,1],Yesterday:[.31,.52,.63,.79,1],'This Week':[.48,.62,.57,.76,.69,.88,1],'This Month':[.42,.51,.47,.63,.59,.72,.68,.83,.79,.91,1],'This Quarter':[.55,.62,.67,.61,.73,.78,.75,.84,.89,.86,.94,1]}

const periodFixture=(period:ReportPeriod)=>period==='This Quarter'?quarterFixture:adminBusinessPeriodFixtures[period as BusinessPeriod]

export function buildAdminReportView(applications:Application[],franchisees:Franchisee[],customers:AdminCustomer[],products:AdminProduct[],partners:AdminPartner[],filters:ReportFilters):AdminReportView{
  const fixture=periodFixture(filters.period)
  const periodApps=applications.slice(0,Math.min(fixture.contributingApplications,applications.length))
  const rawTotal=periodApps.reduce((sum,app)=>sum+app.amount,0)
  const scale=rawTotal?fixture.amount/rawTotal:0
  const filteredApps=periodApps.filter(app=>(filters.product==='All Products'||app.product===filters.product)&&(filters.franchisee==='All Franchisees'||app.franchisee===filters.franchisee)&&(filters.rm==='All RMs'||app.rm===filters.rm)&&(filters.partner==='All Partners'||app.provider===filters.partner)&&(filters.city==='All Regions / Cities'||app.city===filters.city)&&(filters.status==='All Statuses'||app.status===filters.status))
  const businessValue=Math.round(filteredApps.reduce((sum,app)=>sum+app.amount,0)*scale)
  const completedStatuses=['Approved','Completed']
  const converted=filteredApps.filter(app=>completedStatuses.includes(app.status)).length
  const withinSla=filteredApps.filter(app=>app.ageing<=10).length
  const productGroups=group(filteredApps,app=>app.product)
  const productMetrics=Array.from(productGroups,([product,rows])=>{const amount=Math.round(rows.reduce((sum,row)=>sum+row.amount,0)*scale);const completed=rows.filter(row=>completedStatuses.includes(row.status)).length;const delayed=rows.filter(row=>['Delayed','Escalated'].includes(row.status)).length;return {product,businessValue:amount,applications:rows.length,completed,pending:rows.length-completed,delayed,conversionPercent:percent(completed,rows.length),contributionPercent:percent(amount,businessValue),growthPercent:productGrowth(product),sellingFranchisees:new Set(rows.map(row=>row.franchisee)).size}}).sort((a,b)=>b.businessValue-a.businessValue)
  const franchiseeGroups=group(filteredApps,app=>app.franchisee)
  const franchiseeMetrics=Array.from(franchiseeGroups,([name,rows])=>{const record=franchisees.find(item=>item.name===name);const completed=rows.filter(row=>completedStatuses.includes(row.status)).length,delayed=rows.filter(row=>['Delayed','Escalated'].includes(row.status)).length,growth=franchiseeGrowth(name,franchisees);return {franchiseeName:name,city:record?.city||rows[0]?.city||'—',rm:record?.rm||rows[0]?.rm||'—',businessValue:Math.round(rows.reduce((sum,row)=>sum+row.amount,0)*scale),applications:rows.length,conversionPercent:percent(completed,rows.length),growthPercent:growth,delayedCases:delayed,customers:new Set(rows.map(row=>row.customer)).size,status:delayed>=2||growth<0?'Needs Attention':delayed?'Watch':'Healthy'} as FranchiseeReportMetric}).sort((a,b)=>b.businessValue-a.businessValue)
  const partnerMetrics=partners.map(partner=>{const rows=filteredApps.filter(app=>app.provider===partner.name),completed=rows.filter(row=>completedStatuses.includes(row.status)).length;return {partnerId:partner.id,partner:partner.name,products:products.filter(product=>product.providerId===partner.id).length,applications:rows.length,businessValue:Math.round(rows.reduce((sum,row)=>sum+row.amount,0)*scale),conversionPercent:percent(completed,rows.length),delayedCases:rows.filter(row=>['Delayed','Escalated'].includes(row.status)).length,relationshipStatus:partner.status}}).filter(item=>item.products||item.applications).sort((a,b)=>b.businessValue-a.businessValue)
  const funnelStatuses=['New','In Progress','Action Required','Approved','Completed','Rejected']
  const funnel=funnelStatuses.map(status=>{const count=filteredApps.filter(app=>app.status===status).length;return {status,count,percent:percent(count,filteredApps.length)}})
  const ageingRanges=[{label:'0–2 Days',test:(age:number)=>age<=2},{label:'3–5 Days',test:(age:number)=>age>=3&&age<=5},{label:'6–10 Days',test:(age:number)=>age>=6&&age<=10},{label:'10+ Days',test:(age:number)=>age>10}]
  const ageing=ageingRanges.map(item=>{const count=filteredApps.filter(app=>item.test(app.ageing)).length;return {label:item.label,count,percent:percent(count,filteredApps.length)}})
  const openApps=filteredApps.filter(app=>!['Completed','Rejected'].includes(app.status))
  const operationsRows=filteredApps.filter(app=>['Insurance','Loan Protector'].includes(app.product))
  const operations:OperationsReportMetric={open:operationsRows.filter(app=>!['Completed','Rejected'].includes(app.status)).length,completed:operationsRows.filter(app=>app.status==='Completed').length,actionRequired:operationsRows.filter(app=>app.status==='Action Required').length,delayed:operationsRows.filter(app=>app.status==='Delayed').length,escalated:operationsRows.filter(app=>app.status==='Escalated').length,averageTat:average(operationsRows.map(app=>app.ageing)),slaPercent:percent(operationsRows.filter(app=>app.ageing<=10).length,operationsRows.length)}
  const activeNames=new Set(filteredApps.filter(app=>!['Completed','Rejected'].includes(app.status)).map(app=>app.customer))
  const scopedCustomers=hasDimensionFilter(filters)?customers.filter(customer=>filteredApps.some(app=>app.customer===customer.name)):customers
  const customerMetric:CustomerReportMetric={total:scopedCustomers.length,newCustomers:scopedCustomers.filter(customer=>customer.createdAt.includes('Sep 2026')).length,active:scopedCustomers.filter(customer=>customer.status==='Active').length,activeApplications:scopedCustomers.filter(customer=>activeNames.has(customer.name)).length,attention:scopedCustomers.filter(customer=>customer.attentionReasons.length).length,previousNew:Math.max(1,scopedCustomers.filter(customer=>customer.createdAt.includes('Sep 2026')).length-1),byFranchisee:rankCounts(scopedCustomers.map(customer=>customer.franchisee)),byInterest:rankCounts(scopedCustomers.flatMap(customer=>customer.productInterests))}
  const periodShare=fixture.amount?businessValue/fixture.amount:0
  const previousBusiness=Math.round(fixture.previousAmount*periodShare)
  const summary={businessValue,previousBusiness,growthPercent:previousBusiness?percent(businessValue-previousBusiness,previousBusiness):0,applications:filteredApps.length,conversionPercent:percent(converted,filteredApps.length),activeFranchisees:new Set(filteredApps.map(app=>app.franchisee)).size,totalFranchisees:franchisees.length,slaPercent:percent(withinSla,filteredApps.length)}
  const ratios=trendRatios[filters.period],labels=trendLabels(filters.period,ratios.length)
  const trend=ratios.map((ratio,index)=>({label:labels[index],value:Math.round(businessValue*ratio),previous:Math.round(previousBusiness*ratio*(.96+index*.006))}))
  return {summary,products:productMetrics,franchisees:franchiseeMetrics,partners:partnerMetrics,funnel,ageing,operations,customers:customerMetric,support:{open:7,awaitingResponse:3,resolved:18,overdue:2,averageResponseHours:2.4},trend,oldestOpen:Math.max(0,...openApps.map(app=>app.ageing)),filteredApps}
}

function group<T,K>(rows:T[],key:(row:T)=>K){const map=new Map<K,T[]>();rows.forEach(row=>{const value=key(row);map.set(value,[...(map.get(value)||[]),row])});return map}
function percent(value:number,total:number){return total?value/total*100:0}
function average(values:number[]){return values.length?values.reduce((sum,value)=>sum+value,0)/values.length:0}
function productGrowth(product:ProductType){return ({Insurance:12.8,Loans:5.2,'Loan Protector':8.1,'Mutual Fund':10.4,Demat:4.8,Research:-2.1,Advisory:6.7} as Record<ProductType,number>)[product]}
function franchiseeGrowth(name:string,franchisees:Franchisee[]){const index=Math.max(0,franchisees.findIndex(item=>item.name===name));return Number(((index%5===3?-1:1)*(3.2+(index*1.7)%9)).toFixed(1))}
function trendLabels(period:ReportPeriod,count:number){if(period==='Today'||period==='Yesterday')return ['9 AM','11 AM','1 PM','3 PM','5 PM'];if(period==='This Week')return ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];if(period==='This Month')return Array.from({length:count},(_,index)=>`${index*3+1} Sep`);return ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'].slice(0,count)}
function hasDimensionFilter(filters:ReportFilters){return filters.product!=='All Products'||filters.franchisee!=='All Franchisees'||filters.rm!=='All RMs'||filters.partner!=='All Partners'||filters.city!=='All Regions / Cities'||filters.status!=='All Statuses'}
function rankCounts(values:string[]){const counts=new Map<string,number>();values.forEach(value=>counts.set(value,(counts.get(value)||0)+1));return Array.from(counts,([name,count])=>({name,count})).sort((a,b)=>b.count-a.count)}
