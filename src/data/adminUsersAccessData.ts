import type { ProductType } from '../types'

export type UserAccessStatus = 'Active' | 'Inactive' | 'Pending Invite' | 'Suspended'
export type UserAccessRole = 'Admin' | 'Relationship Manager' | 'Head Office Operations' | 'Franchisee User'
export type PermissionLevel = 'View' | 'View Assigned' | 'Create' | 'Edit' | 'Assign' | 'Approve' | 'Export' | 'Manage' | 'Update Status'

export interface ModulePermission {
  module: string
  permissions: PermissionLevel[]
}

export interface PlatformUser {
  id: string
  name: string
  email: string
  mobile: string
  role: UserAccessRole
  assignment: string
  region?: string
  manager?: string
  productAccess: ProductType[]
  status: UserAccessStatus
  lastActive: string
  createdAt: string
  modulePermissions: ModulePermission[]
}

export interface UserAccessActivity {
  id: string
  userId?: string
  title: string
  description: string
  timestamp: string
}

export interface AccessReview {
  id: string
  userId: string
  reason: string
  due: string
}

export const accessProducts: ProductType[] = ['Insurance','Loans','Loan Protector','Mutual Fund','Demat','Research','Advisory']

export const permissionOptions: Record<string,PermissionLevel[]> = {
  Dashboard:['View'],
  Franchisees:['View','View Assigned','Edit','Assign','Manage'],
  'Users & Access':['View','Manage'],
  Customers:['View','View Assigned','Create','Edit','Manage'],
  Applications:['View','View Assigned','Create','Edit','Assign','Approve','Export','Update Status'],
  Products:['View','Manage'],
  Operations:['View','Assign','Manage','Update Status'],
  Support:['View','Create','Edit','Manage'],
  'Reports & MIS':['View','View Assigned','Export'],
  Administration:['View','Manage'],
}

const allProducts=[...accessProducts]
const adminPermissions:ModulePermission[]=Object.entries(permissionOptions).map(([module,permissions])=>({module,permissions:[...permissions]}))
const rmPermissions:ModulePermission[]=[
  {module:'Dashboard',permissions:['View']},{module:'Franchisees',permissions:['View Assigned']},
  {module:'Customers',permissions:['View Assigned']},{module:'Applications',permissions:['View Assigned','Edit']},
  {module:'Support',permissions:['View','Create']},{module:'Reports & MIS',permissions:['View Assigned','Export']},
]
const operationsPermissions:ModulePermission[]=[
  {module:'Dashboard',permissions:['View']},{module:'Applications',permissions:['View','Edit','Update Status']},
  {module:'Operations',permissions:['View','Update Status']},{module:'Support',permissions:['View','Edit']},
]
const franchiseePermissions:ModulePermission[]=[
  {module:'Dashboard',permissions:['View']},{module:'Customers',permissions:['View','Create','Edit']},
  {module:'Applications',permissions:['View','Create','Edit']},{module:'Products',permissions:['View']},
  {module:'Support',permissions:['View','Create']},{module:'Reports & MIS',permissions:['View']},
]

export function permissionsForRole(role:UserAccessRole):ModulePermission[] {
  const source=role==='Admin'?adminPermissions:role==='Relationship Manager'?rmPermissions:role==='Head Office Operations'?operationsPermissions:franchiseePermissions
  return source.map(item=>({...item,permissions:[...item.permissions]}))
}

export function productsForRole(role:UserAccessRole):ProductType[] {
  return role==='Head Office Operations'?['Insurance','Loan Protector']:[...allProducts]
}

