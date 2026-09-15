import { useState, type ReactNode } from 'react'
import { ArrowLeft, BadgeCheck, BriefcaseBusiness, ChevronRight, Plus, Store, UsersRound } from 'lucide-react'
import { SearchBox, Select, StatusBadge } from '../components/UI'
import { formatINR } from '../data/mockData'
import type { AdminCustomer } from '../data/adminCustomersData'
import { assignmentEligibility, assignmentProgress, buildAgentBusinessLines, onboardingStatus, type AgentBusinessLine, type FranchiseeAgent } from '../franchisee/agentOnboarding'
import { currentFranchiseeId, type FranchiseeEmployee } from '../franchisee/employees'
import { subFranchiseeRelationshipService } from '../franchisee/services/subFranchiseeRelationshipService'
import { authenticatedFranchisee, subFranchiseeService } from '../franchisee/services/subFranchiseeService'
import type { FranchiseeCustomer, FranchiseeStore } from '../franchisee/types'
import type { SubFranchisee } from '../franchisee/subFranchiseeTypes'
import type { Application, Franchisee } from '../types'
import './AdminFranchiseDetail.css'

export type FranchiseSection='sub-franchisees'|'employees'|'agents'|'customers'|'business-lines'

export interface AdminFranchiseScope {
  connected:boolean
  employees:FranchiseeEmployee[]
  agents:FranchiseeAgent[]
  subFranchisees:SubFranchisee[]
  customers:AdminCustomer[]
  workspaceCustomers:FranchiseeCustomer[]
  businessLines:AgentBusinessLine[]
}

export function buildAdminFranchiseScope(item:Franchisee,employees:FranchiseeEmployee[],agents:FranchiseeAgent[],adminCustomers:AdminCustomer[],store:FranchiseeStore):AdminFranchiseScope {
  // The legacy Admin record FR-0101 is the Admin-side ID for this ID-backed franchise workspace.
  // Once connected, every child relationship is filtered with its persisted ownership ID.
  const connected=item.code==='FR-0101'
  const ownedEmployees=connected?employees.filter(employee=>employee.franchiseeId===currentFranchiseeId):[]
  const ownedAgents=connected?agents.filter(agent=>agent.franchiseeId===currentFranchiseeId):[]
  const subFranchisees=connected?subFranchiseeService.list().filter(row=>row.parentFranchiseeId===authenticatedFranchisee.id):[]
  const enabledProducts=connected?store.products.filter(product=>product.enabled&&store.mappings.find(mapping=>mapping.productId===product.id)?.enabled!==false):[]
  return {
    connected,
    employees:ownedEmployees,
    agents:ownedAgents,
    subFranchisees,
    customers:adminCustomers.filter(customer=>customer.franchisee===item.name),
    workspaceCustomers:connected?store.customers:[],
    businessLines:buildAgentBusinessLines(enabledProducts),
  }
}

