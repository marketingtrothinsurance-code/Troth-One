export interface CustomerPromotion {
  id: string
  label: string
  title: string
  description: string
  actionLabel: string
  target: 'my-products' | 'calculator' | 'support'
  filter?: string
  tone: 'blue' | 'green' | 'violet'
  category: 'Offers' | 'News' | 'Announcements' | 'Insurance' | 'Loans' | 'Investments' | 'Service Updates'
  publishedDate: string
  validTo?: string
  isFeatured?: boolean
  isImportant?: boolean
  isNew?: boolean
  status: 'Active' | 'Expiring Soon' | 'Expired'
  product?: string
  terms?: string[]
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

export interface CustomerLoan {
  id: string
  productName: string
  status: 'Active' | 'Closed' | 'Paid Off'
  outstandingBalance: number
}

export interface CustomerDashboardSummary {
  totalNetWorth: number
  investmentAum: number
  insuranceCoverage: number
  activeLoanCount: number
  activeLoanOutstandingAmount: number
  upcomingPaymentCount: number
  upcomingPaymentAmount: number
}

export const customerPromotions:CustomerPromotion[] = [
  {id:'PROMO-01',label:'CUSTOMER BENEFIT',title:'Review your family health cover before renewal',description:'Your health policy renews this month. Review coverage, family details and service needs early.',actionLabel:'Review Insurance',target:'my-products',filter:'Insurance',tone:'blue',category:'Insurance',publishedDate:'01 Sep 2026',validTo:'30 Sep 2026',isFeatured:true,isImportant:true,isNew:true,status:'Expiring Soon',product:'Health Insurance',terms:['Coverage and renewal terms depend on the selected insurer and policy.','Premium may change after review of age, members, cover and claims history.']},
  {id:'PROMO-02',label:'NEW SERVICE',title:'Plan important goals with simple calculators',description:'Explore indicative estimates for investments, loans, retirement and protection needs.',actionLabel:'Open Calculators',target:'calculator',tone:'violet',category:'Service Updates',publishedDate:'29 Aug 2026',isNew:true,status:'Active',terms:['Calculator results are indicative and are not financial advice or a product guarantee.']},
  {id:'PROMO-03',label:'TROTH UPDATE',title:'Loan protection support is now available',description:'Understand how eligible outstanding liabilities may be protected, subject to policy terms.',actionLabel:'Explore Loan Protector',target:'my-products',filter:'Loan Protector',tone:'green',category:'Loans',publishedDate:'25 Aug 2026',validTo:'31 Oct 2026',status:'Active',product:'Loan Protector',terms:['Availability, eligibility and benefits are subject to insurer underwriting and policy terms.']},
  {id:'PROMO-04',label:'PORTFOLIO UPDATE',title:'September investment statement is ready',description:'Review your latest holdings, current values and recent portfolio activity in My Products.',actionLabel:'View Investments',target:'my-products',filter:'Investments',tone:'violet',category:'Investments',publishedDate:'03 Sep 2026',isNew:true,status:'Active',product:'Investments'},
  {id:'PROMO-05',label:'SERVICE NOTICE',title:'Support hours extended during renewal season',description:'Customer support is available for longer hours to help with policy renewals and documents.',actionLabel:'Contact Support',target:'support',tone:'blue',category:'Announcements',publishedDate:'28 Aug 2026',isImportant:true,status:'Active'},
  {id:'PROMO-06',label:'PRODUCT NEWS',title:'Updated home-loan document guide published',description:'Check the latest indicative document checklist before starting a home-loan application.',actionLabel:'Explore Loans',target:'my-products',filter:'Loans',tone:'green',category:'News',publishedDate:'20 Aug 2026',status:'Active',product:'Home Loan'}
]

export const customerInstallments:CustomerInstallment[] = [
  {id:'INS-001',productName:'Family Health Secure',reference:'Policy HDF12345678',type:'Insurance Renewal',dueDate:'10 Sep 2026',amount:18750,status:'Due Soon',action:'Renew'},
  {id:'LOAN-001',productName:'Home Advantage Loan',reference:'Loan A/c ••••7192',type:'EMI',dueDate:'05 Sep 2026',amount:35000,status:'Upcoming',action:'Pay'},
  {id:'MF-001',productName:'Equity Opportunities Fund',reference:'Folio ••••5318',type:'SIP',dueDate:'15 Sep 2026',amount:10000,status:'Scheduled',action:'View'},
  {id:'MOTOR-001',productName:'Motor Insurance',reference:'Policy TAT98243110',type:'Insurance Renewal',dueDate:'05 Oct 2026',amount:8900,status:'Upcoming',action:'Renew'},
  {id:'RS-001',productName:'Equity Research Pro',reference:'Subscription RS10024',type:'Subscription Renewal',dueDate:'15 Oct 2026',amount:12000,status:'Upcoming',action:'Renew'}
]

export const customerLoans:CustomerLoan[] = [
  {id:'LOAN-001',productName:'Home Advantage Loan',status:'Active',outstandingBalance:1980000},
  {id:'LOAN-002',productName:'Personal Flexi Loan',status:'Active',outstandingBalance:270000},
  {id:'LOAN-003',productName:'Vehicle Loan',status:'Closed',outstandingBalance:0}
]

export const customerDashboardBaseSummary:Pick<CustomerDashboardSummary,'totalNetWorth'|'investmentAum'|'insuranceCoverage'> = {
  totalNetWorth: 4280000,
  investmentAum: 2470000,
  insuranceCoverage: 4500000
}
