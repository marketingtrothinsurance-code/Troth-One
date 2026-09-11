import { useEffect, useState, type ReactNode } from 'react'
import { Download, Eye, HandCoins, Search, ShieldCheck, X } from 'lucide-react'
import { rmCommissionService, type RMCommissionRule } from './commissionService'
import { rmRepository } from './service'

interface Props {franchiseContext:string;globalSearch:string;onToast:(message:string)=>void}
const money=(value:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(value)
const commissionValue=(rule:RMCommissionRule)=>rule.calculationType==='Percentage'?`${rule.rate}%`:money(rule.rate)
const xmlEscape=(value:string|number)=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')

function Chip({children,tone='neutral'}:{children:ReactNode;tone?:string}){return <span className={`rm-chip ${tone}`}>{children}</span>}

export function RMCommissionPayoutPage({franchiseContext,globalSearch,onToast}:Props){
 const rules=rmCommissionService.list()
 const [search,setSearch]=useState(globalSearch)
 const [product,setProduct]=useState('all')
 const [company,setCompany]=useState('all')
 const [franchise,setFranchise]=useState(franchiseContext)
 const [businessType,setBusinessType]=useState('all')
 const [status,setStatus]=useState('all')
 const [selected,setSelected]=useState<RMCommissionRule>()
 useEffect(()=>{setSearch(globalSearch);setFranchise(franchiseContext)},[globalSearch,franchiseContext])

 const products=[...new Set(rules.map(rule=>rule.product))]
 const companies=[...new Set(rules.map(rule=>rule.provider))]
 const rows=rules.filter(rule=>(product==='all'||rule.product===product)&&(company==='all'||rule.provider===company)&&(franchise==='all'||rule.franchiseId===franchise)&&(businessType==='all'||rule.transactionType===businessType)&&(status==='all'||rule.status===status)&&`${rule.id} ${rule.name} ${rule.vertical} ${rule.product} ${rule.provider} ${rule.franchiseName} ${rule.remarks}`.toLowerCase().includes(search.trim().toLowerCase()))
 const uniqueRules=new Set(rows.map(rule=>rule.id)).size
 const reset=()=>{setSearch(globalSearch);setProduct('all');setCompany('all');setFranchise(franchiseContext);setBusinessType('all');setStatus('all')}
 const downloadExcel=()=>{
  const headers=['Rule ID','Slab Name','Category','Product','Company / Provider','Franchise','Business Type','Criteria / Condition','Calculation Type','Commission Value','Franchise Share','HO Share','RM / Agent Share','Effective From','Effective To','Status']
  const values=rows.map(rule=>[rule.id,rule.name,rule.vertical,rule.product,rule.provider,rule.franchiseName,rule.transactionType,rule.remarks,rule.calculationType,commissionValue(rule),`${rule.franchiseSharePercent}%`,`${rule.hoSharePercent}%`,`${rule.agentSharePercent}%`,rule.effectiveFrom,rule.effectiveTo||'Open ended',rule.status])
  const table=[headers,...values].map((row,index)=>`<Row>${row.map(value=>`<Cell><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`).join('')}</Row>`).join('')
  const workbook=`<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Commission Matrix"><Table>${table}</Table></Worksheet></Workbook>`
  const url=URL.createObjectURL(new Blob([workbook],{type:'application/vnd.ms-excel;charset=utf-8'})),anchor=document.createElement('a');anchor.href=url;anchor.download='rm-commission-matrix.xls';anchor.click();URL.revokeObjectURL(url);onToast(`${rows.length} filtered commission rows downloaded`)
 }

 return <>
  <div className="rm-page-header rm-commission-header"><div><small>COMMISSION REFERENCE · READ ONLY</small><h1>Commission & Payouts</h1><p>Review the Admin-configured commission matrix applicable to your allocated franchise network.</p></div><button className="rm-commission-download" onClick={downloadExcel}><Download/> Download Excel</button></div>
  <section className="rm-commission-kpis"><article><HandCoins/><span><small>Configured Rules</small><b>{uniqueRules}</b><em>Admin commission slabs</em></span></article><article><ShieldCheck/><span><small>Active Rules</small><b>{new Set(rows.filter(rule=>rule.status==='Active').map(rule=>rule.id)).size}</b><em>Effective configuration</em></span></article><article><span><small>Products</small><b>{new Set(rows.map(rule=>rule.product)).size}</b><em>Filtered matrix coverage</em></span></article><article><span><small>Allocated Franchises</small><b>{new Set(rows.map(rule=>rule.franchiseId)).size}</b><em>Within RM responsibility</em></span></article></section>
  <div className="rm-commission-filters"><label className="search"><span>Search</span><div><Search/><input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Rule, product, provider or criteria"/></div></label><Select label="Product" value={product} set={setProduct} options={['all',...products]}/><Select label="Company / Provider" value={company} set={setCompany} options={['all',...companies]}/><Select label="Franchise" value={franchise} set={setFranchise} options={['all',...rmRepository.franchises().map(item=>item.id)]} labels={Object.fromEntries(rmRepository.franchises().map(item=>[item.id,item.name]))}/><Select label="Business Type" value={businessType} set={setBusinessType} options={['all','New Business','Renewal']}/><Select label="Status" value={status} set={setStatus} options={['all','Active','Inactive']}/><button onClick={reset}>Reset</button></div>
  <section className="rm-panel rm-commission-panel"><div className="rm-panel-head"><div><b>Commission Structure</b><small>{rows.length} applicable rows · {uniqueRules} unique Admin-configured rules</small></div><span className="rm-readonly-badge"><ShieldCheck/> Read only</span></div><div className="rm-table-wrap"><table><thead><tr><th>Slab / Rule</th><th>Category / Product</th><th>Company / Provider</th><th>Franchise</th><th>Business Type</th><th>Criteria / Condition</th><th>Commission Type</th><th>Commission Value</th><th>Effective Period</th><th>Status</th><th>Action</th></tr></thead><tbody>{rows.map(rule=><tr key={`${rule.id}-${rule.franchiseId}`}><td><b>{rule.name}</b><small>{rule.id} · {rule.scope}</small></td><td><b>{rule.vertical}</b><small>{rule.product}</small></td><td>{rule.provider}</td><td><b>{rule.franchiseName}</b><small>{rule.franchiseId}</small></td><td>{rule.transactionType}</td><td>{rule.remarks||'Admin-configured standard slab'}</td><td>{rule.calculationType}</td><td><b className="rm-commission-value">{commissionValue(rule)}</b><small>Franchise share {rule.franchiseSharePercent}%</small></td><td>{rule.effectiveFrom}<small>to {rule.effectiveTo||'Open ended'}</small></td><td><Chip tone={rule.status==='Active'?'green':'neutral'}>{rule.status}</Chip></td><td><button className="rm-commission-view" onClick={()=>setSelected(rule)}><Eye/> View Rule</button></td></tr>)}</tbody></table>{!rows.length&&<div className="rm-empty"><Search/><b>No matching commission rules</b><span>Change the product, company, franchise, or status filters.</span></div>}</div></section>
  {selected&&<RuleDrawer rule={selected} close={()=>setSelected(undefined)}/>} 
 </>
}

function Select({label,value,set,options,labels={}}:{label:string;value:string;set:(value:string)=>void;options:string[];labels?:Record<string,string>}){return <label><span>{label}</span><select value={value} onChange={event=>set(event.target.value)}>{options.map(option=><option key={option} value={option}>{labels[option]||option.replace(/^all$/,'All')}</option>)}</select></label>}

function RuleDrawer({rule,close}:{rule:RMCommissionRule;close:()=>void}){const facts:[string,string][]=[['Rule ID',rule.id],['Slab name',rule.name],['Category',rule.vertical],['Product',rule.product],['Company / provider',rule.provider],['Applicable franchise',`${rule.franchiseName} · ${rule.franchiseId}`],['Business type',rule.transactionType],['Calculation type',rule.calculationType],['Commission value',commissionValue(rule)],['Franchise share',`${rule.franchiseSharePercent}%`],['HO share',`${rule.hoSharePercent}%`],['RM / Agent share',`${rule.agentSharePercent}%`],['Effective from',rule.effectiveFrom],['Effective to',rule.effectiveTo||'Open ended'],['Status',rule.status],['Last configured',`${rule.updatedAt} · ${rule.updatedBy}`]];return <><button className="rm-drawer-scrim rm-commission-scrim" onClick={close} aria-label="Close rule detail"/><aside className="rm-drawer wide rm-commission-drawer"><header><div><b>{rule.name}</b><small>{rule.id} · Admin-configured commission rule</small></div><button onClick={close} aria-label="Close"><X/></button></header><div className="rm-drawer-body"><div className="rm-commission-readonly"><ShieldCheck/><span><b>Read-only commission reference</b>HO Finance and Admin remain responsible for rate configuration and accuracy.</span><Chip tone={rule.status==='Active'?'green':'neutral'}>{rule.status}</Chip></div><div className="rm-commission-facts">{facts.map(([label,value])=><div key={label}><small>{label}</small><b>{value}</b></div>)}</div><section className="rm-commission-criteria"><h3>Criteria & condition</h3><p>{rule.remarks||'Admin-configured standard commission slab.'}</p><div><span><small>Applicable scope</small><b>{rule.scope}</b></span><span><small>Effective period</small><b>{rule.effectiveFrom} to {rule.effectiveTo||'Open ended'}</b></span></div></section><div className="rm-notice"><Eye/>This page cannot add, edit, delete, activate, or deactivate commission rules.</div></div></aside></>}