export function AdminFranchiseDetail({item,scope,store,applications,section='sub-franchisees',selectedId,onBack,onNavigate}:{item:Franchisee;scope:AdminFranchiseScope;store:FranchiseeStore;applications:Application[];section?:FranchiseSection;selectedId?:string;onBack:()=>void;onNavigate:(page:string)=>void}){
  const base=`onboarding/franchisees/${encodeURIComponent(item.code)}`
  if(section==='sub-franchisees'&&selectedId){
    const sub=scope.subFranchisees.find(row=>row.id===decodeURIComponent(selectedId))
    return sub?<AdminSubFranchiseDetail item={item} sub={sub} scope={scope} store={store} onBack={()=>onNavigate(`${base}/sub-franchisees`)} onNavigate={onNavigate}/>:<Unavailable label="Sub-Franchisee" onBack={()=>onNavigate(`${base}/sub-franchisees`)}/>
  }
  if(section==='business-lines'&&selectedId){
    const line=scope.businessLines.find(row=>row.id===decodeURIComponent(selectedId))
    return line?<AdminBusinessLineDetail item={item} line={line} scope={scope} store={store} onBack={()=>onNavigate(`${base}/business-lines`)} onNavigate={onNavigate}/>:<Unavailable label="Business Line" onBack={()=>onNavigate(`${base}/business-lines`)}/>
  }
  const cards:[FranchiseSection,string,number,ReactNode][]=[
    ['sub-franchisees','Sub-Franchisees',scope.subFranchisees.length,<Store/>],
    ['employees','Employees',scope.employees.length,<UsersRound/>],
    ['agents','Agents',scope.agents.length,<BadgeCheck/>],
    ['customers','Customers',scope.customers.length,<UsersRound/>],
    ['business-lines','Business Lines',scope.businessLines.length,<BriefcaseBusiness/>],
  ]
  return <div className="page admin-onboarding-page onboarding-detail admin-franchise-360">
    <button className="onboarding-back" onClick={onBack}><ArrowLeft/> Back to Franchisees</button>
    <header><div><span>{item.code} · FRANCHISEE 360</span><h1>{item.name}</h1><p>{item.city} · Relationship Manager: {item.rm}</p></div><StatusBadge status={item.status}/></header>
    <section className="panel franchise-360-overview"><div className="panel-head"><div><b>Franchisee Information</b><small>Current Admin record and connected network configuration</small></div></div><div className="franchise-360-info"><Info label="Franchisee ID" value={item.code}/><Info label="Location" value={item.city}/><Info label="Relationship Manager" value={item.rm}/><Info label="Status" value={item.status}/><Info label="Applications" value={String(item.applications)}/><Info label="Pending Cases" value={String(item.pending)}/><Info label="Business" value={formatINR(item.business)}/><Info label="Configured Business Lines" value={scope.businessLines.map(line=>line.name).join(', ')||'Not configured'}/></div></section>
    <nav className="franchise-360-cards" aria-label="Franchisee related records">{cards.map(([id,label,count,icon])=><button key={id} className={section===id?'active':''} aria-pressed={section===id} onClick={()=>onNavigate(`${base}/${id}`)}><i>{icon}</i><span>{label}</span><b>{count}</b><ChevronRight/></button>)}</nav>
    {section==='sub-franchisees'&&<SubFranchiseList rows={scope.subFranchisees} scope={scope} onAdd={scope.connected?()=>onNavigate(`${base}/sub-franchisees/new`):undefined} onView={sub=>onNavigate(`${base}/sub-franchisees/${encodeURIComponent(sub.id)}`)}/>} 
    {section==='employees'&&<EmployeeList rows={scope.employees} subFranchisees={scope.subFranchisees} onAdd={scope.connected?()=>onNavigate(`${base}/employees/new`):undefined} onView={employee=>onNavigate(`${base}/employees/${encodeURIComponent(employee.id)}`)}/>} 
    {section==='agents'&&<AgentList rows={scope.agents} subFranchisees={scope.subFranchisees} onAdd={scope.connected?()=>onNavigate(`${base}/agents/new`):undefined} onView={agent=>onNavigate(`${base}/agents/${encodeURIComponent(agent.id)}`)}/>} 
    {section==='customers'&&<CustomerList rows={scope.customers} applications={applications} onOpen={customer=>onNavigate(`customers/${encodeURIComponent(customer.id)}/360`)}/>} 
    {section==='business-lines'&&<BusinessLineList rows={scope.businessLines} scope={scope} store={store} onView={line=>onNavigate(`${base}/business-lines/${encodeURIComponent(line.id)}`)}/>} 
  </div>
}

