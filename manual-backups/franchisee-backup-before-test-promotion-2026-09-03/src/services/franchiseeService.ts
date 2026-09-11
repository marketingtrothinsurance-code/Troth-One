import { franchiseeBusinessWorkspace, franchiseeCustomers, franchiseeLeads, franchiseeNotifications } from '../data/franchiseeData'
import type { FranchiseeBusinessWorkspace, FranchiseeCustomer, FranchiseeLead, FranchiseeNotification } from '../types/franchisee'

const cloneCustomers = ():FranchiseeCustomer[] => franchiseeCustomers.map(customer=>({
  ...customer,
  products:[...customer.products],
  applicationIds:[...customer.applicationIds],
  notes:customer.notes.map(note=>({...note})),
  activities:customer.activities.map(activity=>({...activity})),
  documents:customer.documents.map(document=>({...document})),
  serviceHistory:customer.serviceHistory.map(record=>({...record}))
}))

const cloneLeads = ():FranchiseeLead[] => franchiseeLeads.map(lead=>({...lead}))
const cloneNotifications = ():FranchiseeNotification[] => franchiseeNotifications.map(notification=>({...notification}))
const getBusinessWorkspace = ():FranchiseeBusinessWorkspace => ({
  summary:{...franchiseeBusinessWorkspace.summary},
  trend:franchiseeBusinessWorkspace.trend.map(item=>({...item})),
  productPerformance:franchiseeBusinessWorkspace.productPerformance.map(item=>({...item})),
  records:franchiseeBusinessWorkspace.records.map(item=>({...item}))
})

// This local repository is the single swap point for a future API-backed implementation.
export const franchiseeRepository = {
  listCustomers:cloneCustomers,
  listLeads:cloneLeads,
  listNotifications:cloneNotifications,
  getBusinessWorkspace
}
