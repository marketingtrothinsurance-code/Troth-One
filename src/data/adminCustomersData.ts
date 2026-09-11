import type { Application, ProductType } from '../types'

export type AdminCustomerStatus = 'Active' | 'New' | 'Follow-up Required' | 'KYC Pending' | 'Inactive'
export type AdminKycStatus = 'Complete' | 'Pending' | 'Needs Review' | 'Not Started'
export type CustomerType = 'Individual' | 'Business'

export interface CustomerFollowUp { id:string; type:string; date:string; time:string; note:string; assignedTo:string }
export interface CustomerActivity { id:string; title:string; detail:string; timestamp:string }
export interface CustomerDocument { name:string; status:'Available'|'Pending'|'Needs Review'; reference?:string }

export interface AdminCustomer {
  id:string; name:string; type:CustomerType; email:string; mobile:string; city:string; state:string; address:string; pincode:string
  alternateMobile?:string; addressLine2?:string; title?:string; middleName?:string; businessType?:string; contactPerson?:string
  status:AdminCustomerStatus; kycStatus:AdminKycStatus; franchisee:string; rm:string; source:string; category:string
  preferredContact:string; dob:string; gender:string; occupation:string; annualIncome:string; createdAt:string; lastActivityAt:string
  nextFollowUpAt:string; productInterests:ProductType[]; attentionReasons:string[]; businessValue:number; activeApplications:number
  documents:CustomerDocument[]; followUps:CustomerFollowUp[]; activity:CustomerActivity[]; relationshipNotes:string[]
}

interface Profile {
  email:string; mobile:string; address:string; city:string; state:string; pincode:string; status:AdminCustomerStatus; kycStatus:AdminKycStatus
  source:string; category:string; preferredContact:string; dob:string; gender:string; occupation:string; annualIncome:string; createdAt:string
  lastActivityAt:string; nextFollowUpAt:string; interests:ProductType[]
}