function SubFranchiseList({rows,scope,onAdd,onView}:{rows:SubFranchisee[];scope:AdminFranchiseScope;onAdd?:()=>void;onView:(row:SubFranchisee)=>void}){
  const [search,setSearch]=useState(''),[status,setStatus]=useState('All Statuses')
  const visible=rows.filter(row=>(status==='All Statuses'||row.status===status)&&`${row.firmName} ${row.code} ${row.contactPerson} ${row.mobile} ${row.city}`.toLowerCase().includes(search.toLowerCase()))
  return <Section title="Sub-Franchisees" count={visible.length} action={onAdd&&<AddButton label="Add Sub-Franchisee" onClick={onAdd}/>} controls={<><SearchBox value={search} onChange={setSearch} placeholder="Search Sub-Franchisee"/><Select value={status} onChange={setStatus}>{['All Statuses','Active','Pending Approval','Inactive','Rejected'].map(value=><option key={value}>{value}</option>)}</Select></>}><AdminTable headers={['Sub-Franchisee','Contact','Location','Employees','Agents','Customers','Business Lines','Status','Action']} empty={!visible.length} emptyText="No Sub-Franchisees found for this Franchisee.">{visible.map(row=>{const employees=subFranchiseeRelationshipService.employees(row.id,scope.employees),agents=subFranchiseeRelationshipService.agents(row.id,scope.agents),customerIds=mappedCustomerIds(employees,agents);return <tr key={row.id}><td><b>{row.firmName}</b><small>{row.code}</small></td><td><b>{row.contactPerson}</b><small>{row.mobile} · {row.email}</small></td><td><b>{row.city}, {row.state}</b><small>{row.territory}</small></td><td>{employees.length}</td><td>{agents.length}</td><td>{scope.workspaceCustomers.filter(customer=>customerIds.has(customer.id)).length}</td><td><Compact values={row.products}/></td><td><StatusBadge status={row.status}/></td><td><ViewButton onClick={()=>onView(row)}/></td></tr>})}</AdminTable></Section>
}

function EmployeeList({rows,subFranchisees,onAdd,onView}:{rows:FranchiseeEmployee[];subFranchisees:SubFranchisee[];onAdd?:()=>void;onView:(row:FranchiseeEmployee)=>void}){
  const [search,setSearch]=useState(''),[status,setStatus]=useState('All Statuses')
  const visible=rows.filter(row=>(status==='All Statuses'||row.status===status)&&`${employeeName(row)} ${row.employeeId} ${row.mobile} ${row.email} ${row.role}`.toLowerCase().includes(search.toLowerCase()))
  return <Section title="Employees" count={visible.length} action={onAdd&&<AddButton label="Add Employee" onClick={onAdd}/>} controls={<><SearchBox value={search} onChange={setSearch} placeholder="Search employee, ID or contact"/><Select value={status} onChange={setStatus}>{['All Statuses','Active','On Leave','Inactive','Exited'].map(value=><option key={value}>{value}</option>)}</Select></>}><AdminTable headers={['Employee','Contact','Role / Designation','Ownership','Business Lines','Customers','Status','Action']} empty={!visible.length} emptyText="No Employees found for this Franchisee.">{visible.map(row=><tr key={row.id}><td><b>{employeeName(row)}</b><small>{row.employeeId}</small></td><td><b>{row.mobile}</b><small>{row.email}</small></td><td><b>{row.role}</b><small>{row.designation}</small></td><td>{ownership(row.subFranchiseeId,subFranchisees)}</td><td><Compact values={row.assignedProducts}/></td><td>{row.assignedCustomerIds.length}</td><td><StatusBadge status={row.status}/></td><td><ViewButton onClick={()=>onView(row)}/></td></tr>)}</AdminTable></Section>
}

function AgentList({rows,subFranchisees,onAdd,onView}:{rows:FranchiseeAgent[];subFranchisees:SubFranchisee[];onAdd?:()=>void;onView:(row:FranchiseeAgent)=>void}){
  const [search,setSearch]=useState(''),[line,setLine]=useState('All Business Lines'),[status,setStatus]=useState('All Statuses')
  const lines=[...new Set(rows.flatMap(row=>row.assignments.map(value=>value.businessLine)))]
  const visible=rows.filter(row=>(line==='All Business Lines'||row.assignments.some(value=>value.businessLine===line))&&(status==='All Statuses'||agentStatus(row)===status)&&`${row.name} ${row.agentCode} ${row.mobile} ${row.email}`.toLowerCase().includes(search.toLowerCase()))
  return <Section title="Agents" count={visible.length} action={onAdd&&<AddButton label="Add Agent" onClick={onAdd}/>} controls={<><SearchBox value={search} onChange={setSearch} placeholder="Search agent, code or contact"/><Select value={line} onChange={setLine}>{['All Business Lines',...lines].map(value=><option key={value}>{value}</option>)}</Select><Select value={status} onChange={setStatus}>{['All Statuses','Active','Onboarding'].map(value=><option key={value}>{value}</option>)}</Select></>}><AdminTable headers={['Agent','Contact','Agent Type','Ownership','Business Lines','Customers','Compliance','Status','Action']} empty={!visible.length} emptyText="No Agents found for this Franchisee.">{visible.map(row=><tr key={row.id}><td><b>{row.name}</b><small>{row.agentCode}</small></td><td><b>{row.mobile}</b><small>{row.email}</small></td><td>{row.designation}</td><td>{ownership(row.subFranchiseeId,subFranchisees)}</td><td><Compact values={row.assignments.map(value=>value.businessLine)}/></td><td>{row.assignedCustomerIds?.length||0}</td><td><StatusBadge status={complianceStatus(row)}/></td><td><StatusBadge status={agentStatus(row)}/></td><td><ViewButton onClick={()=>onView(row)}/></td></tr>)}</AdminTable></Section>
}

