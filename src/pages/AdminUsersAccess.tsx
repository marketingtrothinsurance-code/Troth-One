import { useMemo, useState } from 'react'
import { Activity, Check, ChevronRight, Clock3, Edit3, KeyRound, Plus, RefreshCw, ShieldCheck, UserCheck, UserCog, UserPlus, Users, X } from 'lucide-react'
import { PageHeader, SearchBox, Select, StatCard } from '../components/UI'
import {
  accessActivity,
  accessProducts,
  accessReviews,
  permissionOptions,
  permissionsForRole,
  platformUsers,
  productsForRole,
  type PermissionLevel,
  type PlatformUser,
  type UserAccessRole,
  type UserAccessStatus,
} from '../data/adminUsersAccessData'
import type { ProductType } from '../types'

interface Props { onToast:(message:string)=>void }
type AccessTab = 'Overview' | 'Role & Access' | 'Product Access' | 'Assignments' | 'Activity'

const roles:UserAccessRole[]=['Admin','Relationship Manager','Head Office Operations','Franchisee User']
const statuses:UserAccessStatus[]=['Active','Inactive','Pending Invite','Suspended']
const tabs:AccessTab[]=['Overview','Role & Access','Product Access','Assignments','Activity']

export function AdminUsersAccess({onToast}:Props) {
  const [users,setUsers]=useState<PlatformUser[]>(platformUsers)
  const [search,setSearch]=useState('')
  const [roleFilter,setRoleFilter]=useState('All Roles')
  const [statusFilter,setStatusFilter]=useState('All Statuses')
  const [productFilter,setProductFilter]=useState('All Products')
  const [selectedId,setSelectedId]=useState<string|null>(null)
  const [formUser,setFormUser]=useState<PlatformUser|null|undefined>(undefined)
  const selected=users.find(user=>user.id===selectedId)||null

  const rows=useMemo(()=>users.filter(user=>{
    const query=search.trim().toLowerCase()
    const matchesQuery=!query||[user.name,user.email,user.role,user.assignment].some(value=>value.toLowerCase().includes(query))
    return matchesQuery&&(roleFilter==='All Roles'||user.role===roleFilter)&&(statusFilter==='All Statuses'||user.status===statusFilter)&&(productFilter==='All Products'||user.productAccess.includes(productFilter as ProductType))
  }),[users,search,roleFilter,statusFilter,productFilter])

  const updateUser=(id:string,patch:Partial<PlatformUser>)=>setUsers(current=>current.map(user=>user.id===id?{...user,...patch}:user))
  const toggleStatus=(user:PlatformUser)=>{
    const status:UserAccessStatus=user.status==='Active'?'Inactive':'Active'
    updateUser(user.id,{status})
    onToast(`${user.name} ${status==='Active'?'activated':'deactivated'} locally`)
  }
  const toggleProduct=(user:PlatformUser,product:ProductType)=>{
    const productAccess=user.productAccess.includes(product)?user.productAccess.filter(item=>item!==product):[...user.productAccess,product]
    updateUser(user.id,{productAccess})
  }
  const togglePermission=(user:PlatformUser,module:string,permission:PermissionLevel)=>{
    const existing=user.modulePermissions.find(item=>item.module===module)
    const permissions=existing?.permissions.includes(permission)?existing.permissions.filter(item=>item!==permission):[...(existing?.permissions||[]),permission]
    const modulePermissions=existing
      ? user.modulePermissions.map(item=>item.module===module?{...item,permissions}:item)
      : [...user.modulePermissions,{module,permissions}]
    updateUser(user.id,{modulePermissions})
  }
  const saveUser=(draft:UserDraft)=>{
    if(formUser){
      updateUser(formUser.id,{...draft,modulePermissions:draft.role===formUser.role?formUser.modulePermissions:permissionsForRole(draft.role)})
      onToast(`${draft.name} updated locally`)
    }else{
      const created:PlatformUser={
        ...draft,id:`USR-${String(users.length+1).padStart(3,'0')}`,lastActive:draft.status==='Pending Invite'?'Invite ready to send':'Not signed in',createdAt:'05 Sep 2026',
        modulePermissions:permissionsForRole(draft.role),
      }
      setUsers(current=>[created,...current])
      onToast(`${draft.name} added to the local directory`)
    }
    setFormUser(undefined)
  }

  return <div className="page admin-users-access">
    <PageHeader eyebrow="PLATFORM ACCESS" title="Users & Access" description="Manage platform users, roles, assignments and permissions." actions={<button className="primary-btn" onClick={()=>setFormUser(null)}><Plus/> Add User</button>}/>

    <section className="access-summary-grid">
      <StatCard label="Active Users" value={users.filter(user=>user.status==='Active').length} meta="Can access the platform" tone="green" icon={<UserCheck/>}/>
      <StatCard label="Pending Invites" value={users.filter(user=>user.status==='Pending Invite').length} meta="Awaiting account activation" tone="blue" icon={<UserPlus/>}/>
      <StatCard label="Roles" value={new Set(users.map(user=>user.role)).size} meta="Configured access profiles" tone="violet" icon={<ShieldCheck/>}/>
      <StatCard label="Access Reviews" value={accessReviews.length} meta="Require admin review" tone="amber" icon={<KeyRound/>}/>
    </section>

    <section className="panel access-directory-panel">
      <div className="panel-head"><div><b>User Directory</b><small>Manage users and their platform access.</small></div><span>{rows.length} of {users.length} users</span></div>
      <div className="access-directory-toolbar">
        <SearchBox value={search} onChange={setSearch} placeholder="Search users, email or assignment"/>
        <div>
          <Select value={roleFilter} onChange={setRoleFilter}>{['All Roles',...roles].map(item=><option key={item}>{item}</option>)}</Select>
          <Select value={statusFilter} onChange={setStatusFilter}>{['All Statuses',...statuses].map(item=><option key={item}>{item}</option>)}</Select>
          <Select value={productFilter} onChange={setProductFilter}>{['All Products',...accessProducts].map(item=><option key={item}>{item}</option>)}</Select>
        </div>
      </div>
      <div className="access-table-wrap"><table className="access-user-table"><thead><tr><th>User</th><th>Role</th><th>Assigned To</th><th>Product Access</th><th>Last Active</th><th>Status</th><th>Actions</th></tr></thead><tbody>{rows.map(user=><tr key={user.id} onClick={()=>setSelectedId(user.id)}>
        <td data-label="User"><span className="access-avatar">{initials(user.name)}</span><span><b>{user.name}</b><small>{user.email}</small></span></td>
        <td data-label="Role"><b>{user.role}</b></td><td data-label="Assigned To"><b>{user.assignment}</b><small>{user.region}</small></td>
        <td data-label="Product Access"><ProductAccessSummary user={user}/></td><td data-label="Last Active"><span>{user.lastActive}</span></td><td data-label="Status"><AccessStatusBadge status={user.status}/></td>
        <td data-label="Actions"><div className="access-row-actions"><button onClick={event=>{event.stopPropagation();setSelectedId(user.id)}}>Manage</button><button aria-label={`Edit ${user.name}`} onClick={event=>{event.stopPropagation();setFormUser(user)}}><Edit3/></button>{user.status==='Pending Invite'?<button aria-label={`Resend invite to ${user.name}`} onClick={event=>{event.stopPropagation();onToast(`Invite resent to ${user.email}`)}}><RefreshCw/></button>:<button onClick={event=>{event.stopPropagation();toggleStatus(user)}}>{user.status==='Active'?'Deactivate':'Activate'}</button>}</div></td>
      </tr>)}</tbody></table></div>
      {!rows.length&&<div className="access-empty"><Users/><b>No users match these filters</b><p>Clear the search or adjust the access filters.</p><button onClick={()=>{setSearch('');setRoleFilter('All Roles');setStatusFilter('All Statuses');setProductFilter('All Products')}}>Clear filters</button></div>}
    </section>

    <section className="access-insight-grid">
      <article className="panel"><div className="panel-head"><div><b>Access Reviews</b><small>Permissions and assignments requiring confirmation</small></div><span>{accessReviews.length} pending</span></div><div className="access-review-list">{accessReviews.map(review=>{const user=users.find(item=>item.id===review.userId);return user&&<button key={review.id} onClick={()=>setSelectedId(user.id)}><span className="review-icon"><UserCog/></span><span><b>{user.name}</b><small>{user.role} · {review.reason}</small></span><em>{review.due}</em><ChevronRight/></button>})}</div></article>
      <article className="panel"><div className="panel-head"><div><b>Recent Access Activity</b><small>User and permission management only</small></div></div><div className="access-activity-list">{accessActivity.slice(0,4).map(item=><div key={item.id}><time>{item.timestamp}</time><span><Activity/></span><p><b>{item.title}</b><small>{item.description}</small></p></div>)}</div></article>
    </section>

    {selected&&<UserAccessDrawer user={selected} onClose={()=>setSelectedId(null)} onEdit={()=>setFormUser(selected)} onToggleStatus={()=>toggleStatus(selected)} onToggleProduct={product=>toggleProduct(selected,product)} onTogglePermission={(module,permission)=>togglePermission(selected,module,permission)} onToast={onToast}/>} 
    {formUser!==undefined&&<UserForm user={formUser} onClose={()=>setFormUser(undefined)} onSave={saveUser}/>} 
  </div>
}

