import { ArrowRight, ChevronDown, Search, X } from 'lucide-react'
import type { AppStatus } from '../types'

export function PageHeader({eyebrow,title,description,actions}:{eyebrow?:string,title:string,description:string,actions?:React.ReactNode}) {
  return <div className="page-header"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1><p>{description}</p></div>{actions && <div className="page-actions">{actions}</div>}</div>
}

export function StatusBadge({status}:{status:string}) {
  const key = status.toLowerCase().replaceAll(' ','-')
  return <span className={`status status-${key}`}><i/>{status}</span>
}

export function StatCard({label,value,meta,tone='navy',onClick,icon}:{label:string,value:string|number,meta:string,tone?:string,onClick?:()=>void;icon?:React.ReactNode}) {
  return <button className={`stat-card tone-${tone}`} onClick={onClick}>{icon&&<i className="stat-card-icon">{icon}</i>}<span>{label}</span><strong>{value}</strong><small>{meta}</small>{onClick && <ArrowRight size={17}/>}</button>
}

export function SearchBox({value,onChange,placeholder='Search'}:{value:string,onChange:(v:string)=>void,placeholder?:string}) {
  return <label className="search-box"><Search size={18}/><input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>{value && <button onClick={()=>onChange('')}><X size={15}/></button>}</label>
}

export function Select({value,onChange,children,label}:{value:string,onChange:(v:string)=>void,children:React.ReactNode,label?:string}) {
  return <label className="select-wrap">{label && <span>{label}</span>}<select value={value} onChange={e=>onChange(e.target.value)}>{children}</select><ChevronDown size={15}/></label>
}

export const statusTone = (status: AppStatus) => ['Completed','Approved'].includes(status) ? 'green' : ['Delayed','Rejected','Escalated'].includes(status) ? 'red' : status === 'Action Required' ? 'amber' : 'navy'