function CustomerList({rows,applications,onOpen}:{rows:AdminCustomer[];applications:Application[];onOpen:(row:AdminCustomer)=>void}){
  const [search,setSearch]=useState(''),[kyc,setKyc]=useState('All KYC')
  const visible=rows.filter(row=>(kyc==='All KYC'||row.kycStatus===kyc)&&`${row.name} ${row.id} ${row.mobile} ${row.email} ${row.source}`.toLowerCase().includes(search.toLowerCase()))
  return <Section title="Customers" count={visible.length} controls={<><SearchBox value={search} onChange={setSearch} placeholder="Search customer, ID or contact"/><Select value={kyc} onChange={setKyc}>{['All KYC','Complete','Pending','Needs Review','Not Started'].map(value=><option key={value}>{value}</option>)}</Select></>}><AdminTable headers={['Customer','Contact','Source','Insurance Premium','Investments','Loans','KYC','Action']} empty={!visible.length} emptyText="No Customers found for this Franchisee.">{visible.map(row=>{const related=applications.filter(application=>application.customer===row.name&&application.franchisee===row.franchisee),insurance=related.filter(application=>application.product==='Insurance'),investments=related.filter(application=>['Mutual Fund','Demat','Research','Advisory'].includes(application.product)),loans=related.filter(application=>['Loans','Loan Protector'].includes(application.product));return <tr key={row.id}><td><b>{row.name}</b><small>{row.id}</small></td><td><b>{row.mobile}</b><small>{row.email}</small></td><td>{row.source}</td><td>{moneyTotal(insurance)}</td><td>{moneyTotal(investments)}</td><td>{moneyTotal(loans)}</td><td><StatusBadge status={row.kycStatus}/></td><td><button className="onboarding-view" onClick={()=>onOpen(row)}>Open 360</button></td></tr>})}</AdminTable></Section>
}

function BusinessLineList({rows,scope,store,onView}:{rows:AgentBusinessLine[];scope:AdminFranchiseScope;store:FranchiseeStore;onView:(row:AgentBusinessLine)=>void}){
  const [search,setSearch]=useState('')
  const visible=rows.filter(row=>`${row.name} ${productsForLine(row,store).map(product=>product.name).join(' ')}`.toLowerCase().includes(search.toLowerCase()))
  return <Section title="Business Lines" count={visible.length} controls={<SearchBox value={search} onChange={setSearch} placeholder="Search business line or product"/>}><AdminTable headers={['Business Line','Products / Categories','Status','Agents','Employees','Customers','Action']} empty={!visible.length} emptyText="No Business Lines configured for this Franchisee.">{visible.map(row=>{const relatedEmployees=employeesForLine(row,scope.employees,store),relatedAgents=scope.agents.filter(agent=>agent.assignments.some(value=>value.businessLineId===row.id)),relatedCustomers=customersForLine(row,scope.customers,store);return <tr key={row.id}><td><b>{row.name}</b><small>{row.id}</small></td><td><Compact values={productsForLine(row,store).map(product=>product.name)}/></td><td><StatusBadge status="Active"/></td><td>{relatedAgents.length}</td><td>{relatedEmployees.length}</td><td>{relatedCustomers.length}</td><td><ViewButton onClick={()=>onView(row)}/></td></tr>})}</AdminTable></Section>
}

