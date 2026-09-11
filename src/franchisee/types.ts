export type FranchiseeRoute = 'dashboard'|'customers'|'employees'|'sub-franchisees'|'agents'|'crm'|'applications'|'renewals'|'products'|'support'|'profile'|'notifications'|'marketing'|'training'|'business-revenue'|'commission-payout'

import type { FranchiseeCustomerProfile } from './customer360Types'

export interface TimelineEvent { id:string; title:string; detail:string; time:string; actor:string }
export interface DocumentItem { name:string; status:'Verified'|'Received'|'Pending'|'Missing'; requested?:boolean }
export interface FranchiseeCustomer { id:string; name:string; mobile:string; email:string; city:string; kyc:'Verified'|'Pending'|'Expired'; relationshipValue:number; performance:number; products:string[]; lastActivity:string; tags:string[]; documents:DocumentItem[]; timeline:TimelineEvent[]; profile360?:FranchiseeCustomerProfile }
export type InquirySource='Customer App'|'Call Me Back'|'Endorsement / Service'|'Phone / Manual'
export type InquiryStatus='Open'|'Converted to Lead'|'Converted to Case'|'Closed'
export interface FranchiseeInquiry {id:string;customerId?:string;name:string;mobile:string;email?:string;source:InquirySource;subject:string;message:string;productInterest?:string;receivedAt:string;status:InquiryStatus;linkedLeadId?:string;linkedCaseId?:string;closureReason?:string;timeline:TimelineEvent[]}
export type LeadStage='New'|'Contacted'|'Qualified'|'Quote Raised'|'Won'|'Lost'
export interface LeadFollowUp {dueAt:string;type:'Call'|'Meeting'|'Email'|'Other';note:string}
export interface LeadDocument {id:string;name:string;fileName:string;size:number;uploadedAt:string}
export interface LeadContactActivity {id:string;type:'Call'|'Meeting'|'WhatsApp / Message'|'Email'|'Contact Attempt';occurredAt:string;outcome:string;notes:string;createdBy:string}
export interface LeadQualification {id:string;requirementConfirmed:boolean;productConfirmed:boolean;estimatedValue:number;intent:string;budgetRange:string;closureTimeline:string;nextFollowUp:string;notes:string;completedAt:string;completedBy:string}
export interface LeadQuote {id:string;product:string;provider:string;reference:string;amount:number;quoteDate:string;validUntil:string;notes:string;document?:LeadDocument;createdAt:string;createdBy:string}
export interface LeadStageHistory {id:string;from?:LeadStage;to:LeadStage;changedAt:string;changedBy:string;reason?:string;relatedActivityId?:string}
export interface FranchiseeLead {id:string;name:string;mobile:string;email:string;source:'Self-sourced'|'HO-assigned'|'Campaign'|'Referral'|'Inquiry';owner:string;product:string;subProduct?:string;expectedValue:number;stage:LeadStage;nextAction:string;notes:string[];timeline:TimelineEvent[];inquiryId?:string;customerId?:string;followUp?:LeadFollowUp;documents?:LeadDocument[];contactActivities?:LeadContactActivity[];qualification?:LeadQualification;quotes?:LeadQuote[];stageHistory?:LeadStageHistory[];createdAt?:string;updatedAt?:string;lostReason?:string;lostNotes?:string;convertedApplicationId?:string}
export type CaseStatus = 'Draft'|'Submitted'|'Under Review'|'Query Raised'|'Query Resolved'|'Approved / Issued'|'Completed'|'Rejected'
export interface FranchiseeCase { id:string; customerId:string; customer:string; product:string; amount:number; status:CaseStatus; assignedTeam:string; updated:string; documents:DocumentItem[]; query?:string; timeline:TimelineEvent[]; transactionType?:'New Business'|'Renewal'; originalReference?:string; sourceInquiryId?:string; sourceLeadId?:string }
export interface FranchiseeTicket { id:string; category:string; subject:string; status:'New'|'In Progress'|'Waiting for Me'|'Resolved'|'Closed'; priority:'Normal'|'Urgent'; assignedDesk:string; created:string; sla:string; lastResponse:string; messages:TimelineEvent[] }
export interface FranchiseeProduct { id:string; name:string; category:'Insurance'|'Loans'|'Loan Protector'|'Investment & Wealth'; description:string; eligibility:string; commission:string; documents:string[]; certification:boolean; enabled:boolean; faqs:string[] }
export interface ProductMapping { productId:string; enabled:boolean; certified:boolean; empanelment:'Active'|'Pending'|'Not eligible'; prerequisite:string }
export interface FranchiseeNotification { id:string; title:string; detail:string; type:'Application'|'Query'|'SLA'|'Payout'|'Support'|'Document'; read:boolean; time:string }
export interface Circular { id:string; title:string; category:string; date:string; required:boolean; acknowledged:boolean }
export interface MarketingAsset { id:string; title:string; product:string; category:string; format:string; campaign:string }
export interface LearningItem { id:string; title:string; product:string; type:string; duration:string; completed:boolean }
export interface Certification { productId:string; product:string; required:boolean; status:'Not started'|'In progress'|'Passed'; score?:number }
export interface RevenueRow { id:string; date:string; customer:string; product:string; business:number; earning:number; status:'Pending'|'Approved'|'Paid'; owner:string }
export interface FranchiseeCommissionSlab { id:string; name:string; vertical:string; product:string; transactionType:'New Business'|'Renewal'; calculationType:'Percentage'|'Fixed Amount'; rate:number; franchiseSharePercent:number; hoSharePercent:number; agentSharePercent:number; effectiveFrom:string; effectiveTo:string; status:'Active'|'Inactive'; updatedAt:string; updatedBy:string; remarks:string }
export interface DashboardSummary { totalNetWorth:number; totalRevenue:number; totalCustomers:number; currentMonthRevenue:number }
export interface FranchiseeStore { dashboardSummary:DashboardSummary; customers:FranchiseeCustomer[]; inquiries:FranchiseeInquiry[]; leads:FranchiseeLead[]; cases:FranchiseeCase[]; tickets:FranchiseeTicket[]; products:FranchiseeProduct[]; mappings:ProductMapping[]; notifications:FranchiseeNotification[]; circulars:Circular[]; marketing:MarketingAsset[]; learning:LearningItem[]; certifications:Certification[]; revenue:RevenueRow[] }
