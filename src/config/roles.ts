import type { ProductType, Role, RoleConfig } from '../types'

const allProducts: ProductType[] = ['Insurance', 'Loans', 'Loan Protector', 'Mutual Fund', 'Demat', 'Research', 'Advisory']

export const roleConfigs: Record<Role, RoleConfig> = {
  admin: {
    label: 'Admin', shortLabel: 'Admin', user: 'Aarav Shukla', designation: 'Platform Administrator', allowedProducts: allProducts, canManage: true,
    nav: [
      ['dashboard','Dashboard','LayoutDashboard'], ['franchisees','Franchisees','Store'], ['users','Users & Access','Users'],
      ['customers','Customers','Contact'], ['applications','Applications','Files'], ['products','Products & Partners','Boxes'],
      ['operations','Operations','Workflow'], ['support','Support','LifeBuoy'], ['reports','Reports & MIS','ChartNoAxesCombined'],
      ['administration','Administration','Settings']
    ].map(([id,label,icon]) => ({id,label,icon}))
  },
  franchisee: {
    label: 'Franchisee', shortLabel: 'Franchisee', user: 'Neha Sharma', designation: 'Troth Partner • Ahmedabad', allowedProducts: allProducts, canManage: true,
    nav: [['dashboard','Dashboard','LayoutDashboard'],['customers','Customers','Contact'],['crm','CRM / Sales Pipeline','Workflow'],['applications','Applications & Cases','Files'],['products','Products & Services','Boxes'],['business','Business & Revenue','ChartNoAxesCombined'],['support','Support & Service Desk','LifeBuoy']].map(([id,label,icon])=>({id,label,icon}))
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
    nav: [['dashboard','Dashboard','LayoutDashboard'],['my-products','My Products','WalletCards'],['applications','Applications','Files'],['calculator','Calculator','Calculator'],['support','Support','LifeBuoy']].map(([id,label,icon])=>({id,label,icon}))
  }
}

export const productTabs = ['All', ...allProducts] as const