function AdminSubFranchiseDetail({item,sub,scope,store,onBack,onNavigate}:{item:Franchisee;sub:SubFranchisee;scope:AdminFranchiseScope;store:FranchiseeStore;onBack:()=>void;onNavigate:(page:string)=>void}){
  const [tab,setTab]=useState<'Overview'|'Employees'|'Agents'|'Customers'|'Business Lines'>('Overview')
  const employees=subFranchiseeRelationshipService.employees(sub.id,scope.employees),agents=subFranchiseeRelationshipService.agents(sub.id,scope.agents),customerIds=mappedCustomerIds(employees,agents),customers=scope.workspaceCustomers.filter(customer=>customerIds.has(customer.id)),base=`onboarding/franchisees/${encodeURIComponent(item.code)}`
  const openAdminCustomer=(customer:FranchiseeCustomer)=>scope.customers.find(row=>row.email===customer.email||row.mobile===customer.mobile)
  return <div className="page admin-onboarding-page onboarding-detail admin-franchise-360"><button className="onboarding-back" onClick={onBack}><ArrowLeft/> Back to {item.name}</button><header><div><span>{item.code} / {sub.code} · SUB-FRANCHISEE</span><h1>{sub.firmName}</h1><p>{sub.contactPerson} · {sub.city}, {sub.state}</p></div><StatusBadge status={sub.status}/></header><section className="onboarding-detail-stats"><article><span>Employees</span><b>{employees.length}</b></article><article><span>Agents</span><b>{agents.length}</b></article><article><span>Customers</span><b>{customers.length}</b></article><article><span>Business Lines</span><b>{sub.products.length}</b></article><article><span>KYC</span><b>{sub.kycStatus}</b></article></section><Tabs values={['Overview','Employees','Agents','Customers','Business Lines']} current={tab} set={value=>setTab(value as typeof tab)}/>
    {tab==='Overview'&&<section className="panel franchise-360-overview"><div className="panel-head"><b>Sub-Franchisee Information</b></div><div className="franchise-360-info"><Info label="Sub-Franchisee ID" value={sub.code}/><Info label="Parent Franchise" value={item.name}/><Info label="Contact Person" value={sub.contactPerson}/><Info label="Mobile" value={sub.mobile}/><Info label="Email" value={sub.email}/><Info label="Location" value={`${sub.city}, ${sub.state}`}/><Info label="Onboarding Date" value={date(sub.dateAdded)}/><Info label="Effective Date" value={date(sub.effectiveDate)}/><Info label="KYC Status" value={sub.kycStatus}/><Info label="Status" value={sub.status}/></div></section>}
    {tab==='Employees'&&<EmployeeList rows={employees} subFranchisees={scope.subFranchisees} onView={employee=>onNavigate(`${base}/employees/${encodeURIComponent(employee.id)}`)}/>} 
    {tab==='Agents'&&<AgentList rows={agents} subFranchisees={scope.subFranchisees} onView={agent=>onNavigate(`${base}/agents/${encodeURIComponent(agent.id)}`)}/>} 
    {tab==='Customers'&&<Section title="Customers" count={customers.length}><AdminTable headers={['Customer','Contact','Products','Open Cases','KYC','Action']} empty={!customers.length} emptyText="No Customers are mapped to this Sub-Franchisee.">{customers.map(customer=>{const adminCustomer=openAdminCustomer(customer),openCases=store.cases.filter(record=>record.customerId===customer.id&&!['Completed','Rejected','Approved / Issued'].includes(record.status)).length;return <tr key={customer.id}><td><b>{customer.name}</b><small>{customer.id}</small></td><td><b>{customer.mobile}</b><small>{customer.email}</small></td><td><Compact values={customer.products}/></td><td>{openCases}</td><td><StatusBadge status={customer.kyc}/></td><td>{adminCustomer?<button className="onboarding-view" onClick={()=>onNavigate(`customers/${encodeURIComponent(adminCustomer.id)}/360`)}>Open 360</button>:<span className="franchise-360-unavailable">Admin 360 unavailable</span>}</td></tr>})}</AdminTable></Section>}
    {tab==='Business Lines'&&<Section title="Business Lines" count={sub.products.length}><AdminTable headers={['Business Line / Product','Status','Action']} empty={!sub.products.length} emptyText="No Business Lines configured for this Sub-Franchisee.">{sub.products.map(product=>{const line=scope.businessLines.find(value=>value.name===product||productsForLine(value,store).some(item=>item.name===product));return <tr key={product}><td><b>{product}</b></td><td><StatusBadge status="Active"/></td><td>{line?<ViewButton onClick={()=>onNavigate(`${base}/business-lines/${encodeURIComponent(line.id)}`)}/>:<span>—</span>}</td></tr>})}</AdminTable></Section>}
  </div>
}

