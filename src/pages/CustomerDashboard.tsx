import { useState } from 'react'
import { ArrowRight, Calculator, ChevronRight, CircleDollarSign, FileText, GraduationCap, Headphones, HeartPulse, Home, Landmark, MessageCircle, PiggyBank, Plus, RefreshCw, ShieldCheck, TrendingUp, Upload, WalletCards } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Application } from '../types'
import { formatINR } from '../data/mockData'
import { customerDashboardRepository } from '../services/customerDashboardService'
import { StatusBadge } from '../components/UI'

interface Props { apps:Application[]; onNavigate:(page:string,filter?:string)=>void; onToast:(message:string)=>void }

const products = [
  {name:'Mutual Funds',value:'₹18.75 L',meta:'3 folios',filter:'Mutual Funds',icon:TrendingUp,tone:'blue'},
  {name:'Insurance',value:'3 policies',meta:'All active',filter:'Insurance',icon:ShieldCheck,tone:'green'},
  {name:'Loans',value:'₹22.50 L',meta:'2 active loans',filter:'Loans',icon:Landmark,tone:'navy'},
  {name:'Loan Protector',value:'1 active cover',meta:'₹20 L protected',filter:'Loan Protector',icon:HeartPulse,tone:'violet'},
  {name:'Demat Account',value:'Active',meta:'Client ID: TRO•••4821',filter:'Demat',icon:WalletCards,tone:'cyan'},
  {name:'PMS / AIF',value:'₹3.20 L',meta:'2 investments',filter:'PMS / AIF',icon:CircleDollarSign,tone:'purple'},
  {name:'Bonds',value:'₹2.75 L',meta:'3 investments',filter:'Bonds',icon:PiggyBank,tone:'amber'},
  {name:'Research / Advisory',value:'Active',meta:'Renews 15 Oct 2026',filter:'Research / Advisory',icon:FileText,tone:'slate'}
]

const goals:Array<[string,number,string,LucideIcon]> = [
  ['Retirement',68,'₹20.4 L of ₹30 L',PiggyBank],['Child education',44,'₹8.8 L of ₹20 L',GraduationCap],['Emergency fund',82,'₹4.1 L of ₹5 L',ShieldCheck],['Home upgrade',31,'₹4.7 L of ₹15 L',Home]
]
const quickActions:Array<[LucideIcon,string,string]> = [[Calculator,'Plan your future','calculator'],[TrendingUp,'Explore products','my-products'],[Plus,'Start application','my-products'],[Upload,'Upload document','documents'],[MessageCircle,'Request callback','support'],[Headphones,'Service request','support']]
const promotions=customerDashboardRepository.listPromotions()
const installments=customerDashboardRepository.listInstallments()

