export type TestAdminPage='dashboard'|'crm'|'customers'|'transactions'|'applications'|'renewals'|'onboarding'|'configuration'|'commission'|'marketing-training'|'reports'|'support'|'communication'|'compliance'
export type BusinessSource='All'|'HO Direct'|'HO POSP'|'Franchise'|'Sub-Franchise'
export type PageTab=string

export interface TestAdminScope {
  source:BusinessSource
  search:string
}

export interface MasterPermissionProfile {
  role:'Master Admin'|'Franchise Admin'|'HO Admin'
  sources:BusinessSource[]
  authority:'Full control'|'Scoped control'
}
