import type { FranchiseeCustomer, FranchiseeLead, FranchiseeNotification, LeadStage } from '../types/franchisee'

const standardDocuments: FranchiseeCustomer['documents'] = [
  {name:'PAN card',status:'Verified'},
  {name:'Aadhaar card',status:'Verified'},
  {name:'Cancelled cheque',status:'Received'}
]

const customer = (
  id:string,
  name:string,
  city:string,
  source:string,
  relationshipStatus:FranchiseeCustomer['relationshipStatus'],
  kycStatus:FranchiseeCustomer['kycStatus'],
  products:string[],
  applicationIds:string[],
  businessValue:number,
  nextFollowUp:string
):FranchiseeCustomer => ({
  id,name,city,source,relationshipStatus,kycStatus,products,applicationIds,businessValue,nextFollowUp,
  mobile:`+91 98${id.slice(-2)}5 42${id.slice(-2)}`,
  email:`${name.toLowerCase().replaceAll(' ','.')}@example.in`,
  assignedTo:'Neha Sharma',
  lastContact:'02 Sep 2026',
  notes:[{id:`N-${id}`,text:'Discussed current requirement and agreed the next follow-up.',date:'02 Sep 2026'}],
  activities:[
    {title:'Follow-up call completed',date:'02 Sep 2026 • 10:20 AM'},
    {title:'Customer profile reviewed',date:'30 Aug 2026 • 4:15 PM'}
  ],
  documents:standardDocuments.map(document=>({...document})),
  serviceHistory:[{id:`SR-${id.slice(-3)}`,subject:'Product information request',status:'Completed',date:'24 Aug 2026'}]
})

export const franchiseeCustomers:FranchiseeCustomer[] = [
  customer('CU-1042','Vivek Joshi','Ahmedabad','Referral','Active','Verified',['Health Insurance','Home Loan','Mutual Fund'],['T1-20260041','T1-20260053'],3275000,'04 Sep 2026 • 11:00 AM'),
  customer('CU-1048','Riya Desai','Ahmedabad','Walk-in','Active','Pending',['Home Loan'],['T1-20260042'],1850000,'03 Sep 2026 • 3:30 PM'),
  customer('CU-1055','Arjun Trivedi','Gandhinagar','Digital Campaign','Prospect','Pending',[],['T1-20260054'],750000,'05 Sep 2026 • 12:00 PM'),
  customer('CU-1061','Meera Shah','Ahmedabad','Existing Customer','Active','Verified',['Term Insurance','Mutual Fund'],['T1-20260066'],1420000,'08 Sep 2026 • 10:30 AM'),
  customer('CU-1069','Dev Patel','Sanand','Partner Referral','Active','Verified',['Business Loan'],['T1-20260043'],2500000,'06 Sep 2026 • 4:00 PM'),
  customer('CU-1074','Diya Bhatt','Ahmedabad','Social Media','Prospect','Pending',[],[] ,500000,'03 Sep 2026 • 5:00 PM'),
  customer('CU-1082','Kabir Mehta','Ahmedabad','Referral','Dormant','Expired',['Motor Insurance'],[],18500,'12 Sep 2026 • 11:30 AM'),
  customer('CU-1087','Aanya Modi','Gandhinagar','Seminar','Active','Verified',['Demat Account','Research'],['T1-20260077'],625000,'09 Sep 2026 • 2:00 PM')
]

export const leadStages:LeadStage[] = ['New Lead','Contacted','Qualified','Requirement Identified','KYC Pending','KYC Completed','Application Initiated','Application Submitted','Converted','Lost / Closed']

