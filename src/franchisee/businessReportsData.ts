export type FranchiseeBusinessType = 'New'|'Renewal'
export type FranchiseeRevenueStatus = 'Pending'|'Approved'|'Paid'

export interface FranchiseeBusinessReportRecord {
  id:string
  date:string
  businessReference:string
  customerId:string
  customerName:string
  product:string
  businessType:FranchiseeBusinessType
  businessValue:number
  revenue:number
  businessStatus:string
  revenueStatus:FranchiseeRevenueStatus
  revenueDate?:string
}

// Isolated franchise-owned reporting ledger. Values are intentionally kept out of
// operational application and CRM stores so this page cannot change other modules.
export const franchiseeBusinessReportRecords:FranchiseeBusinessReportRecord[]=[
  {id:'BR-901',date:'2026-09-06',businessReference:'TAPP-260191',customerId:'TC-1048',customerName:'Aarav Shah',product:'Health Insurance',businessType:'Renewal',businessValue:840000,revenue:117600,businessStatus:'Completed',revenueStatus:'Approved'},
  {id:'BR-899',date:'2026-09-05',businessReference:'TAPP-260188',customerId:'TC-1052',customerName:'Meera Iyer',product:'Personal Loan',businessType:'New',businessValue:680000,revenue:40800,businessStatus:'Approved / Issued',revenueStatus:'Pending'},
  {id:'BR-895',date:'2026-09-03',businessReference:'TAPP-260184',customerId:'TC-1052',customerName:'Meera Iyer',product:'Home Loan',businessType:'New',businessValue:1850000,revenue:74000,businessStatus:'Completed',revenueStatus:'Approved'},
  {id:'BR-891',date:'2026-09-02',businessReference:'TAPP-260179',customerId:'TC-1048',customerName:'Aarav Shah',product:'PMS',businessType:'New',businessValue:5000000,revenue:64000,businessStatus:'Under Review',revenueStatus:'Approved'},
  {id:'BR-886',date:'2026-09-01',businessReference:'TAPP-260162',customerId:'TC-1061',customerName:'Kabir Desai',product:'Motor Insurance',businessType:'Renewal',businessValue:24600,revenue:2952,businessStatus:'Approved / Issued',revenueStatus:'Paid',revenueDate:'2026-09-04'},
  {id:'BR-878',date:'2026-08-29',businessReference:'TAPP-260151',customerId:'TC-1067',customerName:'Riya Mehta',product:'AIF',businessType:'New',businessValue:10000000,revenue:118000,businessStatus:'Completed',revenueStatus:'Approved'},
  {id:'BR-872',date:'2026-08-24',businessReference:'TAPP-260144',customerId:'TC-1048',customerName:'Aarav Shah',product:'Mutual Fund',businessType:'New',businessValue:750000,revenue:8750,businessStatus:'Completed',revenueStatus:'Paid',revenueDate:'2026-08-30'},
  {id:'BR-868',date:'2026-08-18',businessReference:'TAPP-260139',customerId:'TC-1061',customerName:'Kabir Desai',product:'Loan Protector',businessType:'New',businessValue:460000,revenue:55200,businessStatus:'Completed',revenueStatus:'Paid',revenueDate:'2026-08-25'},
  {id:'BR-861',date:'2026-08-08',businessReference:'TAPP-260128',customerId:'TC-1052',customerName:'Meera Iyer',product:'Home Loan',businessType:'New',businessValue:2400000,revenue:84000,businessStatus:'Approved / Issued',revenueStatus:'Approved'},
  {id:'BR-854',date:'2026-07-27',businessReference:'TAPP-260116',customerId:'TC-1067',customerName:'Riya Mehta',product:'PMS',businessType:'New',businessValue:4200000,revenue:58800,businessStatus:'Completed',revenueStatus:'Paid',revenueDate:'2026-08-05'},
  {id:'BR-848',date:'2026-07-16',businessReference:'TAPP-260108',customerId:'TC-1048',customerName:'Aarav Shah',product:'Term Insurance',businessType:'New',businessValue:1250000,revenue:187500,businessStatus:'Completed',revenueStatus:'Paid',revenueDate:'2026-07-28'},
  {id:'BR-842',date:'2026-07-05',businessReference:'TAPP-260097',customerId:'TC-1061',customerName:'Kabir Desai',product:'Motor Insurance',businessType:'Renewal',businessValue:320000,revenue:48000,businessStatus:'Completed',revenueStatus:'Paid',revenueDate:'2026-07-12'},
  {id:'BR-836',date:'2026-06-23',businessReference:'TAPP-260089',customerId:'TC-1052',customerName:'Meera Iyer',product:'Business Loan',businessType:'New',businessValue:2850000,revenue:85500,businessStatus:'Completed',revenueStatus:'Paid',revenueDate:'2026-07-02'},
  {id:'BR-829',date:'2026-06-14',businessReference:'TAPP-260076',customerId:'TC-1048',customerName:'Aarav Shah',product:'Mutual Fund',businessType:'New',businessValue:1200000,revenue:14400,businessStatus:'Completed',revenueStatus:'Paid',revenueDate:'2026-06-25'},
  {id:'BR-821',date:'2026-06-03',businessReference:'TAPP-260064',customerId:'TC-1067',customerName:'Riya Mehta',product:'Health Insurance',businessType:'Renewal',businessValue:610000,revenue:85400,businessStatus:'Completed',revenueStatus:'Paid',revenueDate:'2026-06-10'},
  {id:'BR-815',date:'2026-05-25',businessReference:'TAPP-260051',customerId:'TC-1061',customerName:'Kabir Desai',product:'Personal Loan',businessType:'New',businessValue:920000,revenue:55200,businessStatus:'Completed',revenueStatus:'Paid',revenueDate:'2026-06-03'},
  {id:'BR-808',date:'2026-05-12',businessReference:'TAPP-260043',customerId:'TC-1052',customerName:'Meera Iyer',product:'Home Loan',businessType:'New',businessValue:3100000,revenue:108500,businessStatus:'Completed',revenueStatus:'Paid',revenueDate:'2026-05-22'},
  {id:'BR-801',date:'2026-05-02',businessReference:'TAPP-260031',customerId:'TC-1048',customerName:'Aarav Shah',product:'Loan Protector',businessType:'New',businessValue:525000,revenue:63000,businessStatus:'Completed',revenueStatus:'Paid',revenueDate:'2026-05-09'},
  {id:'BR-794',date:'2026-04-21',businessReference:'TAPP-260022',customerId:'TC-1067',customerName:'Riya Mehta',product:'AIF',businessType:'New',businessValue:3500000,revenue:43750,businessStatus:'Completed',revenueStatus:'Paid',revenueDate:'2026-05-02'},
  {id:'BR-788',date:'2026-04-09',businessReference:'TAPP-260014',customerId:'TC-1061',customerName:'Kabir Desai',product:'Motor Insurance',businessType:'Renewal',businessValue:280000,revenue:42000,businessStatus:'Completed',revenueStatus:'Paid',revenueDate:'2026-04-16'}
]
