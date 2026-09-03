export type Role = 'admin' | 'franchisee' | 'rm' | 'operations' | 'customer'
export type ProductType = 'Insurance' | 'Loans' | 'Loan Protector' | 'Mutual Fund' | 'Demat' | 'Research' | 'Advisory'
export type AppStatus = 'New' | 'In Progress' | 'Action Required' | 'Approved' | 'Completed' | 'Delayed' | 'Escalated' | 'Rejected'

export interface Application {
  id: string
  customer: string
  franchisee: string
  product: ProductType
  productName: string
  provider: string
  amount: number
  stage: string
  status: AppStatus
  pendingAction: string
  assignedTo: string
  ageing: number
  updated: string
  rm: string
  city: string
}

export interface Franchisee {
  code: string
  name: string
  city: string
  rm: string
  customers: number
  applications: number
  business: number
  pending: number
  status: 'Active' | 'Inactive' | 'Onboarding'
}

export interface NavItem { id: string; label: string; icon: string }

export interface RoleConfig {
  label: string
  shortLabel: string
  user: string
  designation: string
  nav: NavItem[]
  allowedProducts: ProductType[]
  canManage: boolean
}