export const franchiseeLeads:FranchiseeLead[] = [
  {id:'LD-2084',name:'Nirav Vora',mobile:'+91 98765 31084',email:'nirav.vora@example.in',city:'Ahmedabad',source:'Health Campaign',interest:'Health Insurance',estimatedValue:24000,stage:'New Lead',kycStatus:'Not Started',owner:'Neha Sharma',temperature:'Hot',nextFollowUp:'03 Sep 2026 • 10:00 AM',lastActivity:'Lead captured from campaign'},
  {id:'LD-2081',name:'Sara Gandhi',mobile:'+91 98765 31081',email:'sara.gandhi@example.in',city:'Ahmedabad',source:'Customer Referral',interest:'Home Loan',estimatedValue:4200000,stage:'Contacted',kycStatus:'Not Started',owner:'Amit Patel',temperature:'Hot',nextFollowUp:'03 Sep 2026 • 2:30 PM',lastActivity:'Initial requirement discussed'},
  {id:'LD-2078',name:'Ishaan Dave',mobile:'+91 98765 31078',email:'ishaan.dave@example.in',city:'Gandhinagar',source:'Website',interest:'Mutual Fund',estimatedValue:300000,stage:'Qualified',kycStatus:'Pending',owner:'Neha Sharma',temperature:'Warm',nextFollowUp:'04 Sep 2026 • 11:30 AM',lastActivity:'Risk profile shared'},
  {id:'LD-2073',name:'Anika Parekh',mobile:'+91 98765 31073',email:'anika.parekh@example.in',city:'Ahmedabad',source:'Walk-in',interest:'Business Loan',estimatedValue:1800000,stage:'Requirement Identified',kycStatus:'Pending',owner:'Amit Patel',temperature:'Warm',nextFollowUp:'05 Sep 2026 • 4:00 PM',lastActivity:'Document checklist sent'},
  {id:'LD-2068',name:'Parth Shah',mobile:'+91 98765 31068',email:'parth.shah@example.in',city:'Ahmedabad',source:'RM Referral',interest:'Loan Protector',estimatedValue:22000,stage:'KYC Pending',kycStatus:'Pending',owner:'Neha Sharma',temperature:'Hot',nextFollowUp:'03 Sep 2026 • 5:30 PM',lastActivity:'PAN requested'},
  {id:'LD-2062',name:'Mahi Patel',mobile:'+91 98765 31062',email:'mahi.patel@example.in',city:'Sanand',source:'Social Media',interest:'Term Insurance',estimatedValue:32000,stage:'KYC Completed',kycStatus:'Completed',owner:'Neha Sharma',temperature:'Warm',nextFollowUp:'06 Sep 2026 • 12:30 PM',lastActivity:'KYC verified'},
  {id:'LD-2054',name:'Rahul Soni',mobile:'+91 98765 31054',email:'rahul.soni@example.in',city:'Ahmedabad',source:'Existing Customer',interest:'Personal Loan',estimatedValue:600000,stage:'Application Initiated',kycStatus:'Completed',owner:'Amit Patel',temperature:'Hot',nextFollowUp:'04 Sep 2026 • 3:00 PM',lastActivity:'Application draft created'},
  {id:'LD-2049',name:'Krisha Mehta',mobile:'+91 98765 31049',email:'krisha.mehta@example.in',city:'Gandhinagar',source:'Seminar',interest:'Demat Account',estimatedValue:100000,stage:'Application Submitted',kycStatus:'Completed',owner:'Neha Sharma',temperature:'Warm',nextFollowUp:'08 Sep 2026 • 10:00 AM',lastActivity:'Application submitted'},
  {id:'LD-2041',name:'Harshil Joshi',mobile:'+91 98765 31041',email:'harshil.joshi@example.in',city:'Ahmedabad',source:'Referral',interest:'Home Loan',estimatedValue:3500000,stage:'Converted',kycStatus:'Completed',owner:'Neha Sharma',temperature:'Warm',nextFollowUp:'10 Sep 2026 • 11:00 AM',lastActivity:'Converted to customer'},
  {id:'LD-2036',name:'Jiya Shah',mobile:'+91 98765 31036',email:'jiya.shah@example.in',city:'Ahmedabad',source:'Cold Calling',interest:'Mutual Fund',estimatedValue:150000,stage:'Lost / Closed',kycStatus:'Not Started',owner:'Amit Patel',temperature:'Cold',nextFollowUp:'—',lastActivity:'Not interested currently'}
]

export const franchiseeNotifications:FranchiseeNotification[] = [
  {id:'FN-1',title:'Two follow-ups are due today',description:'Riya Desai and Nirav Vora require attention.',type:'action',time:'10 min ago'},
  {id:'FN-2',title:'Head Office replied to OPS-2041',description:'Address clarification is waiting for your response.',type:'message',time:'38 min ago'},
  {id:'FN-3',title:'Application T1-20260061 approved',description:'The customer can now be informed.',type:'success',time:'1 hr ago'}
]

export const franchiseeBusinessSummary = {
  recordedRevenue:486000,
  pendingEarnings:124500,
  monthlyTarget:650000,
  targetAchieved:74.8
}
