import { useEffect, useMemo, useState } from 'react'
import { AppShell } from './components/AppShell'
import { Dashboard } from './pages/Dashboard'
import { ApplicationsPage } from './pages/ApplicationsPage'
import { FranchiseesPage } from './pages/FranchiseesPage'
import { GenericPage } from './pages/GenericPage'
import { CustomerProducts } from './pages/CustomerProducts'
import { CustomerCalculator } from './pages/CustomerCalculator'
import { CustomerSupport } from './pages/CustomerSupport'
import { CustomerOffersUpdates } from './pages/CustomerOffersUpdates'
import { CustomerGoals } from './pages/CustomerGoals'
import { roleConfigs } from './config/roles'
import type { Application, Role } from './types'
import { applications as seedApplications } from './data/mockData'
import { FranchiseeApp } from './franchisee/FranchiseeApp'
import { AdminBusinessDetails } from './pages/AdminBusinessDetails'
import { AdminUsersAccess } from './pages/AdminUsersAccess'
import { AdminCustomers } from './pages/AdminCustomers'
import { AdminProductsPartners } from './pages/AdminProductsPartners'
import { AdminReportsMIS } from './pages/AdminReportsMIS'
import { AdminAdministration } from './pages/AdminAdministration'
import { customerGoalsRepository } from './services/customerGoalsService'
import type { CustomerGoal } from './data/customerGoalsData'
import { RMApp } from './rm/RMApp'
import { OperationsApp } from './operations/OperationsApp'
import { TestAdminApp } from './test-admin/TestAdminApp'
import { AdminCommissionPayout } from './pages/AdminCommissionPayout'
import { LoginPage } from './auth/LoginPage'
import { authSession } from './auth/authSession'

const DEFAULT_AUTHENTICATED_PATH = '/admin/dashboard'

const franchiseePages = new Set(['dashboard','customers','employees','sub-franchisees','agents','crm','applications','renewals','products','support','profile','notifications','marketing','training','business-revenue','commission-payout'])
const isFranchiseePage=(page:string)=>franchiseePages.has(page)||/^customers\/[^/]+\/360$/.test(page)||/^sub-franchisees\/[^/]+$/.test(page)
const readInitialWorkspace = ():{role:Role;page:string} => {
  let path=window.location.pathname
  if(path.startsWith('/test-admin')){
    const page=path.split('/').filter(Boolean)[1]||'dashboard'
    return {role:'test-admin',page}
  }
  if(path.startsWith('/test-franchisee')){
    path=path.replace('/test-franchisee','/franchisee')
    window.history.replaceState({},'',path||'/franchisee/dashboard')
  }
  if(path.startsWith('/franchisee')){
    const page=path.split('/').filter(Boolean).slice(1).join('/')||'dashboard'
    return {role:'franchisee',page:isFranchiseePage(page)?page:'dashboard'}
  }
  if(path.startsWith('/rm')){
    const page=path.split('/').filter(Boolean)[1]||'dashboard'
    return {role:'rm',page}
  }
  if(path.startsWith('/operations')){
    const requestedPage=path.split('/').filter(Boolean)[1]||'dashboard'
    const page=['queue','my-queue'].includes(requestedPage)?'applications':requestedPage
    if(page!==requestedPage)window.history.replaceState({},'',`/operations/${page}`)
    return {role:'operations',page}
  }
  if(path.startsWith('/admin')){
    const page=path.split('/').filter(Boolean)[1]||'dashboard'
    return {role:'admin',page}
  }
  return {role:'admin',page:'dashboard'}
}

