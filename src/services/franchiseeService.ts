import { franchiseeCustomers, franchiseeLeads, franchiseeNotifications } from '../data/franchiseeData'
import type { FranchiseeCustomer, FranchiseeLead, FranchiseeNotification } from '../types/franchisee'

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

// This local repository is the single swap point for a future API-backed implementation.
export const franchiseeRepository = {
  listCustomers:cloneCustomers,
  listLeads:cloneLeads,
  listNotifications:cloneNotifications
}