const profiles:Record<string,Profile> = {
  'Vivek Joshi': {email:'vivek.joshi@example.in',mobile:'+91 98••• ••410',address:'Satellite Road',city:'Ahmedabad',state:'Gujarat',pincode:'380015',status:'Active',kycStatus:'Complete',source:'Franchisee Referral',category:'Affluent',preferredContact:'WhatsApp',dob:'14 Mar 1988',gender:'Male',occupation:'Business Owner',annualIncome:'₹15L–₹25L',createdAt:'18 Jan 2026',lastActivityAt:'04 Sep 2026, 4:25 PM',nextFollowUpAt:'08 Sep 2026, 11:00 AM',interests:['Insurance','Mutual Fund']},
  'Riya Desai': {email:'riya.desai@example.in',mobile:'+91 97••• ••182',address:'Vesu Main Road',city:'Surat',state:'Gujarat',pincode:'395007',status:'Follow-up Required',kycStatus:'Pending',source:'Digital Campaign',category:'Retail',preferredContact:'Phone',dob:'22 Jul 1992',gender:'Female',occupation:'Architect',annualIncome:'₹10L–₹15L',createdAt:'02 Sep 2026',lastActivityAt:'05 Sep 2026, 10:12 AM',nextFollowUpAt:'05 Sep 2026, 3:30 PM',interests:['Loans','Insurance']},
  'Arjun Trivedi': {email:'arjun.trivedi@example.in',mobile:'+91 99••• ••636',address:'Alkapuri',city:'Vadodara',state:'Gujarat',pincode:'390007',status:'Active',kycStatus:'Complete',source:'Walk-in',category:'Priority',preferredContact:'Email',dob:'09 Nov 1985',gender:'Male',occupation:'Consultant',annualIncome:'₹25L+',createdAt:'08 Feb 2026',lastActivityAt:'03 Sep 2026, 2:40 PM',nextFollowUpAt:'12 Sep 2026, 12:00 PM',interests:['Advisory','Research']},
  'Meera Shah': {email:'meera.shah@example.in',mobile:'+91 96••• ••921',address:'Kalawad Road',city:'Rajkot',state:'Gujarat',pincode:'360005',status:'KYC Pending',kycStatus:'Needs Review',source:'RM Referral',category:'Retail',preferredContact:'WhatsApp',dob:'28 Apr 1995',gender:'Female',occupation:'Designer',annualIncome:'₹5L–₹10L',createdAt:'14 Jun 2026',lastActivityAt:'01 Sep 2026, 5:05 PM',nextFollowUpAt:'06 Sep 2026, 10:00 AM',interests:['Demat','Mutual Fund']},
  'Dev Patel': {email:'dev.patel@example.in',mobile:'+91 95••• ••508',address:'Sargasan',city:'Gandhinagar',state:'Gujarat',pincode:'382421',status:'New',kycStatus:'Not Started',source:'Website',category:'Emerging',preferredContact:'Email',dob:'16 Jan 1998',gender:'Male',occupation:'Software Engineer',annualIncome:'₹10L–₹15L',createdAt:'04 Sep 2026',lastActivityAt:'04 Sep 2026, 12:15 PM',nextFollowUpAt:'07 Sep 2026, 4:00 PM',interests:['Demat','Research']},
  'Diya Bhatt': {email:'diya.bhatt@example.in',mobile:'+91 94••• ••775',address:'Adajan',city:'Surat',state:'Gujarat',pincode:'395009',status:'Active',kycStatus:'Complete',source:'Existing Customer',category:'Affluent',preferredContact:'Phone',dob:'05 May 1990',gender:'Female',occupation:'Doctor',annualIncome:'₹25L+',createdAt:'21 Mar 2026',lastActivityAt:'30 Aug 2026, 11:30 AM',nextFollowUpAt:'14 Sep 2026, 2:00 PM',interests:['Insurance','Advisory']},
  'Kabir Mehta': {email:'kabir.mehta@example.in',mobile:'+91 93••• ••247',address:'Bodakdev',city:'Ahmedabad',state:'Gujarat',pincode:'380054',status:'Follow-up Required',kycStatus:'Complete',source:'Franchisee Referral',category:'Priority',preferredContact:'WhatsApp',dob:'11 Dec 1982',gender:'Male',occupation:'Manufacturer',annualIncome:'₹25L+',createdAt:'10 Apr 2026',lastActivityAt:'29 Aug 2026, 3:10 PM',nextFollowUpAt:'04 Sep 2026, 5:00 PM',interests:['Loans','Loan Protector']},
  'Aanya Modi': {email:'aanya.modi@example.in',mobile:'+91 92••• ••364',address:'Gotri',city:'Vadodara',state:'Gujarat',pincode:'390021',status:'Active',kycStatus:'Complete',source:'Event',category:'Retail',preferredContact:'Email',dob:'30 Aug 1993',gender:'Female',occupation:'Chartered Accountant',annualIncome:'₹15L–₹25L',createdAt:'19 May 2026',lastActivityAt:'28 Aug 2026, 1:45 PM',nextFollowUpAt:'18 Sep 2026, 11:30 AM',interests:['Mutual Fund','Advisory']},
  'Ishaan Dave': {email:'ishaan.dave@example.in',mobile:'+91 91••• ••013',address:'University Road',city:'Rajkot',state:'Gujarat',pincode:'360005',status:'Inactive',kycStatus:'Complete',source:'Walk-in',category:'Retail',preferredContact:'Phone',dob:'17 Feb 1987',gender:'Male',occupation:'Trader',annualIncome:'₹10L–₹15L',createdAt:'07 Dec 2025',lastActivityAt:'12 Jul 2026, 10:20 AM',nextFollowUpAt:'Not scheduled',interests:['Demat','Research']},
  'Anika Parekh': {email:'anika.parekh@example.in',mobile:'+91 90••• ••849',address:'Raysan',city:'Gandhinagar',state:'Gujarat',pincode:'382007',status:'New',kycStatus:'Pending',source:'Digital Campaign',category:'Emerging',preferredContact:'WhatsApp',dob:'03 Jun 1997',gender:'Female',occupation:'Entrepreneur',annualIncome:'₹10L–₹15L',createdAt:'01 Sep 2026',lastActivityAt:'05 Sep 2026, 9:05 AM',nextFollowUpAt:'09 Sep 2026, 10:30 AM',interests:['Insurance','Loans']},
  'Nirav Vora': {email:'nirav.vora@example.in',mobile:'+91 89••• ••572',address:'Paldi',city:'Ahmedabad',state:'Gujarat',pincode:'380007',status:'KYC Pending',kycStatus:'Needs Review',source:'RM Referral',category:'Affluent',preferredContact:'Email',dob:'25 Oct 1979',gender:'Male',occupation:'Exporter',annualIncome:'₹25L+',createdAt:'24 Feb 2026',lastActivityAt:'02 Sep 2026, 4:55 PM',nextFollowUpAt:'06 Sep 2026, 3:00 PM',interests:['Insurance','Advisory']},
  'Sara Gandhi': {email:'sara.gandhi@example.in',mobile:'+91 88••• ••195',address:'Athwalines',city:'Surat',state:'Gujarat',pincode:'395001',status:'Active',kycStatus:'Complete',source:'Existing Customer',category:'Priority',preferredContact:'Phone',dob:'12 Sep 1989',gender:'Female',occupation:'Lawyer',annualIncome:'₹15L–₹25L',createdAt:'15 Aug 2025',lastActivityAt:'31 Aug 2026, 12:05 PM',nextFollowUpAt:'16 Sep 2026, 4:30 PM',interests:['Mutual Fund','Insurance']},
}

