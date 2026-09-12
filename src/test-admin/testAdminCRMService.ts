import type { FranchiseeInquiry, FranchiseeLead } from '../franchisee/types'
import type { BusinessSource } from './types'

export interface TestAdminCRMOwnership {businessSource:Exclude<BusinessSource,'All'>;franchiseId?:string;subFranchiseId?:string;relationshipOwner:string;rm?:string}
export type TestAdminCRMLead=FranchiseeLead&TestAdminCRMOwnership
export type TestAdminCRMInquiry=FranchiseeInquiry&TestAdminCRMOwnership
interface CRMStore {leads:TestAdminCRMLead[];inquiries:TestAdminCRMInquiry[]}

const KEY='troth-test-admin-crm-v1'
const empty:CRMStore={leads:[],inquiries:[]}
// Temporary Test-Admin browser persistence. Existing source records remain untouched.
const read=():CRMStore=>{try{const value=localStorage.getItem(KEY);return value?{...empty,...JSON.parse(value) as CRMStore}:structuredClone(empty)}catch{return structuredClone(empty)}}
const write=(store:CRMStore)=>{try{localStorage.setItem(KEY,JSON.stringify(store))}catch{throw new Error('Browser storage is unavailable.')}}

export const testAdminCRMRepository={
 load:read,
 saveLead:(lead:TestAdminCRMLead)=>{const store=read();store.leads=[lead,...store.leads.filter(x=>x.id!==lead.id)];write(store);return lead},
 saveInquiry:(inquiry:TestAdminCRMInquiry)=>{const store=read();store.inquiries=[inquiry,...store.inquiries.filter(x=>x.id!==inquiry.id)];write(store);return inquiry},
 mergeLeads:(base:TestAdminCRMLead[])=>{const saved=read().leads,map=new Map(base.map(x=>[x.id,x]));saved.forEach(x=>map.set(x.id,x));return [...map.values()]},
 mergeInquiries:(base:TestAdminCRMInquiry[])=>{const saved=read().inquiries,map=new Map(base.map(x=>[x.id,x]));saved.forEach(x=>map.set(x.id,x));return [...map.values()]},
}
