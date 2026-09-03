export interface CustomerPromotion {
  id: string
  label: string
  title: string
  description: string
  actionLabel: string
  target: 'my-products' | 'calculator' | 'support'
  filter?: string
  tone: 'blue' | 'green' | 'violet'
}

export interface CustomerInstallment {
  id: string
  productName: string
  reference: string
  type: 'Insurance Renewal' | 'EMI' | 'SIP' | 'Premium' | 'Subscription Renewal'
  dueDate: string
  amount: number
  status: 'Upcoming' | 'Scheduled' | 'Due Soon'
  action: 'Pay' | 'Renew' | 'View'
}

export const customerPromotions:CustomerPromotion[] = [
  {id:'PROMO-01',label:'CUSTOMER BENEFIT',title:'Review your family health cover before renewal',description:'Your health policy renews this month. Review coverage, family details and service needs early.',actionLabel:'Review Insurance',target:'my-products',filter:'Insurance',tone:'blue'},
  {id:'PROMO-02',label:'NEW SERVICE',title:'Plan important goals with simple calculators',description:'Explore indicative estimates for investments, loans, retirement and protection needs.',actionLabel:'Open Calculators',target:'calculator',tone:'violet'},
  {id:'PROMO-03',label:'TROTH UPDATE',title:'Loan protection support is now available',description:'Understand how eligible outstanding liabilities may be protected, subject to policy terms.',actionLabel:'Explore Loan Protector',target:'my-products',filter:'Loan Protector',tone:'green'}
]

export const customerInstallments:CustomerInstallment[] = [
  {id:'INS-001',productName:'Family Health Secure',reference:'Policy HDF12345678',type:'Insurance Renewal',dueDate:'10 Sep 2026',amount:18750,status:'Due Soon',action:'Renew'},
  {id:'LOAN-001',productName:'Home Advantage Loan',reference:'Loan A/c ••••7192',type:'EMI',dueDate:'05 Sep 2026',amount:35000,status:'Upcoming',action:'Pay'},
  {id:'MF-001',productName:'Equity Opportunities Fund',reference:'Folio ••••5318',type:'SIP',dueDate:'15 Sep 2026',amount:10000,status:'Scheduled',action:'View'},
  {id:'MOTOR-001',productName:'Motor Insurance',reference:'Policy TAT98243110',type:'Insurance Renewal',dueDate:'05 Oct 2026',amount:8900,status:'Upcoming',action:'Renew'},
  {id:'RS-001',productName:'Equity Research Pro',reference:'Subscription RS10024',type:'Subscription Renewal',dueDate:'15 Oct 2026',amount:12000,status:'Upcoming',action:'Renew'}
]

