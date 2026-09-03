export type CustomerRelationshipStatus = 'Active' | 'Prospect' | 'Dormant'
export type CustomerKycStatus = 'Verified' | 'Pending' | 'Expired'
export type LeadStage = 'New Lead' | 'Contacted' | 'Qualified' | 'Requirement Identified' | 'KYC Pending' | 'KYC Completed' | 'Application Initiated' | 'Application Submitted' | 'Converted' | 'Lost / Closed'
export type LeadTemperature = 'Hot' | 'Warm' | 'Cold'

export interface CustomerNote {
  id: string
  text: string
  date: string
}

export interface CustomerActivity {
  title: string
  date: string
}

export interface CustomerDocument {
  name: string
  status: 'Verified' | 'Received' | 'Missing'
}

export interface CustomerServiceRecord {
  id: string
  subject: string
  status: 'New' | 'In Progress' | 'Completed'
  date: string
}

export interface FranchiseeCustomer {
  id: string
  name: string
  mobile: string
  email: string
  city: string
  source: string
  relationshipStatus: CustomerRelationshipStatus
  kycStatus: CustomerKycStatus
  products: string[]
  applicationIds: string[]
  businessValue: number
  assignedTo: string
  lastContact: string
  nextFollowUp: string
  notes: CustomerNote[]
  activities: CustomerActivity[]
  documents: CustomerDocument[]
  serviceHistory: CustomerServiceRecord[]
}

export interface FranchiseeLead {
  id: string
  name: string
  mobile: string
  email: string
  city: string
  source: string
  interest: string
  estimatedValue: number
  stage: LeadStage
  kycStatus: 'Not Started' | 'Pending' | 'Completed'
  owner: string
  temperature: LeadTemperature
  nextFollowUp: string
  lastActivity: string
}

export interface FranchiseeNotification {
  id: string
  title: string
  description: string
  type: 'action' | 'message' | 'success'
  time: string
}

export type BusinessVertical = 'Insurance' | 'Loans' | 'Investments' | 'Protection'
export type RevenueStatus = 'Pending' | 'Under Process' | 'Approved' | 'Paid'

export interface FranchiseeBusinessSummary {
  totalBusiness: number
  totalRevenue: number
  pendingRevenue: number
  targetAchievement: number
  businessThisMonth: number
  revenueThisMonth: number
  paidRevenue: number
  monthlyTarget: number
  targetAchievedAmount: number
  targetRemaining: number
  incentive: number
  adjustments: number
}

export interface FranchiseeBusinessTrendPoint {
  period: string
  business: number
  revenue: number
}

export interface FranchiseeProductPerformance {
  product: string
  vertical: BusinessVertical
  applications: number
  converted: number
  businessValue: number
  revenue: number
  conversionRate: number
  contribution: number
}

export interface FranchiseeBusinessRecord {
  id: string
  date: string
  customer: string
  reference: string
  product: string
  vertical: BusinessVertical
  businessAmount: number
  revenue: number
  status: RevenueStatus
  assignedTo: string
  expectedPayoutDate?: string
}

export interface FranchiseeBusinessWorkspace {
  summary: FranchiseeBusinessSummary
  trend: FranchiseeBusinessTrendPoint[]
  productPerformance: FranchiseeProductPerformance[]
  records: FranchiseeBusinessRecord[]
}
