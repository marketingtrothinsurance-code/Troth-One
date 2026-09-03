import { useEffect, useMemo, useState } from 'react'
import { AppShell } from './components/AppShell'
import { Dashboard } from './pages/Dashboard'
import { ApplicationsPage } from './pages/ApplicationsPage'
import { FranchiseesPage } from './pages/FranchiseesPage'
import { GenericPage } from './pages/GenericPage'
import { CustomerProducts } from './pages/CustomerProducts'
import { CustomerCalculator } from './pages/CustomerCalculator'
import { CustomerSupport } from './pages/CustomerSupport'
import { FranchiseeSupport } from './pages/FranchiseeSupport'
import { FranchiseeDashboard } from './pages/FranchiseeDashboard'
import { FranchiseeCustomers } from './pages/FranchiseeCustomers'
import { FranchiseeCRM } from './pages/FranchiseeCRM'
import { FranchiseeBusiness } from './pages/FranchiseeBusiness'
import { roleConfigs } from './config/roles'
import type { Application, Role } from './types'
import type { FranchiseeCustomer, FranchiseeLead } from './types/franchisee'
import { applications as seedApplications } from './data/mockData'
import { franchiseeRepository } from './services/franchiseeService'

export default function App() {
  const [role, setRole] = useState<Role>('admin')
  const [page, setPage] = useState('dashboard')
  const [applications, setApplications] = useState<Application[]>(seedApplications)
  const [franchiseeCustomers, setFranchiseeCustomers] = useState<FranchiseeCustomer[]>(()=>franchiseeRepository.listCustomers())
  const [franchiseeLeads, setFranchiseeLeads] = useState<FranchiseeLead[]>(()=>franchiseeRepository.listLeads())
  const [franchiseeNotifications] = useState(()=>franchiseeRepository.listNotifications())
  const [toast, setToast] = useState('')
  const config = roleConfigs[role]

  useEffect(() => {
    setPage('dashboard')
    window.scrollTo(0, 0)
  }, [role])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  const visibleApplications = useMemo(() => {
    let rows = applications.filter(a => config.allowedProducts.includes(a.product))
    if (role === 'customer') rows = rows.filter(a => a.customer === 'Vivek Joshi')
    if (role === 'franchisee') rows = rows.filter(a => a.franchisee === 'Troth Finserve')
    if (role === 'rm') rows = rows.filter(a => a.rm === 'Rohan Mehta')
    return rows
  }, [applications, config.allowedProducts, role])

  const navigate = (next: string, filter?: string) => {
    if (filter) sessionStorage.setItem('troth-filter', filter)
    setPage(next)
  }

  const updateApplication = (id: string, patch: Partial<Application>) => {
    setApplications(current => current.map(a => a.id === id ? {...a, ...patch, updated: '02 Sep 2026'} : a))
    setToast('Application updated successfully')
  }

  const handleLogout = () => {
    ['troth-filter','troth-open-app','troth-product-filter','troth-product-focus','troth-support-request','troth-open-profile-section'].forEach(key=>sessionStorage.removeItem(key))
    setPage('dashboard')
    setToast('Logout requires authentication integration; prototype session retained')
  }

  const addFranchiseeCustomer = (customer: FranchiseeCustomer) => setFranchiseeCustomers(current => [customer, ...current])
  const updateFranchiseeCustomer = (id: string, patch: Partial<FranchiseeCustomer>) => setFranchiseeCustomers(current => current.map(customer => customer.id === id ? {...customer, ...patch} : customer))
  const addFranchiseeLead = (lead: FranchiseeLead) => setFranchiseeLeads(current => [lead, ...current])
  const updateFranchiseeLead = (id: string, patch: Partial<FranchiseeLead>) => setFranchiseeLeads(current => current.map(lead => lead.id === id ? {...lead, ...patch} : lead))
  const convertFranchiseeLead = (lead: FranchiseeLead) => {
    if (!franchiseeCustomers.some(customer => customer.email === lead.email)) {
      addFranchiseeCustomer({id:`CU-${1100+franchiseeCustomers.length+1}`,name:lead.name,mobile:lead.mobile,email:lead.email,city:lead.city,source:lead.source,relationshipStatus:'Prospect',kycStatus:lead.kycStatus==='Completed'?'Verified':'Pending',products:[],applicationIds:[],businessValue:0,assignedTo:lead.owner,lastContact:'03 Sep 2026',nextFollowUp:lead.nextFollowUp,notes:[],activities:[{title:`Converted from lead ${lead.id}`,date:'03 Sep 2026 • Just now'}],documents:[{name:'PAN card',status:lead.kycStatus==='Completed'?'Verified':'Missing'},{name:'Aadhaar card',status:lead.kycStatus==='Completed'?'Verified':'Missing'},{name:'Cancelled cheque',status:'Missing'}],serviceHistory:[]})
    }
    updateFranchiseeLead(lead.id,{stage:'Converted',lastActivity:'Converted to customer'})
    setToast(`${lead.name} converted to a customer`)
  }

  let content
  if (role === 'franchisee' && page === 'dashboard') content = <FranchiseeDashboard apps={visibleApplications} customers={franchiseeCustomers} leads={franchiseeLeads} notifications={franchiseeNotifications} onNavigate={navigate} onToast={setToast} />
  else if (page === 'dashboard') content = <Dashboard role={role} apps={visibleApplications} onNavigate={navigate} onToast={setToast} />
  else if (role === 'franchisee' && page === 'customers') content = <FranchiseeCustomers customers={franchiseeCustomers} apps={visibleApplications} onAdd={addFranchiseeCustomer} onUpdate={updateFranchiseeCustomer} onNavigate={navigate} onToast={setToast} />
  else if (role === 'franchisee' && page === 'crm') content = <FranchiseeCRM leads={franchiseeLeads} onAdd={addFranchiseeLead} onUpdate={updateFranchiseeLead} onConvert={convertFranchiseeLead} onNavigate={navigate} onToast={setToast} />
  else if (role === 'franchisee' && page === 'business') content = <FranchiseeBusiness />
  else if (page === 'applications' || page === 'work-queue') content = <ApplicationsPage role={role} apps={visibleApplications} onUpdate={updateApplication} onToast={setToast} />
  else if (page === 'franchisees') content = <FranchiseesPage role={role} onToast={setToast} />
  else if (role === 'customer' && page === 'my-products') content = <CustomerProducts onToast={setToast} />
  else if (role === 'customer' && page === 'calculator') content = <CustomerCalculator onNavigate={navigate} onToast={setToast} />
  else if (role === 'customer' && page === 'support') content = <CustomerSupport apps={visibleApplications} onNavigate={navigate} onToast={setToast} />
  else if (role === 'franchisee' && page === 'support') content = <FranchiseeSupport onToast={setToast} />
  else content = <GenericPage role={role} page={page} apps={visibleApplications} onNavigate={navigate} onToast={setToast} />

  return (
    <AppShell role={role} page={page} onRoleChange={setRole} onNavigate={navigate} onLogout={handleLogout}>
      {content}
      {toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}
    </AppShell>
  )
}
