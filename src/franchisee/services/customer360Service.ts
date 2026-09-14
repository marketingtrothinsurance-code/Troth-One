import { buildFranchiseeRenewals, type FranchiseeRenewal } from '../renewalsData'
import type { CustomerDocument, FileMetadata } from '../customer360Types'
import type { FranchiseeCase, FranchiseeCustomer, FranchiseeProduct, FranchiseeStore, TimelineEvent } from '../types'
import { legacyCustomerHoldings } from '../customer360HoldingData'

export interface CustomerHolding {
  id:string
  productId:string
  product:string
  category:FranchiseeProduct['category']
  provider?:string
  reference?:string
  investedOrCover?:number
  currentValue?:number
  status:string
  startDate?:string
  maturityOrRenewalDate?:string
  returnPercent?:number
  document?:FileMetadata
}

export interface PortfolioSummary {
  totalPortfolioValue:number
  investedAmount?:number
  currentValue?:number
  absoluteGain?:number
  returnPercent?:number
  allocation:{category:string;value:number}[]
}

export interface CrossSellOpportunity {
  id:string
  productId:string
  product:string
  priority:'High'|'Medium'|'Low'
  reason:string
  basedOn:string
  productGap:string
  suggestedAction:string
  source:'Rule-based product gap'
}

export interface Customer360Workspace {
  customer:FranchiseeCustomer
  productMaster:FranchiseeProduct[]
  holdings:CustomerHolding[]
  portfolio:PortfolioSummary
  documents:CustomerDocument[]
  communications:TimelineEvent[]
  openCases:FranchiseeCase[]
  opportunities:CrossSellOpportunity[]
  intelligenceConnected:boolean
  opportunitySource:'Intelligence Model'|'Rule-based product gap'
  renewals:FranchiseeRenewal[]
}

const normal=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]/g,'')
const aliases:Record<string,string>={mutualfund:'Mutual Fund',equitymutualfund:'Mutual Fund',sharesdemat:'Demat',demataccount:'Demat',portfoliomanagementservices:'PMS',alternativeinvestmentfund:'AIF',bondsfixedincome:'Bonds & FD',corporatefd:'Corporate FD',researchsubscription:'Research Advisory'}
const matches=(masterName:string,recordName:string)=>{const master=normal(masterName),record=normal(recordName),alias=normal(aliases[master]||'');return master===record||Boolean(alias&&alias===record)||master.includes(record)||record.includes(master)}

function holdingsFor(customer:FranchiseeCustomer,products:FranchiseeProduct[],cases:FranchiseeCase[]):CustomerHolding[]{
  const profile=customer.profile360
  const legacy=legacyCustomerHoldings[customer.id]||[]
  const detailed:CustomerHolding[]=[
    ...(profile?.policies||[]).map(item=>({id:item.id,productId:'',product:item.planName||item.category,category:'Insurance' as const,provider:item.insurer,reference:item.policyNumber,investedOrCover:item.sumInsured,currentValue:undefined,status:item.status,startDate:item.startDate,maturityOrRenewalDate:item.renewalDate,document:item.document})),
    ...(profile?.loans||[]).map(item=>({id:item.id,productId:'',product:item.loanType,category:'Loans' as const,provider:item.lender,reference:item.accountNumber,investedOrCover:item.originalAmount,currentValue:item.outstandingAmount,status:item.status,startDate:item.startDate,maturityOrRenewalDate:item.maturityDate,document:item.documents.find(document=>/sanction/i.test(document.documentType))?.file||item.documents.find(document=>document.file)?.file})),
    ...(profile?.investments||[]).map(item=>({id:item.id,productId:'',product:item.investmentType||item.productName||'Investment',category:'Investment & Wealth' as const,provider:item.provider,reference:item.referenceNumber,investedOrCover:item.investmentAmount,currentValue:item.currentValue,status:item.status||'Recorded',startDate:item.startDate,maturityOrRenewalDate:item.maturityDate,returnPercent:item.investmentAmount&&item.currentValue!==undefined?((item.currentValue-item.investmentAmount)/item.investmentAmount)*100:undefined}))
  ]
  const masterFor=(name:string)=>products.find(product=>matches(product.name,name))
  const categoryFor=(name:string):FranchiseeProduct['category']=>masterFor(name)?.category||(/loan/i.test(name)&&!/protector/i.test(name)?'Loans':/insurance|policy|protector/i.test(name)?'Insurance':'Investment & Wealth')
  const rows:CustomerHolding[]=detailed.map(item=>{const master=masterFor(item.product);return master?{...item,productId:master.id,product:master.name,category:master.category}:item})
  for(const item of legacy){
    if(rows.some(row=>row.id===item.id))continue
    const master=products.find(product=>product.id===item.productId)
    rows.push({...item,product:master?.name||item.productId,category:master?.category||categoryFor(master?.name||item.productId)})
  }
  for(const name of customer.products){
    const master=masterFor(name)
    const productId=master?.id||normal(name)
    if(rows.some(row=>(row.productId&&row.productId===productId)||matches(row.product,name)))continue
    rows.push({id:`linked-${customer.id}-${productId}`,productId,product:master?.name||name,category:master?.category||categoryFor(name),status:'Active'})
  }
  for(const item of cases.filter(item=>item.customerId===customer.id&&['Approved / Issued','Completed'].includes(item.status))){
    const master=masterFor(item.product),productId=master?.id||normal(item.product)
    if(rows.some(row=>(row.productId&&row.productId===productId)||matches(row.product,item.product)))continue
    rows.push({id:`case-${item.id}`,productId,product:master?.name||item.product,category:master?.category||categoryFor(item.product),investedOrCover:item.amount,status:'Active'})
  }
  return rows
}