function AdminBusinessLineDetail({item,line,scope,store,onBack,onNavigate}:{item:Franchisee;line:AgentBusinessLine;scope:AdminFranchiseScope;store:FranchiseeStore;onBack:()=>void;onNavigate:(page:string)=>void}){
  const products=productsForLine(line,store),employees=employeesForLine(line,scope.employees,store),agents=scope.agents.filter(agent=>agent.assignments.some(value=>value.businessLineId===line.id)),customers=customersForLine(line,scope.customers,store),base=`onboarding/franchisees/${encodeURIComponent(item.code)}`
  return <div className="page admin-onboarding-page onboarding-detail admin-franchise-360"><button className="onboarding-back" onClick={onBack}><ArrowLeft/> Back to Business Lines</button><header><div><span>{item.code} · BUSINESS LINE</span><h1>{line.name}</h1><p>Configured for {item.name}</p></div><StatusBadge status="Active"/></header><section className="onboarding-detail-stats"><article><span>Products</span><b>{products.length}</b></article><article><span>Employees</span><b>{employees.length}</b></article><article><span>Agents</span><b>{agents.length}</b></article><article><span>Customers</span><b>{customers.length}</b></article></section><section className="panel franchise-360-overview"><div className="panel-head"><b>Configuration</b></div><div className="franchise-360-info"><Info label="Business Line" value={line.name}/><Info label="Status" value="Active"/><Info label="Products" value={products.map(product=>product.name).join(', ')||'None configured'}/><Info label="Requirements" value={`${line.requirements.length} configured`}/></div></section><Section title="Assigned Employees" count={employees.length}><AdminTable headers={['Employee','Contact','Role','Status','Action']} empty={!employees.length} emptyText="No Employees are assigned to this Business Line.">{employees.map(employee=><tr key={employee.id}><td><b>{employeeName(employee)}</b><small>{employee.employeeId}</small></td><td><b>{employee.mobile}</b><small>{employee.email}</small></td><td>{employee.role}</td><td><StatusBadge status={employee.status}/></td><td><ViewButton onClick={()=>onNavigate(`${base}/employees/${encodeURIComponent(employee.id)}`)}/></td></tr>)}</AdminTable></Section><Section title="Assigned Agents" count={agents.length}><AdminTable headers={['Agent','Contact','Compliance','Eligibility','Action']} empty={!agents.length} emptyText="No Agents are assigned to this Business Line.">{agents.map(agent=>{const assignment=agent.assignments.find(value=>value.businessLineId===line.id)!;return <tr key={agent.id}><td><b>{agent.name}</b><small>{agent.agentCode}</small></td><td><b>{agent.mobile}</b><small>{agent.email}</small></td><td>{assignmentProgress(assignment)}%</td><td><StatusBadge status={assignmentEligibility(assignment)}/></td><td><ViewButton onClick={()=>onNavigate(`${base}/agents/${encodeURIComponent(agent.id)}`)}/></td></tr>})}</AdminTable></Section><Section title="Customers" count={customers.length}><AdminTable headers={['Customer','Contact','Products','KYC','Action']} empty={!customers.length} emptyText="No Customers are associated with this Business Line.">{customers.map(customer=><tr key={customer.id}><td><b>{customer.name}</b><small>{customer.id}</small></td><td><b>{customer.mobile}</b><small>{customer.email}</small></td><td><Compact values={customer.productInterests}/></td><td><StatusBadge status={customer.kycStatus}/></td><td><button className="onboarding-view" onClick={()=>onNavigate(`customers/${encodeURIComponent(customer.id)}/360`)}>Open 360</button></td></tr>)}</AdminTable></Section></div>
}

