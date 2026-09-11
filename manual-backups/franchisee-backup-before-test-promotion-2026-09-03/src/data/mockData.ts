import type { Application, Franchisee, ProductType } from '../types'

const names = ['Vivek Joshi','Riya Desai','Arjun Trivedi','Meera Shah','Dev Patel','Diya Bhatt','Kabir Mehta','Aanya Modi','Ishaan Dave','Anika Parekh','Nirav Vora','Sara Gandhi']
const franchiseNames = ['Troth Finserve','Aarohi Wealth','Navkar Associates','BluePeak Capital','Shreeji Finance','Vertex Advisory','Sarthi Investments','Meridian FinCorp','Prosperity Point','TrustEdge Services','Capital Bridge','FinNest Partners']
const cities = ['Ahmedabad','Surat','Vadodara','Rajkot','Gandhinagar']
const rms = ['Rohan Mehta','Kavya Shah','Manav Desai','Ira Patel']
const productMeta: Record<ProductType, [string[], string[]]> = {
  Insurance: [['Health Insurance','Motor Insurance','Term Insurance','Marine Insurance'],['HDFC ERGO','ICICI Lombard','Tata AIG']],
  Loans: [['Home Loan','Business Loan','Personal Loan','Working Capital'],['HDFC Bank','Tata Capital','Bajaj Finserv']],
  'Loan Protector': [['Loan Protector'],['ICICI Prudential','HDFC Life']],
  'Mutual Fund': [['Equity SIP','Balanced Advantage Fund','Debt Fund'],['HDFC AMC','SBI Mutual Fund','Kotak AMC']],
  Demat: [['Demat Account'],['Angel One','Motilal Oswal']],
  Research: [['Equity Research Subscription'],['Troth Research']],
  Advisory: [['Financial Advisory'],['Troth Advisory']]
}
const products = Object.keys(productMeta) as ProductType[]
const statuses: Application['status'][] = ['New','In Progress','Action Required','Approved','Completed','Delayed','Escalated','Rejected']
const stages = ['Initial Review','KYC Verification','Provider Review','Approval','Fulfilment']
const actions = ['None','Upload bank statement','Confirm nominee details','Provider clarification','Sign consent form','Review quotation']
const assignees = ['Priya Nair','Harsh Vyas','Anmol Singh','Ritu Kapoor','Unassigned']

export const franchisees: Franchisee[] = franchiseNames.map((name, i) => ({
  code: `FR-${String(i + 101).padStart(4,'0')}`, name, city: cities[i % cities.length], rm: rms[i % rms.length],
  customers: 18 + (i * 7) % 51, applications: 4 + (i * 3) % 18, business: 850000 + i * 337500,
  pending: (i * 3) % 9, status: i === 10 ? 'Inactive' : i === 11 ? 'Onboarding' : 'Active'
}))

export const applications: Application[] = Array.from({length: 38}, (_, i) => {
  const product = products[i % products.length]
  const [types, providers] = productMeta[product]
  const f = franchisees[i % franchisees.length]
  const status = statuses[i % statuses.length]
  return {
    id: `T1-${20260041 + i}`, customer: names[i % names.length], franchisee: f.name, product,
    productName: types[i % types.length], provider: providers[i % providers.length], amount: product === 'Insurance' ? 18500 + i * 1500 : 125000 + i * 73500,
    stage: stages[i % stages.length], status, pendingAction: status === 'Completed' ? 'None' : actions[(i + 1) % actions.length],
    assignedTo: assignees[i % assignees.length], ageing: status === 'Delayed' ? 12 + i % 8 : 1 + i % 9,
    updated: `${String(1 + i % 28).padStart(2,'0')} Aug 2026`, rm: f.rm, city: f.city
  }
})

export const recentActivity = [
  ['Application T1-20260062 approved','Ritu Kapoor • 18 min ago'],
  ['Bank statement received from Riya Desai','Priya Nair • 42 min ago'],
  ['New franchisee onboarding initiated','Admin team • 1 hr ago'],
  ['Loan application moved to provider review','Harsh Vyas • 2 hrs ago']
]

export const formatINR = (value: number, compact = false) => compact && value >= 100000
  ? `₹${(value / 100000).toFixed(value % 100000 ? 1 : 0)}L`
  : new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(value)
