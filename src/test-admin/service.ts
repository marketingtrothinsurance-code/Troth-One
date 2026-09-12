import type { Application } from '../types'
import { buildAdminCustomers } from '../data/adminCustomersData'
import { buildAdminProducts } from '../data/adminProductsPartnersData'
import { commissionRepository } from '../data/adminCommissionPayoutData'
import { initialAuditEntries, initialDocumentRules, initialMasterValues, initialNotificationRules, initialSlaRules, initialTemplates, initialWorkflowRules } from '../data/adminAdministrationData'
import { platformUsers } from '../data/adminUsersAccessData'
import { franchisees } from '../data/mockData'
import { franchiseeWorkspaceService } from '../franchisee/services/franchiseeWorkspaceService'
import { buildFranchiseeRenewals } from '../franchisee/renewalsData'
import { franchiseeAgentRepository, onboardingStatus, pendingRequirementCount } from '../franchisee/agentOnboarding'
import { franchiseeEmployeeRepository } from '../franchisee/employees'
import { subFranchiseeService } from '../franchisee/services/subFranchiseeService'
import { rmInquiryService } from '../rm/inquiryService'
import { rmApplications, rmCustomers, rmFranchises, rmLeads, rmTickets } from '../rm/data'
import { operationsRepository } from '../operations/service'
import type { BusinessSource, MasterPermissionProfile } from './types'
import { testAdminWorkspaceRepository } from './workspaceService'

export const businessSources:BusinessSource[]=['All','HO Direct','HO POSP','Franchise','Sub-Franchise']
export const permissionProfiles:MasterPermissionProfile[]=[
 {role:'Master Admin',sources:['All','HO Direct','HO POSP','Franchise','Sub-Franchise'],authority:'Full control'},
 {role:'Franchise Admin',sources:['Franchise','Sub-Franchise'],authority:'Scoped control'},
 {role:'HO Admin',sources:['HO Direct','HO POSP'],authority:'Scoped control'}
]

export const sourceFor=(value?:string):Exclude<BusinessSource,'All'>=>{
 const text=(value||'').toLowerCase()
 if(text.includes('sub-franchise')||text.startsWith('sf-'))return'Sub-Franchise'
 if(text.includes('ho posp')||text.includes('posp'))return'HO POSP'
 if(text.includes('head office')||text.includes('ho direct')||text.includes('direct'))return'HO Direct'
 return'Franchise'
}

export const inScope=(source:BusinessSource,value?:string)=>source==='All'||sourceFor(value)===source

export function loadMasterSnapshot(applications:Application[]){
 const workspace=franchiseeWorkspaceService.load()
 const operations=operationsRepository.load()
 const products=buildAdminProducts(applications)
 const customers=buildAdminCustomers(applications)
 const commission=commissionRepository.load()
 const renewals=buildFranchiseeRenewals(workspace.customers,workspace.cases)
 const agents=franchiseeAgentRepository.load(workspace.products).map(agent=>({...agent,onboardingStatus:onboardingStatus(agent),pendingRequirements:pendingRequirementCount(agent)})),testAdmin=testAdminWorkspaceRepository.load()
 return {
  applications,customers,products,commission,workspace,operations,renewals,agents,testAdmin,
  employees:franchiseeEmployeeRepository.load(),subFranchises:subFranchiseeService.list(),
  inquiries:rmInquiryService.listAll(),rmFranchises,rmCustomers,rmLeads,rmApplications,rmTickets,
  franchisees,platformUsers,masterValues:initialMasterValues,slaRules:initialSlaRules,workflowRules:initialWorkflowRules,templates:initialTemplates,notificationRules:initialNotificationRules,documentRules:initialDocumentRules,auditEntries:initialAuditEntries
 }
}

export const downloadRows=(filename:string,headers:string[],rows:(string|number)[][])=>{
 const escape=(value:string|number)=>`"${String(value).replace(/"/g,'""')}"`
 const blob=new Blob(['\uFEFF'+[headers,...rows].map(row=>row.map(escape).join(',')).join('\n')],{type:'text/csv;charset=utf-8'})
 const link=document.createElement('a'),url=URL.createObjectURL(blob);link.href=url;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),0)
}