export const platformUsers:PlatformUser[] = [
  {id:'USR-001',name:'Aarav Shukla',email:'aarav.shukla@trothone.in',mobile:'+91 98765 10001',role:'Admin',assignment:'Head Office',region:'All India',productAccess:allProducts,status:'Active',lastActive:'Today, 09:42',createdAt:'12 Jan 2024',modulePermissions:permissionsForRole('Admin')},
  {id:'USR-002',name:'Rohan Mehta',email:'rohan.mehta@trothone.in',mobile:'+91 98765 10002',role:'Relationship Manager',assignment:'West Region',region:'West',manager:'Kavya Shah',productAccess:allProducts,status:'Active',lastActive:'Today, 08:55',createdAt:'18 Mar 2024',modulePermissions:permissionsForRole('Relationship Manager')},
  {id:'USR-003',name:'Priya Nair',email:'priya.nair@trothone.in',mobile:'+91 98765 10003',role:'Head Office Operations',assignment:'Insurance Operations',region:'Head Office',manager:'Aarav Shukla',productAccess:['Insurance','Loan Protector'],status:'Active',lastActive:'Yesterday, 18:24',createdAt:'22 Apr 2024',modulePermissions:permissionsForRole('Head Office Operations')},
  {id:'USR-004',name:'Neha Sharma',email:'neha.sharma@trothfinserve.in',mobile:'+91 98765 10004',role:'Franchisee User',assignment:'Troth Finserve',region:'Ahmedabad',manager:'Rohan Mehta',productAccess:allProducts,status:'Active',lastActive:'2 days ago',createdAt:'09 May 2024',modulePermissions:permissionsForRole('Franchisee User')},
  {id:'USR-005',name:'Ira Patel',email:'ira.patel@trothone.in',mobile:'+91 98765 10005',role:'Relationship Manager',assignment:'Central Gujarat',region:'West',manager:'Kavya Shah',productAccess:['Insurance','Loans','Loan Protector','Mutual Fund'],status:'Active',lastActive:'Today, 09:06',createdAt:'14 Jun 2024',modulePermissions:permissionsForRole('Relationship Manager')},
  {id:'USR-006',name:'Ritu Kapoor',email:'ritu.kapoor@trothone.in',mobile:'+91 98765 10006',role:'Head Office Operations',assignment:'Loan Protector Queue',region:'Head Office',manager:'Priya Nair',productAccess:['Loan Protector'],status:'Active',lastActive:'Today, 08:21',createdAt:'03 Jul 2024',modulePermissions:permissionsForRole('Head Office Operations')},
  {id:'USR-007',name:'Harsh Vyas',email:'harsh.vyas@trothone.in',mobile:'+91 98765 10007',role:'Head Office Operations',assignment:'Insurance Operations',region:'Head Office',manager:'Priya Nair',productAccess:['Insurance'],status:'Inactive',lastActive:'18 Aug 2026',createdAt:'11 Sep 2024',modulePermissions:permissionsForRole('Head Office Operations')},
  {id:'USR-008',name:'Anmol Singh',email:'anmol.singh@trothone.in',mobile:'+91 98765 10008',role:'Head Office Operations',assignment:'Central Operations',region:'Head Office',manager:'Priya Nair',productAccess:['Insurance','Loan Protector'],status:'Suspended',lastActive:'26 Aug 2026',createdAt:'20 Oct 2024',modulePermissions:permissionsForRole('Head Office Operations')},
  {id:'USR-009',name:'Amit Shah',email:'amit.shah@navkar.in',mobile:'+91 98765 10009',role:'Franchisee User',assignment:'Navkar Associates',region:'Ahmedabad',manager:'Rohan Mehta',productAccess:allProducts,status:'Pending Invite',lastActive:'Invite sent 01 Sep',createdAt:'01 Sep 2026',modulePermissions:permissionsForRole('Franchisee User')},
  {id:'USR-010',name:'Meera Desai',email:'meera.desai@bluepeak.in',mobile:'+91 98765 10010',role:'Franchisee User',assignment:'BluePeak Capital',region:'Surat',manager:'Ira Patel',productAccess:['Insurance','Loans','Mutual Fund'],status:'Pending Invite',lastActive:'Invite sent 31 Aug',createdAt:'31 Aug 2026',modulePermissions:permissionsForRole('Franchisee User')},
  {id:'USR-011',name:'Kabir Joshi',email:'kabir.joshi@trothone.in',mobile:'+91 98765 10011',role:'Relationship Manager',assignment:'Saurashtra Region',region:'West',manager:'Kavya Shah',productAccess:allProducts,status:'Pending Invite',lastActive:'Invite sent 30 Aug',createdAt:'30 Aug 2026',modulePermissions:permissionsForRole('Relationship Manager')},
]

export const accessReviews:AccessReview[] = [
  {id:'REV-001',userId:'USR-003',reason:'Review product access',due:'Due 05 Sep'},
  {id:'REV-002',userId:'USR-004',reason:'Review franchisee assignment',due:'Due 07 Sep'},
]

export const accessActivity:UserAccessActivity[] = [
  {id:'ACT-001',userId:'USR-002',title:'Rohan Mehta permissions updated',description:'Assigned-portfolio access confirmed by Aarav Shukla',timestamp:'10:24'},
  {id:'ACT-002',userId:'USR-009',title:'New user invite sent to Amit Shah',description:'Franchisee User · Navkar Associates',timestamp:'09:58'},
  {id:'ACT-003',userId:'USR-003',title:'Priya Nair product access updated',description:'Loan Protector access retained',timestamp:'Yesterday'},
  {id:'ACT-004',userId:'USR-004',title:'Neha Sharma account activated',description:'Access enabled for Troth Finserve',timestamp:'Yesterday'},
  {id:'ACT-005',userId:'USR-008',title:'Anmol Singh account suspended',description:'Manual review requested by Platform Admin',timestamp:'29 Aug'},
]