export default function App() {
  const initial=readInitialWorkspace()
  const [authenticated, setAuthenticated] = useState(authSession.isAuthenticated)
  const [role, setRole] = useState<Role>(initial.role)
  const [page, setPage] = useState(initial.page)
  const [applications, setApplications] = useState<Application[]>(seedApplications)
  const [customerGoals, setCustomerGoals] = useState<CustomerGoal[]>(customerGoalsRepository.load)
  const [toast, setToast] = useState('')
  const config = roleConfigs[role]

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [role])

  useEffect(() => {
    const syncFromUrl=()=>{
      if (!authSession.isAuthenticated()) {
        if (window.location.pathname !== '/login') window.history.replaceState({},'', '/login')
        setAuthenticated(false)
        return
      }
      if (window.location.pathname === '/login') window.history.replaceState({},'',DEFAULT_AUTHENTICATED_PATH)
      const current=readInitialWorkspace();setRole(current.role);setPage(current.page)
    }
    syncFromUrl()
    window.addEventListener('popstate',syncFromUrl)
    return()=>window.removeEventListener('popstate',syncFromUrl)
  },[authenticated])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(()=>customerGoalsRepository.save(customerGoals),[customerGoals])

  const visibleApplications = useMemo(() => {
    let rows = applications.filter(a => config.allowedProducts.includes(a.product))
    if (role === 'customer') rows = rows.filter(a => a.customer === 'Vivek Joshi')
    if (role === 'franchisee') rows = rows.filter(a => a.franchisee === 'Troth Finserve')
    if (role === 'rm') rows = rows.filter(a => a.rm === 'Rohan Mehta')
    return rows
  }, [applications, config.allowedProducts, role])

  const navigate = (next: string, filter?: string) => {
    if (filter) sessionStorage.setItem('troth-filter', filter)
    if(role==='franchisee'&&isFranchiseePage(next)) window.history.pushState({},'',`/franchisee/${next}`)
    if(role==='admin')window.history.pushState({},'',`/admin/${next}`)
    if(role==='test-admin')window.history.pushState({},'',`/test-admin/${next}`)
    setPage(next)
  }

  const changeRole=(next:Role)=>{
    setRole(next)
    setPage('dashboard')
    window.history.pushState({},'',next==='franchisee'?'/franchisee/dashboard':next==='rm'?'/rm/dashboard':next==='operations'?'/operations/dashboard':next==='test-admin'?'/test-admin/dashboard':next==='admin'?'/admin/dashboard':'/')
  }

  const updateApplication = (id: string, patch: Partial<Application>) => {
    setApplications(current => current.map(a => a.id === id ? {...a, ...patch, updated: '02 Sep 2026'} : a))
    setToast('Application updated successfully')
  }
  const createApplication = (application:Application) => {
    setApplications(current=>[application,...current])
    setToast(`${application.id} created in the shared application workspace`)
  }

  const handleLogout = () => {
    ['troth-filter','troth-open-app','troth-product-filter','troth-product-focus','troth-support-request','troth-open-profile-section'].forEach(key=>sessionStorage.removeItem(key))
    authSession.signOut()
    setAuthenticated(false)
    setPage('dashboard')
    setToast('')
    window.history.replaceState({},'', '/login')
  }

  const handleLogin = (username:string,password:string) => {
    if (!authSession.signIn(username,password)) return false
    window.history.replaceState({},'',DEFAULT_AUTHENTICATED_PATH)
    setRole('admin')
    setPage('dashboard')
    setAuthenticated(true)
    return true
  }

  if(!authenticated) return <LoginPage onLogin={handleLogin}/>

  let content
  if (role === 'franchisee') content = <FranchiseeApp page={page} onNavigate={navigate} />
  else if (page === 'dashboard') content = <Dashboard role={role} apps={visibleApplications} customerGoals={customerGoals} onNavigate={navigate} onToast={setToast} />
  else if (role === 'admin' && page === 'business-details') content = <AdminBusinessDetails apps={visibleApplications} onNavigate={navigate} />
  else if (role === 'admin' && page === 'users') content = <AdminUsersAccess onToast={setToast} />
  else if (role === 'admin' && page === 'customers') content = <AdminCustomers apps={visibleApplications} onNavigate={navigate} onToast={setToast} />
  else if (role === 'admin' && page === 'products') content = <AdminProductsPartners apps={visibleApplications} onNavigate={navigate} onToast={setToast} />
  else if (role === 'admin' && page === 'reports') content = <AdminReportsMIS apps={visibleApplications} onNavigate={navigate} onToast={setToast} />
  else if (role === 'admin' && page === 'administration') content = <AdminAdministration onToast={setToast} />
  else if (role === 'admin' && page === 'commission-payout') content = <AdminCommissionPayout onToast={setToast} />
  else if (page === 'applications' || page === 'work-queue') content = <ApplicationsPage role={role} apps={visibleApplications} onUpdate={updateApplication} onToast={setToast} />
  else if (page === 'franchisees') content = <FranchiseesPage role={role} onToast={setToast} />
  else if (role === 'customer' && page === 'my-products') content = <CustomerProducts onToast={setToast} />
  else if (role === 'customer' && page === 'goals') content = <CustomerGoals goals={customerGoals} setGoals={setCustomerGoals} onNavigate={navigate} onToast={setToast} />
  else if (role === 'customer' && page === 'calculator') content = <CustomerCalculator onNavigate={navigate} onToast={setToast} />
  else if (role === 'customer' && page === 'offers-updates') content = <CustomerOffersUpdates onNavigate={navigate} />
  else if (role === 'customer' && page === 'support') content = <CustomerSupport apps={visibleApplications} onNavigate={navigate} onToast={setToast} />
  else content = <GenericPage role={role} page={page} apps={visibleApplications} onNavigate={navigate} onToast={setToast} />

  if(role==='rm') return <><RMApp initialPage={page} onRoleChange={changeRole} onLogout={handleLogout} onToast={setToast}/>{toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}</>
  if(role==='operations') return <><OperationsApp initialPage={page} onRoleChange={changeRole} onLogout={handleLogout} onToast={setToast}/>{toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}</>
  if(role==='test-admin') return <><TestAdminApp initialPage={page} applications={applications} onCreateApplication={createApplication} onUpdateApplication={updateApplication} onRoleChange={changeRole} onLogout={handleLogout} onToast={setToast}/>{toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}</>

  return (
    <AppShell role={role} page={page} onRoleChange={changeRole} onNavigate={navigate} onLogout={handleLogout}>
      {content}
      {toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}
    </AppShell>
  )
}