export function CustomerDashboard({apps,onNavigate,onToast}:Props) {
  const [period,setPeriod]=useState('6M')
  const [activePromotion,setActivePromotion]=useState(0)
  const pending=apps.filter(app=>app.pendingAction!=='None'&&!['Completed','Rejected'].includes(app.status))
  const promotion=promotions[activePromotion]
  const goProducts=(filter?:string)=>{if(filter)sessionStorage.setItem('troth-product-filter',filter);onNavigate('my-products')}
  const openPromotion=()=>{if(promotion.filter)sessionStorage.setItem('troth-product-filter',promotion.filter);onNavigate(promotion.target)}

  return <div className="page customer-dashboard customer-dashboard-clean">
    <section className={`customer-promotion customer-promotion-${promotion.tone}`} aria-label="Troth offers and news">
      <div className="promotion-content"><span>{promotion.label}</span><h1>{promotion.title}</h1><p>{promotion.description}</p><button onClick={openPromotion}>{promotion.actionLabel} <ArrowRight/></button></div>
      <div className="promotion-mark"><ShieldCheck/></div>
      <div className="promotion-controls">{promotions.map((item,index)=><button key={item.id} className={index===activePromotion?'active':''} onClick={()=>setActivePromotion(index)} aria-label={`Show ${item.title}`}/>)}</div>
    </section>

    <div className="section-heading"><div><h2>Overview</h2><p>Your key numbers at a glance</p></div></div>
    <section className="customer-number-grid">
      <button onClick={()=>goProducts('Insurance')}><span><ShieldCheck/></span><small>Policies</small><strong>03</strong></button>
      <button onClick={()=>goProducts('Mutual Funds')}><span><TrendingUp/></span><small>Investments</small><strong>₹18.75 L</strong></button>
      <button onClick={()=>goProducts('Loans')}><span><Landmark/></span><small>Active Loans</small><strong>02</strong></button>
      <button onClick={()=>goProducts()}><span><WalletCards/></span><small>Products</small><strong>08</strong></button>
      <button onClick={()=>onNavigate('applications','Action Required')}><span><Upload/></span><small>Pending Actions</small><strong>{String(pending.length).padStart(2,'0')}</strong></button>
      <button onClick={()=>document.getElementById('upcoming-installments')?.scrollIntoView({behavior:'smooth'})}><span><RefreshCw/></span><small>Installments</small><strong>{String(installments.length).padStart(2,'0')}</strong></button>
    </section>

    <section className="customer-card upcoming-installments-card" id="upcoming-installments">
      <div className="customer-card-head"><div><h2>Upcoming Installments</h2><p>Premiums, EMIs, SIPs and renewals in one place</p></div><button onClick={()=>onToast('Complete installment schedule opened')}>View all <ArrowRight/></button></div>
      <div className="installment-table"><div className="installment-head"><span>Product</span><span>Type</span><span>Due Date</span><span>Amount</span><span>Status</span><span>Action</span></div>{installments.map(item=><div className="installment-row" key={item.id}><span data-label="Product"><i><CircleDollarSign/></i><span><b>{item.productName}</b><small>{item.reference}</small></span></span><span data-label="Type">{item.type}</span><span data-label="Due Date">{item.dueDate}</span><strong data-label="Amount">{formatINR(item.amount)}</strong><span data-label="Status"><StatusBadge status={item.status}/></span><button onClick={()=>item.action==='Renew'?goProducts('Insurance'):onToast(`${item.productName} ${item.action.toLowerCase()} action opened`)}>{item.action}</button></div>)}</div>
    </section>

    <section className="customer-row customer-overview-row">
      <div className="customer-card products-overview"><div className="customer-card-head"><div><h2>My Products Overview</h2><p>All your products in one place</p></div><button onClick={()=>goProducts()}>View all <ArrowRight/></button></div><div className="customer-product-grid">{products.map(({name,value,meta,filter,icon:Icon,tone})=><button key={name} onClick={()=>goProducts(filter)}><span className={`customer-product-icon ${tone}`}><Icon/></span><span><b>{name}</b><strong>{value}</strong><small>{meta}</small></span><ChevronRight/></button>)}</div></div>
      <div className="customer-card portfolio-card"><div className="customer-card-head"><div><h2>Portfolio Value Trend</h2><p>Current value <b>₹18,75,430</b></p></div></div><div className="period-tabs">{['1M','3M','6M','1Y'].map(item=><button className={period===item?'active':''} onClick={()=>setPeriod(item)} key={item}>{item}</button>)}</div><div className="portfolio-change"><b>+₹1,09,480</b><span>+6.20% in selected period</span></div><svg className="line-chart" viewBox="0 0 420 160" preserveAspectRatio="none" aria-label="Portfolio value trend"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#315efb" stopOpacity=".22"/><stop offset="1" stopColor="#315efb" stopOpacity="0"/></linearGradient></defs><g className="chart-grid"><line x1="0" y1="30" x2="420" y2="30"/><line x1="0" y1="80" x2="420" y2="80"/><line x1="0" y1="130" x2="420" y2="130"/></g><path className="chart-area" d="M0,126 C45,120 58,98 95,105 S145,116 170,83 S225,63 254,74 S315,49 340,56 S385,28 420,34 L420,160 L0,160 Z"/><path className="chart-line" d="M0,126 C45,120 58,98 95,105 S145,116 170,83 S225,63 254,74 S315,49 340,56 S385,28 420,34"/><circle cx="420" cy="34" r="5"/></svg><div className="chart-labels"><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Sep</span></div></div>
      <div className="customer-card allocation-card"><div className="customer-card-head"><div><h2>Asset Allocation</h2><p>By current value</p></div></div><div className="allocation-donut"><div><strong>₹24.7 L</strong><small>Total value</small></div></div><div className="allocation-legend">{[['Mutual Funds','51%','blue'],['PMS / AIF','21%','violet'],['Bonds','18%','green'],['Other','10%','slate']].map(([name,value,tone])=><div key={name}><i className={tone}/><span>{name}</span><b>{value}</b></div>)}</div></div>
    </section>

    <section className="customer-card action-required-card customer-dashboard-actions"><div className="customer-card-head"><div><span className="attention-label">ACTION REQUIRED</span><h2>{pending.length||2} items need your attention</h2><p>Complete these to keep applications moving</p></div><button onClick={()=>onNavigate('applications','Action Required')}>View all <ArrowRight/></button></div><div className="customer-action-list">{(pending.length?pending:apps.slice(0,2)).slice(0,3).map((app,index)=><div key={app.id}><span className="action-product-icon"><Upload/></span><div><small>{app.product} • {app.id}</small><b>{app.pendingAction==='None'?(index?'Complete KYC':'Upload salary slip'):app.pendingAction}</b><span>Pending since {index?'31 Aug':'30 Aug'} 2026</span></div><button onClick={()=>onToast('Document upload opened')}>{app.pendingAction.toLowerCase().includes('confirm')?'Respond':'Upload document'}</button></div>)}</div></section>

    <section className="customer-bottom-row"><div className="customer-card goals-card"><div className="customer-card-head"><div><h2>My Goals</h2><p>Progress towards what matters to you</p></div><button onClick={()=>onToast('Goals workspace opened')}>Manage goals</button></div><div className="goals-grid">{goals.map(([name,progress,amount,Icon])=><div key={String(name)}><span><Icon/></span><div><p><b>{String(name)}</b><strong>{Number(progress)}%</strong></p><div className="goal-bar"><i style={{width:`${progress}%`}}/></div><small>{String(amount)}</small></div></div>)}</div></div><div className="customer-card quick-actions-card"><div className="customer-card-head"><div><h2>Quick Actions</h2><p>Common things you may need</p></div></div><div className="customer-quick-grid">{quickActions.map(([Icon,label,target])=><button key={label} onClick={()=>{if(target==='my-products')sessionStorage.setItem('troth-product-focus','explore');onNavigate(target)}}><span><Icon/></span>{label}</button>)}</div></div></section>
    <section className="advisory-banner"><div className="banner-art"><ShieldCheck/></div><div><span>SMART PROTECTION CHECK</span><h2>Protect your home loan and your family’s future</h2><p>You have an active home loan. A Loan Protector can help cover the outstanding amount during unforeseen events.</p></div><button onClick={()=>goProducts('Loan Protector')}>Explore Loan Protector <ArrowRight/></button></section>
  </div>
}
