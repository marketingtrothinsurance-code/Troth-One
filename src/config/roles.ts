import type { NavItem, ProductType, Role, RoleConfig } from '../types'

const allProducts: ProductType[] = ['Insurance', 'Loans', 'Loan Protector', 'Mutual Fund', 'Demat', 'Research', 'Advisory']

export const roleConfigs: Record<Role, RoleConfig> = {
  'test-admin': {
    label: 'Test-Admin', shortLabel: 'Test-Admin', user: 'Master Admin', designation: 'Head Office Control Centre', allowedProducts: allProducts, canManage: true, nav: []
  },
  admin: {
    label: 'Admin', shortLabel: 'Admin', user: 'Aarav Shukla', designation: 'Platform Administrator', allowedProducts: allProducts, canManage: true,
    nav: [
      ['dashboard','Dashboard','LayoutDashboard'], ['users','Users & Access','Users'],
      ['customers','Customers','Contact'], ['applications','Applications','Files'], ['products','Products & Partners','Boxes'],
      ['operations','Operations','Workflow'], ['commission-payout','Commission & Payout','HandCoins'], ['support','Support','LifeBuoy'], ['reports','Reports & MIS','ChartNoAxesCombined'],
      ['administration','Administration','Settings']
    ].map(([id,label,icon]):NavItem => ({id,label,icon})).flatMap((item,index)=>index===1?[{id:'onboarding',label:'Onboarding',icon:'UserRoundPlus',children:[{id:'onboarding/employees',label:'Employee',icon:'Users'},{id:'onboarding/franchisees',label:'Franchisee',icon:'Store'},{id:'onboarding/agents',label:'Agents',icon:'BadgeCheck'}]},item]:[item])
  },
  franchisee: {
    label: 'Franchisee', shortLabel: 'Franchisee', user: 'Troth Meridian Financial Services', designation: 'FR-GJ-0418 · Ahmedabad', allowedProducts: allProducts, canManage: true,
    nav: [
      ['dashboard','Dashboard','LayoutDashboard'],['customers','Customers','Contact'],['crm','CRM / Sales Pipeline','MessagesSquare'],
      ['applications','Application Tracking','Files'],['renewals','Renewals','CalendarClock'],['products','Products & Services','Boxes'],['support','Support & Service Desk','LifeBuoy'],
      ['notifications','Announcement','Bell'],
      ['marketing','Marketing Centre','MessagesSquare'],['training','Troth Academy','BadgeCheck']
    ].map(([id,label,icon]):NavItem=>({id,label,icon})).flatMap((item,index)=>index===3?[{id:'onboarding',label:'Onboarding',icon:'UserRoundPlus',children:[{id:'employees',label:'Employee',icon:'Users'},{id:'sub-franchisees',label:'Sub Franchisee',icon:'Store'},{id:'agents',label:'Agents',icon:'BadgeCheck'}]},item]:[item]).concat([{id:'reports',label:'Reports',icon:'ChartNoAxesCombined',children:[{id:'business-revenue',label:'Business & Revenue Reports',icon:'ChartNoAxesCombined'}]},{id:'commission-payout',label:'Commission & Payout',icon:'HandCoins'}])
  },
  rm: {
    label: 'Relationship Manager', shortLabel: 'RM', user: 'Rohan Mehta', designation: 'Relationship Manager • West', allowedProducts: allProducts, canManage: false,
    nav: [['dashboard','Dashboard','LayoutDashboard'],['franchisees','Franchisees','Store'],['applications','Applications','Files'],['performance','Performance','ChartNoAxesCombined'],['support','Support','LifeBuoy']].map(([id,label,icon])=>({id,label,icon}))
  },
  operations: {
    label: 'Head Office Operations', shortLabel: 'Operations', user: 'Priya Nair', designation: 'Insurance Actioner', allowedProducts: ['Insurance','Loan Protector'], canManage: true,
    nav: [['dashboard','Work Dashboard','LayoutDashboard'],['work-queue','Work Queue','ListChecks'],['applications','Applications','Files'],['documents','Documents','FolderCheck'],['communication','Communication','MessagesSquare'],['completed','Completed','BadgeCheck']].map(([id,label,icon])=>({id,label,icon}))
  },
  customer: {
    label: 'Customer', shortLabel: 'Customer', user: 'Yash Thakar', designation: 'Customer • Ahmedabad', allowedProducts: allProducts, canManage: false,
    nav: [['dashboard','Dashboard','LayoutDashboard'],['offers-updates','Offers & Updates','Megaphone'],['my-products','My Products','WalletCards'],['applications','Applications','Files'],['calculator','Calculator','Calculator'],['support','Support','LifeBuoy']].map(([id,label,icon])=>({id,label,icon}))
  }
}

export const productTabs = ['All', ...allProducts] as const
