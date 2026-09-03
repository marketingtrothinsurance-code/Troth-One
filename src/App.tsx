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
import { roleConfigs } from './config/roles'
import type { Application, Role } from './types'
import { applications as seedApplications } from './data/mockData'

export default function App() {
  const [role, setRole] = useState<Role>('admin')
  const [page, setPage] = useState('dashboard')
  const [applications, setApplications] = useState<Application[]>(seedApplications)
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

  let content
  if (page === 'dashboard') content = <Dashboard role={role} apps={visibleApplications} onNavigate={navigate} onToast={setToast} />
  else if (page === 'applications' || page === 'work-queue') content = <ApplicationsPage role={role} apps={visibleApplications} onUpdate={updateApplication} onToast={setToast} />
  else if (page === 'franchisees') content = <FranchiseesPage role={role} onToast={setToast} />
  else if (role === 'customer' && page === 'my-products') content = <CustomerProducts onToast={setToast} />
  else if (role === 'customer' && page === 'calculator') content = <CustomerCalculator onNavigate={navigate} onToast={setToast} />
  else if (role === 'customer' && page === 'support') content = <CustomerSupport apps={visibleApplications} onNavigate={navigate} onToast={setToast} />
  else if (role === 'franchisee' && page === 'support') content = <FranchiseeSupport onToast={setToast} />
  else content = <GenericPage role={role} page={page} apps={visibleApplications} onNavigate={navigate} onToast={setToast} />

  return (
    <AppShell role={role} page={page} onRoleChange={setRole} onNavigate={navigate}>
      {content}
      {toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}
    </AppShell>
  )
}