function ProductAccessSummary({user}:{user:PlatformUser}) {
  if(user.productAccess.length===accessProducts.length)return <span className="access-scope">All Products</span>
  if(user.role==='Relationship Manager')return <span className="access-scope">Assigned Portfolio</span>
  return <span className="access-product-summary">{user.productAccess.slice(0,2).join(', ')}{user.productAccess.length>2&&<small> +{user.productAccess.length-2}</small>}</span>
}

function AccessStatusBadge({status}:{status:UserAccessStatus}) {
  return <span className={`access-status access-status-${status.toLowerCase().replaceAll(' ','-')}`}><i/>{status}</span>
}

function UserAccessDrawer({user,onClose,onEdit,onToggleStatus,onToggleProduct,onTogglePermission,onToast}:{user:PlatformUser;onClose:()=>void;onEdit:()=>void;onToggleStatus:()=>void;onToggleProduct:(product:ProductType)=>void;onTogglePermission:(module:string,permission:PermissionLevel)=>void;onToast:(message:string)=>void}) {
  const [tab,setTab]=useState<AccessTab>('Overview')
  const userActivity=accessActivity.filter(item=>item.userId===user.id)
  return <><button className="drawer-scrim" onClick={onClose}/><aside className="detail-drawer access-user-drawer">
    <div className="drawer-header"><div><span className="eyebrow">{user.id}</span><h2>{user.name}</h2><p>{user.email} · {user.mobile}</p></div><button className="icon-button" onClick={onClose}><X/></button></div>
    <div className="drawer-summary"><AccessStatusBadge status={user.status}/><span>Role <b>{user.role}</b></span><span>Assigned to <b>{user.assignment}</b></span></div>
    <div className="drawer-tabs">{tabs.map(item=><button key={item} className={tab===item?'active':''} onClick={()=>setTab(item)}>{item}</button>)}</div>
    <div className="drawer-body">
      {tab==='Overview'&&<section className="detail-section"><h3>User profile</h3><div className="detail-grid">{[
        ['Full name',user.name],['Email',user.email],['Mobile',user.mobile],['Role',user.role],['Assigned entity / team',user.assignment],['Region',user.region||'—'],['Status',user.status],['Last active',user.lastActive],['Created',user.createdAt],['Manager / RM',user.manager||'Platform Admin'],
      ].map(([label,value])=><div key={label}><span>{label}</span><b>{value}</b></div>)}</div><div className="prototype-access-note"><ShieldCheck/><p><b>Frontend prototype access profile</b><span>These settings demonstrate intended permissions and do not enforce application security.</span></p></div></section>}
      {tab==='Role & Access'&&<div className="access-permission-list">{Object.entries(permissionOptions).map(([module,options])=>{const active=user.modulePermissions.find(item=>item.module===module)?.permissions||[];return <section className="detail-section" key={module}><div><h3>{module}</h3><small>{active.length?`${active.length} permissions enabled`:'No Access'}</small></div><div>{options.map(permission=><button key={permission} role="checkbox" aria-checked={active.includes(permission)} className={active.includes(permission)?'selected':''} onClick={()=>onTogglePermission(module,permission)}><i>{active.includes(permission)&&<Check/>}</i>{permission}</button>)}</div></section>})}</div>}
      {tab==='Product Access'&&<section className="detail-section"><h3>Accessible products</h3><p className="access-section-copy">Select the product areas represented in this prototype user profile.</p><div className="access-product-grid">{accessProducts.map(product=>{const active=user.productAccess.includes(product);return <button key={product} className={active?'selected':''} onClick={()=>onToggleProduct(product)}><i>{active&&<Check/>}</i><span>{product}</span><small>{active?'Access enabled':'No access'}</small></button>})}</div>{user.role==='Head Office Operations'&&<div className="prototype-access-note"><ShieldCheck/><p><b>Operations scope</b><span>The current Operations role remains limited to Insurance and Loan Protector outside this simulation.</span></p></div>}</section>}
      {tab==='Assignments'&&<section className="detail-section"><h3>Role-dependent assignments</h3><div className="access-assignment-grid"><div><span>Primary assignment</span><b>{user.assignment}</b></div><div><span>Region / Team</span><b>{user.region||'Not assigned'}</b></div><div><span>Manager / RM</span><b>{user.manager||'Platform Admin'}</b></div><div><span>Access scope</span><b>{user.role==='Admin'?'Platform-wide':user.role==='Relationship Manager'?'Assigned franchisees and portfolio':user.role==='Head Office Operations'?'Assigned operations queue':'Own customers and applications'}</b></div></div><button className="secondary-btn" onClick={onEdit}>Edit assignments</button></section>}
      {tab==='Activity'&&<section className="detail-section"><h3>Access activity</h3><div className="drawer-access-activity">{(userActivity.length?userActivity:[{id:'sign-in',title:'Last sign-in',description:user.lastActive,timestamp:user.lastActive}]).map(item=><div key={item.id}><span><Clock3/></span><p><b>{item.title}</b><small>{item.description} · {item.timestamp}</small></p></div>)}</div></section>}
    </div>
    <div className="drawer-actions"><button className="secondary-btn" onClick={onEdit}><Edit3/> Edit User</button>{user.status==='Pending Invite'?<button className="primary-btn" onClick={()=>onToast(`Invite resent to ${user.email}`)}><RefreshCw/> Resend Invite</button>:<button className="primary-btn" onClick={onToggleStatus}>{user.status==='Active'?'Deactivate User':'Activate User'}</button>}</div>
  </aside></>
}