export function buildAdminCustomers(applications:Application[]):AdminCustomer[] {
  return Object.entries(profiles).map(([name,profile],index)=>{
    const apps=applications.filter(application=>application.customer===name)
    const first=apps[0]
    const attentionReasons=[
      ...(profile.kycStatus==='Pending'||profile.kycStatus==='Needs Review'?['KYC documents require attention']:[]),
      ...(apps.some(app=>['Action Required','Delayed','Escalated'].includes(app.status))?['Application action is pending']:[]),
      ...(profile.status==='Follow-up Required'?['Relationship follow-up is due']:[]),
    ]
    return {
      id:`CUS-${String(124+index).padStart(6,'0')}`,name,type:'Individual',...profile,
      franchisee:first?.franchisee||'Direct / Head Office',rm:first?.rm||'Unassigned',productInterests:profile.interests,
      attentionReasons,businessValue:apps.reduce((sum,app)=>sum+app.amount,0),
      activeApplications:apps.filter(app=>!['Completed','Rejected'].includes(app.status)).length,
      documents:[
        {name:'PAN',status:profile.kycStatus==='Complete'?'Available':'Needs Review',reference:'A•••••4K'},
        {name:'Aadhaar',status:profile.kycStatus==='Not Started'?'Pending':profile.kycStatus==='Complete'?'Available':'Needs Review',reference:'•••• •••• 1842'},
        {name:'Address Proof',status:profile.kycStatus==='Complete'?'Available':'Pending'},
        {name:'Bank Proof',status:profile.kycStatus==='Complete'?'Available':'Pending'},
        {name:'Photo',status:profile.kycStatus==='Not Started'?'Pending':'Available'},
        {name:'Other',status:'Pending'},
      ],
      followUps:profile.nextFollowUpAt==='Not scheduled'?[]:[{id:`FU-${index+1}`,type:'Call',date:profile.nextFollowUpAt.split(',')[0],time:profile.nextFollowUpAt.split(', ')[1]||'',note:'Review current requirement and agree next action.',assignedTo:first?.rm||'Admin Team'}],
      relationshipNotes:[
        `Prefers service updates over ${profile.preferredContact.toLowerCase()}.`,
        attentionReasons.length?attentionReasons[0]:'Relationship is current; continue the scheduled service cadence.',
      ],
      activity:[
        {id:`ACT-${index}-1`,title:'Customer profile reviewed',detail:`Relationship owner: ${first?.rm||'Admin Team'}`,timestamp:profile.lastActivityAt},
        ...(first?[{id:`ACT-${index}-2`,title:`${first.productName} application updated`,detail:`${first.id} · ${first.status}`,timestamp:first.updated}]:[]),
        {id:`ACT-${index}-3`,title:'Customer added to directory',detail:`Source: ${profile.source}`,timestamp:profile.createdAt},
      ],
    }
  })
}

export const customerSources=['Franchisee Referral','RM Referral','Digital Campaign','Website','Walk-in','Event','Existing Customer']
export const customerCategories=['Emerging','Retail','Affluent','Priority']
export const customerProducts:ProductType[]=['Insurance','Loans','Loan Protector','Mutual Fund','Demat','Research','Advisory']
