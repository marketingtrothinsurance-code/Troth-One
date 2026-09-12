import { Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { CustomerOnboardingWizard } from '../components/CustomerOnboardingWizard'
import type { CustomerOnboardingDraft } from '../customer360Types'
import { legacyCustomerHoldings } from '../customer360HoldingData'
import type { FranchiseeCustomer } from '../types'
import { DataTable, FilterSelect, Filters, money, PageHeader, Panel, StatusBadge } from '../components/FranchiseeUI'

const investmentProductIds=new Set(['mf','demat','pms','aif','bonds','fd','ipo','nps','gold','research'])
const loanProductIds=new Set(['home-loan','personal-loan','business-loan','lap'])

interface Props {
  customers:FranchiseeCustomer[]
  focusCustomerId?:string
  onFocusHandled?:()=>void
  onOpen360:(customerId:string)=>void
  onAdd:(input:CustomerOnboardingDraft)=>void
  onSaveDraft:(input:CustomerOnboardingDraft)=>void
  draft?:CustomerOnboardingDraft
  onApply:(customer:FranchiseeCustomer)=>void
  onSupport:(customer:FranchiseeCustomer)=>void
  onToast:(message:string)=>void
}

export function CustomersPage({customers,focusCustomerId,onFocusHandled,onOpen360,onAdd,onSaveDraft,draft,onApply:_,onSupport:__,onToast}:Props){
  const [search,setSearch]=useState('')
  const [kyc,setKyc]=useState('All KYC')
  const [adding,setAdding]=useState(false)
  const rows=useMemo(()=>customers.filter(customer=>(kyc==='All KYC'||customer.kyc===kyc)&&`${customer.name} ${customer.id} ${customer.mobile} ${customer.email}`.toLowerCase().includes(search.toLowerCase())),[customers,search,kyc])

  useEffect(()=>{
    if(!focusCustomerId)return
    if(customers.some(item=>item.id===focusCustomerId))onOpen360(focusCustomerId)
    onFocusHandled?.()
  },[focusCustomerId,customers,onFocusHandled,onOpen360])

  return <div className="franchisee-customers-page">
    <PageHeader eyebrow="CUSTOMER RELATIONSHIPS" title="Customers" description="A clear view of each customer's profile, investments, loans and relationship with your franchise." actions={<button className="tf-primary" onClick={()=>setAdding(true)}><Plus/> Add New Customer</button>}/>
    <Panel title="Customer Directory" subtitle={`${rows.length} customers`}>
      <Filters search={search} onSearch={setSearch}><FilterSelect label="KYC" value={kyc} onChange={setKyc} options={['All KYC','Verified','Pending','Expired']}/></Filters>
      <DataTable headers={['Customer Name','Contact','Direct / Sub-Franchisee','Profile','Investments','Loans','Open 360']} empty={!rows.length}>
        {rows.map(customer=>{
          const profile=customer.profile360
          const legacy=legacyCustomerHoldings[customer.id]||[]
          const investments=profile?.investments||[]
          const loans=profile?.loans||[]
          const legacyInvestments=legacy.filter(item=>investmentProductIds.has(item.productId))
          const legacyLoans=legacy.filter(item=>loanProductIds.has(item.productId))
          const investmentValue=investments.length?investments.reduce((sum,item)=>sum+(item.currentValue||0),0):legacyInvestments.reduce((sum,item)=>sum+(item.currentValue||0),0)
          const loanOutstanding=loans.length?loans.reduce((sum,item)=>sum+(item.outstandingAmount||0),0):legacyLoans.reduce((sum,item)=>sum+(item.currentValue||0),0)
          const investmentCount=investments.length||legacyInvestments.length
          const loanCount=loans.length||legacyLoans.length
          const loanType=loans[0]?.loanType||customer.products.find(product=>/loan/i.test(product)&&!/protector/i.test(product))
          const occupation=profile?.profile.occupation||profile?.basic.industry
          return <tr key={customer.id}>
            <td><button className="tf-link-stack" onClick={()=>onOpen360(customer.id)}><b>{customer.name}</b><small>{customer.id}</small></button></td>
            <td><b>{customer.mobile}</b><small>{customer.email||'Email not recorded'}</small></td>
            <td><b>Direct</b><small>Franchisee customer</small></td>
            <td><b>{profile?.customerType||'Not recorded'}</b><small className="tf-customer-profile"><StatusBadge>{customer.kyc} KYC</StatusBadge>{occupation&&<span>{occupation}</span>}</small></td>
            <td>{investmentCount?<><b>{investmentValue?`${money(investmentValue)} Current Value`:`${investmentCount} Product${investmentCount===1?'':'s'}`}</b><small>{investmentCount} investment{investmentCount===1?'':'s'}</small></>:<span className="tf-customer-none">No Investments</span>}</td>
            <td>{loanCount?<><b>{loanOutstanding?`${money(loanOutstanding)} Outstanding`:`${loanCount} Active Loan${loanCount===1?'':'s'}`}</b><small>{loanType||`${loanCount} loan${loanCount===1?'':'s'}`}</small></>:<span className="tf-customer-none">No Loans</span>}</td>
            <td><button className="tf-customer-open" onClick={()=>onOpen360(customer.id)}>Open 360</button></td>
          </tr>
        })}
      </DataTable>
    </Panel>
    {adding&&<CustomerOnboardingWizard initial={draft} onClose={()=>setAdding(false)} onSaveDraft={value=>{onSaveDraft(value);onToast('Customer onboarding draft saved locally')}} onCreate={value=>{onAdd(value);setAdding(false)}}/>}
  </div>
}