interface UserDraft { name:string; email:string; mobile:string; role:UserAccessRole; assignment:string; region?:string; productAccess:ProductType[]; status:UserAccessStatus }

function UserForm({user,onClose,onSave}:{user:PlatformUser|null;onClose:()=>void;onSave:(draft:UserDraft)=>void}) {
  const [draft,setDraft]=useState<UserDraft>(user?{name:user.name,email:user.email,mobile:user.mobile,role:user.role,assignment:user.assignment,region:user.region,productAccess:[...user.productAccess],status:user.status}:{name:'',email:'',mobile:'',role:'Relationship Manager',assignment:'',region:'West',productAccess:productsForRole('Relationship Manager'),status:'Pending Invite'})
  const update=<K extends keyof UserDraft>(key:K,value:UserDraft[K])=>setDraft(current=>({...current,[key]:value}))
  const toggleProduct=(product:ProductType)=>update('productAccess',draft.productAccess.includes(product)?draft.productAccess.filter(item=>item!==product):[...draft.productAccess,product])
  return <><button className="drawer-scrim" onClick={onClose}/><aside className="form-drawer access-user-form"><div className="drawer-header"><div><span className="eyebrow">PLATFORM ACCESS</span><h2>{user?'Edit User':'Add User'}</h2><p>{user?'Update the local prototype profile.':'Invite a platform team or partner user.'}</p></div><button className="icon-button" onClick={onClose}><X/></button></div>
    <form onSubmit={event=>{event.preventDefault();onSave(draft)}}><label>Full Name<input required value={draft.name} onChange={event=>update('name',event.target.value)} placeholder="Full name"/></label><label>Email<input required type="email" value={draft.email} onChange={event=>update('email',event.target.value)} placeholder="name@company.in"/></label><label>Mobile<input required value={draft.mobile} onChange={event=>update('mobile',event.target.value)} placeholder="+91"/></label>
      <div className="form-row"><label>Role<select value={draft.role} onChange={event=>{const role=event.target.value as UserAccessRole;setDraft(current=>({...current,role,productAccess:productsForRole(role)}))}}>{roles.map(role=><option key={role}>{role}</option>)}</select></label><label>Status / Invite<select value={draft.status} onChange={event=>update('status',event.target.value as UserAccessStatus)}>{statuses.map(status=><option key={status}>{status}</option>)}</select></label></div>
      <label>{draft.role==='Franchisee User'?'Franchisee':draft.role==='Head Office Operations'?'Department':'Assigned To'}<input required value={draft.assignment} onChange={event=>update('assignment',event.target.value)} placeholder={draft.role==='Franchisee User'?'Select partner name':draft.role==='Head Office Operations'?'Operations team':'Head Office or portfolio'}/></label>
      {draft.role!=='Admin'&&<label>{draft.role==='Relationship Manager'?'Region / Assigned Franchisees':'Region / Team'}<input value={draft.region||''} onChange={event=>update('region',event.target.value)} placeholder="Region or team"/></label>}
      {draft.role==='Admin'?<div className="prototype-access-note"><ShieldCheck/><p><b>Full platform access</b><span>Admin permissions are represented across every prototype module.</span></p></div>:<fieldset className="access-form-products"><legend>Product Access</legend><div>{accessProducts.map(product=><label key={product}><input type="checkbox" checked={draft.productAccess.includes(product)} onChange={()=>toggleProduct(product)}/><span>{product}</span></label>)}</div></fieldset>}
      <div className="form-actions"><button type="button" className="secondary-btn" onClick={onClose}>Cancel</button><button className="primary-btn">{user?'Save Changes':draft.status==='Pending Invite'?'Add & Send Invite':'Add User'}</button></div>
    </form></aside></>
}

function initials(name:string):string { return name.split(' ').map(part=>part[0]).join('').slice(0,2).toUpperCase() }
