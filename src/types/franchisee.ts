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

