export type AdminActivityIcon = 'application' | 'customer' | 'support' | 'created'

export interface AdminActivityItem {
  time: string
  title: string
  detail: string
  icon: AdminActivityIcon
}

export const adminDashboardFixture = {
  approvalsPending: 7,
  supportPending: 5,
  overdueSupport: 3,
  belowTargetFranchisees: 3,
  inactiveBusinessFranchisees: 1,
} as const

export const adminActivity: AdminActivityItem[] = [
  {time:'09:48', title:'Application status updated', detail:'T1-20260043 → Action Required', icon:'application'},
  {time:'09:31', title:'Customer added', detail:'Rakesh Shah', icon:'customer'},
  {time:'09:10', title:'Support request received', detail:'Troth Finserve', icon:'support'},
  {time:'08:52', title:'Application created', detail:'Health Insurance', icon:'created'},
]