function documentsFor(customer:FranchiseeCustomer):CustomerDocument[]{
  if(customer.profile360) return customer.profile360.documents
  return customer.documents.map((item,index)=>({id:`legacy-doc-${index}`,documentType:item.name,status:item.status==='Verified'?'Verified':item.status==='Received'?'Uploaded':item.status==='Missing'?'Pending':'Pending'}))
}

function portfolioFor(customer:FranchiseeCustomer,holdings:CustomerHolding[]):PortfolioSummary{
  const investments=customer.profile360?.investments||[]
  const investmentHoldings=holdings.filter(item=>item.category==='Investment & Wealth')
  const invested=investments.length?investments.reduce((sum,item)=>sum+(item.investmentAmount||0),0):investmentHoldings.reduce((sum,item)=>sum+(item.investedOrCover||0),0)
  const current=investments.length?investments.reduce((sum,item)=>sum+(item.currentValue||0),0):investmentHoldings.reduce((sum,item)=>sum+(item.currentValue||0),0)
  const allocation=[...holdings.filter(item=>item.category==='Investment & Wealth'&&item.currentValue!==undefined).reduce((map,item)=>map.set(item.product,(map.get(item.product)||0)+(item.currentValue||0)),new Map<string,number>())].map(([category,value])=>({category,value}))
  return {totalPortfolioValue:customer.relationshipValue,investedAmount:invested||undefined,currentValue:current||undefined,absoluteGain:invested&&current?current-invested:undefined,returnPercent:invested&&current?((current-invested)/invested)*100:investmentHoldings.length?customer.performance||undefined:undefined,allocation}
}

function opportunitiesFor(customer:FranchiseeCustomer,products:FranchiseeProduct[],holdings:CustomerHolding[]):CrossSellOpportunity[]{
  const held=new Set(holdings.map(item=>item.productId))
  const available=new Map(products.filter(item=>item.enabled).map(item=>[item.id,item]))
  const opportunities:CrossSellOpportunity[]=[]
  const add=(productId:string,priority:CrossSellOpportunity['priority'],reason:string,basedOn:string,suggestedAction:string)=>{
    const product=available.get(productId)
    if(!product||held.has(productId)||opportunities.some(item=>item.productId===productId))return
    opportunities.push({id:`gap-${customer.id}-${productId}`,productId,product:product.name,priority,reason,basedOn,productGap:`No active ${product.name} relationship is recorded.`,suggestedAction,source:'Rule-based product gap'})
  }
  const heldLoans=['home-loan','business-loan','personal-loan','lap'].filter(id=>held.has(id))
  if(heldLoans.length){
    const trigger=heldLoans.map(id=>available.get(id)?.name).filter(Boolean).join(', ')
    add('loan-protector','High','An active loan is recorded without a corresponding Loan Protector relationship.',trigger,'Discuss protection for the customer’s outstanding loan exposure.')
    add('term','Medium','A borrower relationship is recorded, while no Term Insurance relationship is available.',trigger,'Review family income-protection needs and suitability.')
  }
  const familySignal=(customer.profile360?.profile.family.length||0)>0
  if(familySignal)add('health','High','Family members are recorded but no Health Insurance relationship is available.','Customer family profile','Review family health-cover requirements and existing external cover.')
  const wealthHolding=['mf','demat','pms','aif','bonds','ipo','nps','gold','fd'].find(id=>held.has(id))
  if(wealthHolding){
    const trigger=available.get(wealthHolding)?.name||'Investment relationship'
    add('research','Medium','The customer has an investment relationship but no Research Advisory relationship is recorded.',trigger,'Offer a suitability-led discussion about research support.')
  }
  const recordedInvestments=customer.profile360?.investments.reduce((sum,item)=>sum+(item.currentValue||0),0)||0
  const suitabilityValue=Math.max(recordedInvestments,customer.profile360?.financial.netWorth||0)
  if(held.has('mf')&&suitabilityValue>=5_000_000)add('pms','Medium','Recorded investment or net-worth information meets the product master’s stated PMS minimum threshold.','Mutual Fund relationship and recorded financial profile','Conduct suitability and risk profiling before discussing PMS.')
  if(held.has('pms'))add('mf','Medium','A managed portfolio is recorded without a Mutual Fund relationship for goal-based diversification.','PMS relationship','Review whether a diversified SIP or goal-based mutual fund allocation is suitable.')
  const order:Record<CrossSellOpportunity['priority'],number>={High:0,Medium:1,Low:2}
  return opportunities.sort((a,b)=>order[a.priority]-order[b.priority])
}

export const customer360Service={
  load(customerId:string,store:FranchiseeStore):Customer360Workspace|null{
    // The store is already scoped to the authenticated franchise. A missing ID is
    // deliberately indistinguishable from an unauthorised customer.
    const customer=store.customers.find(item=>item.id===customerId)
    if(!customer)return null
    const productMaster=store.products
    const holdings=holdingsFor(customer,productMaster,store.cases)
    const renewals=buildFranchiseeRenewals([customer],store.cases)
    return {customer,productMaster,holdings,portfolio:portfolioFor(customer,holdings),documents:documentsFor(customer),communications:customer.timeline,openCases:store.cases.filter(item=>item.customerId===customer.id&&!['Completed','Rejected','Approved / Issued'].includes(item.status)),opportunities:opportunitiesFor(customer,productMaster,holdings),intelligenceConnected:false,opportunitySource:'Rule-based product gap',renewals}
  }
}
