/**
 * Detailed holding records for the legacy Franchisee demo customers.
 * New customers store these fields in profile360; these fixtures bridge only
 * the older name-only customer records in the existing mock workspace.
 */
export interface LegacyCustomerHolding {
  id:string
  productId:string
  provider:string
  reference:string
  investedOrCover:number
  currentValue?:number
  status:'Active'
  startDate:string
  maturityOrRenewalDate?:string
  returnPercent?:number
}

export const legacyCustomerHoldings:Record<string,LegacyCustomerHolding[]>={
  'TC-1048':[
    {id:'HLD-1048-MF',productId:'mf',provider:'HDFC Mutual Fund',reference:'MF-1048-2381',investedOrCover:2_600_000,currentValue:2_922_400,status:'Active',startDate:'2022-04-18',returnPercent:12.4},
    {id:'HLD-1048-HI',productId:'health',provider:'Care Health Insurance',reference:'CHI-1048-9214',investedOrCover:1_000_000,status:'Active',startDate:'2025-01-12',maturityOrRenewalDate:'2027-01-11'},
    {id:'HLD-1048-DM',productId:'demat',provider:'Troth Securities Partner',reference:'DM-1048-6619',investedOrCover:820_000,currentValue:930_000,status:'Active',startDate:'2023-08-09',returnPercent:13.4}
  ],
  'TC-1052':[
    {id:'HLD-1052-HL',productId:'home-loan',provider:'HDFC Bank',reference:'HL-1052-4482',investedOrCover:4_200_000,currentValue:3_780_000,status:'Active',startDate:'2024-02-14',maturityOrRenewalDate:'2044-02-14'},
    {id:'HLD-1052-LP',productId:'loan-protector',provider:'Tata AIA',reference:'LP-1052-8837',investedOrCover:4_200_000,status:'Active',startDate:'2024-02-14',maturityOrRenewalDate:'2044-02-14'}
  ],
  'TC-1061':[
    {id:'HLD-1061-MI',productId:'motor',provider:'ICICI Lombard',reference:'MI-1061-7305',investedOrCover:860_000,status:'Active',startDate:'2025-10-04',maturityOrRenewalDate:'2026-10-03'}
  ],
  'TC-1067':[
    {id:'HLD-1067-PMS',productId:'pms',provider:'Marcellus Investment Managers',reference:'PMS-1067-1942',investedOrCover:2_120_000,currentValue:2_340_000,status:'Active',startDate:'2023-03-27',returnPercent:10.4}
  ]
}
