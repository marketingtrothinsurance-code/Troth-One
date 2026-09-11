import { useMemo, useState } from 'react'
import { ArrowRight, BellRing, CalendarDays, Gift, Landmark, Megaphone, Newspaper, ShieldCheck, Sparkles, TrendingUp, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PageHeader, SearchBox, StatusBadge } from '../components/UI'
import { customerDashboardRepository } from '../services/customerDashboardService'
import type { CustomerPromotion } from '../data/customerDashboardData'

const categoryIcons:Record<CustomerPromotion['category'],LucideIcon>={Offers:Gift,News:Newspaper,Announcements:Megaphone,Insurance:ShieldCheck,Loans:Landmark,Investments:TrendingUp,'Service Updates':BellRing}
const promotions=customerDashboardRepository.listPromotions()

export function CustomerOffersUpdates({onNavigate}:{onNavigate:(page:string)=>void}){
  const [category,setCategory]=useState('All'),[search,setSearch]=useState(''),[selected,setSelected]=useState<CustomerPromotion>()
  const featured=promotions.find(item=>item.isFeatured&&item.status!=='Expired')
  const categories=['All',...Array.from(new Set(promotions.map(item=>item.category)))]
  const visible=useMemo(()=>promotions.filter(item=>(category==='All'||item.category===category)&&`${item.title} ${item.description} ${item.category}`.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>Number(a.status==='Expired')-Number(b.status==='Expired')),[category,search])
  const runAction=(item:CustomerPromotion)=>{if(item.filter)sessionStorage.setItem('troth-product-filter',item.filter);onNavigate(item.target)}
  return <div className="page customer-offers-page">
    <PageHeader eyebrow="CUSTOMER COMMUNICATIONS" title="Offers & Updates" description="Latest offers, announcements, product updates and important information from Troth."/>
    {featured&&<section className={`customer-offer-featured offer-tone-${featured.tone}`}><div><span>{featured.label}</span><h2>{featured.title}</h2><p>{featured.description}</p><div className="offer-date"><CalendarDays/> Valid till {featured.validTo}</div><button onClick={()=>setSelected(featured)}>View details <ArrowRight/></button></div><div className="offer-featured-mark"><Gift/></div></section>}
    <section className="customer-offers-controls"><SearchBox value={search} onChange={setSearch} placeholder="Search offers & updates"/><div className="customer-offer-filters">{categories.map(item=><button className={category===item?'active':''} onClick={()=>setCategory(item)} key={item}>{item}</button>)}</div></section>
    <div className="section-heading"><div><h2>{category==='All'?'All offers & updates':category}</h2><p>{visible.length} item{visible.length===1?'':'s'} available</p></div></div>
    {visible.length?<section className="customer-offers-grid">{visible.map(item=>{const Icon=categoryIcons[item.category];return <article className={item.status==='Expired'?'expired':''} key={item.id}><div className="offer-card-top"><span className={`offer-card-icon offer-tone-${item.tone}`}><Icon/></span><div><small>{item.category}</small><span>Published {item.publishedDate}</span></div><div className="offer-badges">{item.isNew&&<em>New</em>}{item.isImportant&&<em className="important">Important</em>}</div></div><h3>{item.title}</h3><p>{item.description}</p><div className="offer-card-foot"><span>{item.validTo?`Valid till ${item.validTo}`:'No expiry date'}</span><StatusBadge status={item.status}/></div><button className="offer-detail-link" onClick={()=>setSelected(item)}>View details <ArrowRight/></button></article>})}</section>:<section className="customer-offers-empty"><Sparkles/><h3>No matching updates</h3><p>Try another category or clear your search.</p><button onClick={()=>{setCategory('All');setSearch('')}}>Clear filters</button></section>}
    {selected&&<OfferDetail item={selected} onClose={()=>setSelected(undefined)} onAction={()=>runAction(selected)}/>} 
  </div>
}

function OfferDetail({item,onClose,onAction}:{item:CustomerPromotion;onClose:()=>void;onAction:()=>void}){
  const Icon=categoryIcons[item.category]
  return <div className="modal-wrap"><button className="modal-scrim" onClick={onClose}/><section className="modal customer-offer-modal"><div className="modal-heading"><div className="modal-icon"><Icon/></div><div><span className="eyebrow">{item.category.toUpperCase()}</span><h2>{item.title}</h2></div><button className="icon-button" onClick={onClose}><X/></button></div><div className="offer-detail-meta"><span><b>Published</b>{item.publishedDate}</span>{item.validTo&&<span><b>Valid until</b>{item.validTo}</span>}<span><b>Status</b><StatusBadge status={item.status}/></span>{item.product&&<span><b>Related product</b>{item.product}</span>}</div><div className="offer-detail-copy"><h3>About this update</h3><p>{item.description}</p>{item.terms?.length&&<><h3>Important information</h3><ul>{item.terms.map(term=><li key={term}>{term}</li>)}</ul></>}</div><div className="offer-help"><BellRing/><p><b>Need help?</b><span>Use Customer Support for product or service assistance.</span></p></div><div className="form-actions"><button className="secondary-btn" onClick={onClose}>Close</button>{item.status!=='Expired'&&<button className="primary-btn" onClick={onAction}>{item.actionLabel} <ArrowRight/></button>}</div></section></div>
}