function Section({title,count,action,controls,children}:{title:string;count:number;action?:ReactNode;controls?:ReactNode;children:ReactNode}){return <section className="panel franchise-360-section"><div className="panel-head"><div><b>{title}</b><small>{count} record{count===1?'':'s'} in the selected scope</small></div>{action}</div>{controls&&<div className="franchise-360-toolbar">{controls}</div>}{children}</section>}
function AdminTable({headers,children,empty,emptyText}:{headers:string[];children:ReactNode;empty?:boolean;emptyText?:string}){return <div className="onboarding-table-wrap"><table className="onboarding-table franchise-360-table"><thead><tr>{headers.map(header=><th key={header}>{header}</th>)}</tr></thead><tbody>{empty?<tr><td colSpan={headers.length}><div className="franchise-360-empty"><UsersRound/><b>{emptyText}</b></div></td></tr>:children}</tbody></table></div>}
function Tabs({values,current,set}:{values:string[];current:string;set:(value:string)=>void}){return <nav className="onboarding-tabs">{values.map(value=><button key={value} className={current===value?'active':''} onClick={()=>set(value)}>{value}</button>)}</nav>}
function Info({label,value}:{label:string;value:string}){return <article><span>{label}</span><b>{value||'—'}</b></article>}
function ViewButton({onClick}:{onClick:()=>void}){return <button className="onboarding-view" title="View full detail" onClick={onClick}>View <ChevronRight/></button>}
function AddButton({label,onClick}:{label:string;onClick:()=>void}){return <button className="primary-btn franchise-360-add" onClick={onClick}><Plus/> {label}</button>}
function Compact({values}:{values:string[]}){return <span className="onboarding-compact"><b>{values.slice(0,2).join(', ')||'None'}</b>{values.length>2&&<small>+{values.length-2} more</small>}</span>}
function Unavailable({label,onBack}:{label:string;onBack:()=>void}){return <div className="page onboarding-missing"><Store/><h2>{label} unavailable</h2><p>The requested record does not belong to the selected Franchisee.</p><button className="primary-btn" onClick={onBack}><ArrowLeft/> Back</button></div>}
function ownership(subFranchiseeId:string|undefined,subs:SubFranchisee[]){if(!subFranchiseeId)return 'Direct Franchise';const sub=subs.find(row=>row.id===subFranchiseeId);return sub?`Sub-Franchise: ${sub.firmName}`:'Sub-Franchise'}
function mappedCustomerIds(employees:FranchiseeEmployee[],agents:FranchiseeAgent[]){return new Set([...employees.flatMap(employee=>employee.assignedCustomerIds),...agents.flatMap(agent=>agent.assignedCustomerIds||[])])}
function employeeName(employee:FranchiseeEmployee){return [employee.firstName,employee.middleName,employee.lastName].filter(Boolean).join(' ')}
function agentStatus(agent:FranchiseeAgent){return onboardingStatus(agent)==='Eligible / Active'?'Active':'Onboarding'}
function complianceStatus(agent:FranchiseeAgent){const status=onboardingStatus(agent);return status==='Eligible / Active'?'Complete':status==='Pending Verification'?'Verification Required':'Pending'}
function productsForLine(line:AgentBusinessLine,store:FranchiseeStore){return store.products.filter(product=>line.productIds.includes(product.id))}
function employeesForLine(line:AgentBusinessLine,employees:FranchiseeEmployee[],store:FranchiseeStore){const names=new Set(productsForLine(line,store).map(product=>product.name));names.add(line.name);return employees.filter(employee=>employee.assignedProducts.some(product=>names.has(product)))}
function customersForLine(line:AgentBusinessLine,customers:AdminCustomer[],store:FranchiseeStore){const products=productsForLine(line,store),names=new Set<string>([line.name,...products.map(product=>product.name),...products.map(product=>product.category)]);return customers.filter(customer=>customer.productInterests.some(product=>names.has(product)))}
function moneyTotal(rows:Application[]){const value=rows.reduce((sum,row)=>sum+row.amount,0);return value?formatINR(value):'—'}
function date(value:string){const parsed=new Date(`${value}T00:00:00`);return Number.isNaN(parsed.getTime())?value:parsed.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
