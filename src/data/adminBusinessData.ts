import type { Application, Franchisee, ProductType } from '../types'

export const businessPeriods = ['Today','Yesterday','This Week','This Month'] as const
export type BusinessPeriod = typeof businessPeriods[number]

interface BusinessPeriodFixture {
  amount: number
  previousAmount: number
  contributingApplications: number
}

export interface ProductBusinessMetric {
  product: ProductType
  amount: number
  applications: number
  contributionPercent: number
}

export interface FranchiseeBusinessMetric {
  franchiseeName: string
  city: string
  amount: number
  applications: number
  contributionPercent: number
}

export interface FranchiseeContributionRow extends FranchiseeBusinessMetric {
  products: Partial<Record<ProductType,number>>
}

export interface AdminBusinessView {
  period: BusinessPeriod
  amount: number
  previousAmount: number
  growthPercent: number
  applications: number
  activeFranchisees: number
  products: ProductBusinessMetric[]
  franchisees: FranchiseeBusinessMetric[]
  matrix: FranchiseeContributionRow[]
}

export const adminBusinessPeriodFixtures: Record<BusinessPeriod,BusinessPeriodFixture> = {
  Today:{amount:1840000,previousAmount:1694291,contributingApplications:12},
  Yesterday:{amount:1694291,previousAmount:1610525,contributingApplications:10},
  'This Week':{amount:11600000,previousAmount:10526316,contributingApplications:26},
  'This Month':{amount:48200000,previousAmount:42882562,contributingApplications:38},
}

export function buildAdminBusinessView(apps:Application[],franchisees:Franchisee[],period:BusinessPeriod):AdminBusinessView {
  const fixture=adminBusinessPeriodFixtures[period]
  const selected=apps.slice(0,Math.min(fixture.contributingApplications,apps.length))
  const rawTotal=selected.reduce((sum,app)=>sum+app.amount,0)
  const scale=rawTotal?fixture.amount/rawTotal:0
  const scaledAmount=(value:number)=>Math.round(value*scale)

  const productGroups=new Map<ProductType,{amount:number;applications:number}>()
  const franchiseeGroups=new Map<string,{amount:number;applications:number;products:Partial<Record<ProductType,number>>}>()
  selected.forEach(app=>{
    const product=productGroups.get(app.product)||{amount:0,applications:0}
    product.amount+=app.amount
    product.applications+=1
    productGroups.set(app.product,product)

    const partner=franchiseeGroups.get(app.franchisee)||{amount:0,applications:0,products:{}}
    partner.amount+=app.amount
    partner.applications+=1
    partner.products[app.product]=(partner.products[app.product]||0)+app.amount
    franchiseeGroups.set(app.franchisee,partner)
  })

  const products=Array.from(productGroups,([product,metric])=>{
    const amount=scaledAmount(metric.amount)
    return {product,amount,applications:metric.applications,contributionPercent:fixture.amount?amount/fixture.amount*100:0}
  }).sort((a,b)=>b.amount-a.amount)

  const matrix=Array.from(franchiseeGroups,([franchiseeName,metric])=>{
    const amount=scaledAmount(metric.amount)
    const products=Object.fromEntries(Object.entries(metric.products).map(([product,value])=>[product,scaledAmount(value||0)])) as Partial<Record<ProductType,number>>
    return {
      franchiseeName,
      city:franchisees.find(item=>item.name===franchiseeName)?.city||'—',
      amount,
      applications:metric.applications,
      contributionPercent:fixture.amount?amount/fixture.amount*100:0,
      products,
    }
  }).sort((a,b)=>b.amount-a.amount)

  return {
    period,
    amount:fixture.amount,
    previousAmount:fixture.previousAmount,
    growthPercent:fixture.previousAmount?(fixture.amount-fixture.previousAmount)/fixture.previousAmount*100:0,
    applications:selected.length,
    activeFranchisees:matrix.length,
    products,
    franchisees:matrix.map(({products:_,...metric})=>metric),
    matrix,
  }
}

export function formatAdminBusinessINR(value:number):string {
  if(value>=10000000)return `₹${trimDecimal(value/10000000,2)} Cr`
  if(value>=100000)return `₹${trimDecimal(value/100000,1)}L`
  return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(value)
}

function trimDecimal(value:number,digits:number):string {
  return value.toFixed(digits).replace(/\.0+$|(?<=\.[0-9])0+$/,'')
}
