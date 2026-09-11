import type { ProductType } from '../types'

export type OpsModule='dashboard'|'applications'|'processing'|'queries'|'payment'|'queue'|'reports'|'profile'
export type SLAStatus='on-track'|'attention'|'overdue'
export type OpsStage='Received'|'Under Review'|'Query Raised'|'Query Resolved'|'Terms Finalized'|'Awaiting Payment'|'Payment Confirmed'|'Issuance Pending'|'Completed'|'Not Proceeded'
export type QueryStatus='Open'|'Response Received'|'Closed'|'Reopened'
export type PaymentStatus='Not Started'|'Link Sent'|'Pending'|'Paid'|'Failed'
export type IssuanceStatus='Not Started'|'Ready'|'Document Uploaded'|'Issued'
export type ProductDesk='General Operations'|'Insurance Desk'|'Lending Desk'|'Wealth Operations'
export interface OpsUser{id:string;name:string;designation:string;desk:ProductDesk;email:string;mobile:string;scope:'all'|'allocated';allocatedFranchiseIds:string[];authorisedDesks:ProductDesk[]}
export interface OpsDocument{id:string;name:string;type:string;source:'Franchise'|'Operations';status:'Received'|'Reviewed'|'Missing'|'Incomplete'|'Final';uploadedAt:string}
export interface OpsEvent{id:string;at:string;actor:string;role:'Franchise'|'Operations'|'Relationship Manager'|'System';action:string;note:string}
export interface OpsQuery{id:string;caseId:string;type:string;subject:string;description:string;requirement:string;priority:'Normal'|'High'|'Critical';dueDate:string;status:QueryStatus;raisedAt:string;raisedBy:string;response?:string;rmComments:string[];documents:string[];updatedAt:string}
export interface CounterOffer{originalValue:number;revisedValue:number;reason:string;notes:string;validUntil:string;status:'Draft'|'Sent'|'Accepted'|'Declined'}
export interface OpsPayment{status:PaymentStatus;amount:number;reference?:string;link?:string;generatedAt?:string;expiry?:string}
export interface OpsIssuance{status:IssuanceStatus;documentType?:string;reference?:string;issueDate?:string;effectiveDate?:string;expiryDate?:string;fileName?:string}
export interface OpsCase{id:string;customerId:string;customer:string;mobile:string;email:string;franchiseId:string;franchise:string;product:ProductType;productName:string;applicationType:string;amount:number;stage:OpsStage;submittedAt:string;updatedAt:string;age:number;assignedTo:string;desk:ProductDesk;pendingAction:string;documents:OpsDocument[];queryIds:string[];payment:OpsPayment;issuance:OpsIssuance;counterOffer?:CounterOffer;timeline:OpsEvent[]}
export interface OpsStore{cases:OpsCase[];queries:OpsQuery[];user:OpsUser}
export interface OpsSLAConfig{onTrackMaxDays:number;attentionMaxDays:number;overrides:Partial<Record<ProductDesk,{onTrackMaxDays:number;attentionMaxDays:number}>>}
